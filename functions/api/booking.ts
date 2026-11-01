import { ui } from '../../src/data/ui';

interface Env {
	TELEGRAM_BOT_TOKEN: string;
	TELEGRAM_CHAT_ID: string;
	TURNSTILE_SECRET_KEY: string;
}

interface PagesContext {
	request: Request;
	env: Env;
}

const MAX_BODY_SIZE = 4096;
const TELEGRAM_TIMEOUT_MS = 8000;
const TURNSTILE_TIMEOUT_MS = 5000;
const TURNSTILE_URL = 'https://challenges.cloudflare.com/turnstile/v0/siteverify';
const CONTACT_METHODS = new Set<string>(ui.booking.contactMethods);

function jsonResponse(data: { ok: boolean }, status = 200): Response {
	return new Response(JSON.stringify(data), {
		status,
		headers: {
			'Content-Type': 'application/json; charset=utf-8',
			'Cache-Control': 'no-store',
		},
	});
}

function getString(value: unknown): string {
	return typeof value === 'string' ? value.trim() : '';
}

function normalizeLine(value: string): string {
	return value.replace(/[\r\n\t]+/g, ' ').trim();
}

function escapeHtml(value: string): string {
	return value.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}

// Accepts "66 289 44 63", "066 289 44 63", "+380 66 289 44 63" etc. Returns "380XXXXXXXXX" or null
function normalizePhone(value: string): string | null {
	let digits = value.replace(/\D/g, '');

	if (digits.startsWith('380')) digits = digits.slice(3);
	else if (digits.startsWith('0')) digits = digits.slice(1);

	return /^[1-9]\d{8}$/.test(digits) ? `380${digits}` : null;
}

async function verifyTurnstile(token: string, secret: string, ip: string | null): Promise<boolean> {
	if (!token) return false;

	const body = new FormData();
	body.append('secret', secret);
	body.append('response', token);
	if (ip) body.append('remoteip', ip);

	try {
		const response = await fetch(TURNSTILE_URL, {
			method: 'POST',
			body,
			signal: AbortSignal.timeout(TURNSTILE_TIMEOUT_MS),
		});
		const result = (await response.json()) as { success?: boolean };

		return result.success === true;
	} catch (error) {
		console.error('Turnstile verification failed:', error);
		return false;
	}
}

export async function onRequest({ request, env }: PagesContext): Promise<Response> {
	if (request.method !== 'POST') {
		return jsonResponse({ ok: false }, 405);
	}

	const url = new URL(request.url);
	const origin = request.headers.get('Origin');

	if (origin && origin !== url.origin) {
		return jsonResponse({ ok: false }, 403);
	}

	if (!(request.headers.get('Content-Type') ?? '').toLowerCase().includes('application/json')) {
		return jsonResponse({ ok: false }, 415);
	}

	if (!env.TELEGRAM_BOT_TOKEN || !env.TELEGRAM_CHAT_ID || !env.TURNSTILE_SECRET_KEY) {
		console.error('Missing environment variables');
		return jsonResponse({ ok: false }, 500);
	}

	let payload: Record<string, unknown>;

	try {
		const body = await request.text();

		if (new TextEncoder().encode(body).byteLength > MAX_BODY_SIZE) {
			return jsonResponse({ ok: false }, 413);
		}

		const parsed: unknown = JSON.parse(body);

		if (!parsed || typeof parsed !== 'object' || Array.isArray(parsed)) {
			return jsonResponse({ ok: false }, 400);
		}

		payload = parsed as Record<string, unknown>;
	} catch {
		return jsonResponse({ ok: false }, 400);
	}

	// Honeypot: pretend success so bots don't retry
	if (getString(payload.website)) {
		return jsonResponse({ ok: true });
	}

	const name = normalizeLine(getString(payload.name));
	const fullPhone = normalizePhone(getString(payload.phone));
	const note = getString(payload.note);
	const contactMethod = getString(payload.contactMethod);

	const isValid =
		name.length >= 2 &&
		name.length <= 80 &&
		fullPhone !== null &&
		note.length <= 500 &&
		CONTACT_METHODS.has(contactMethod);

	if (!isValid || !fullPhone) {
		return jsonResponse({ ok: false }, 400);
	}

	const turnstileOk = await verifyTurnstile(
		getString(payload['cf-turnstile-response']),
		env.TURNSTILE_SECRET_KEY,
		request.headers.get('CF-Connecting-IP'),
	);

	if (!turnstileOk) {
		return jsonResponse({ ok: false }, 403);
	}

	const isLocal = url.hostname === 'localhost' || url.hostname === '127.0.0.1';
	const viberLink = `${url.origin}/viber?phone=${fullPhone}`;

	const message = [
		'\u2800',
		`<b>Ім’я:</b> ${escapeHtml(name)}`,
		`<b>Телефон:</b> +${fullPhone}`,
		`<b>Зв’язок:</b> ${escapeHtml(contactMethod)}`,
		...(note ? ['', '<b>Коментар:</b>', `<blockquote>${escapeHtml(note)}</blockquote>`] : []),
		'\u2800',
	].join('\n');

	try {
		const response = await fetch(
			`https://api.telegram.org/bot${env.TELEGRAM_BOT_TOKEN}/sendMessage`,
			{
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				signal: AbortSignal.timeout(TELEGRAM_TIMEOUT_MS),
				body: JSON.stringify({
					chat_id: env.TELEGRAM_CHAT_ID,
					text: message,
					parse_mode: 'HTML',
					disable_web_page_preview: true,
					reply_markup: {
						inline_keyboard: [
							[
								{ text: 'Telegram', url: `https://t.me/+${fullPhone}` },
								{ text: 'WhatsApp', url: `https://wa.me/${fullPhone}` },
								// Telegram rejects localhost URLs in buttons
								...(isLocal ? [] : [{ text: 'Viber', url: viberLink }]),
							],
						],
					},
				}),
			},
		);

		const result = (await response.json().catch(() => null)) as { ok?: boolean } | null;

		if (!response.ok || !result?.ok) {
			console.error('Telegram API error:', result);
			return jsonResponse({ ok: false }, 502);
		}

		return jsonResponse({ ok: true });
	} catch (error) {
		console.error('Telegram request failed:', error);
		return jsonResponse({ ok: false }, 502);
	}
}
