const PHONE_RE = /^380\d{9}$/;

export async function onRequest({ request }: { request: Request }): Promise<Response> {
	if (request.method !== 'GET' && request.method !== 'HEAD') {
		return new Response(null, { status: 405, headers: { Allow: 'GET, HEAD' } });
	}

	const phone = new URL(request.url).searchParams.get('phone') ?? '';

	if (!PHONE_RE.test(phone)) {
		return new Response('Invalid phone number', { status: 400 });
	}

	const link = `viber://chat?number=%2B${phone}`;

	const html = `<!doctype html>
<html lang="uk">
<head>
	<meta charset="utf-8">
	<meta name="viewport" content="width=device-width, initial-scale=1">
	<meta name="robots" content="noindex, nofollow">
	<title>Viber</title>
	<style>
		body{margin:0;min-height:100vh;display:grid;place-items:center;background:#121316;color:#fff;font-family:system-ui,sans-serif;text-align:center}
		a{color:#fff;font-size:18px}
		p{margin:12px 0 0;opacity:.6;font-size:14px}
	</style>
</head>
<body>
	<div>
		<a href="${link}">Відкрити Viber</a>
		<p>Якщо Viber не відкрився, відкрий його вручну й знайди +${phone}</p>
	</div>
	<script>location.replace(${JSON.stringify(link)});</script>
</body>
</html>`;

	return new Response(request.method === 'HEAD' ? null : html, {
		headers: {
			'Content-Type': 'text/html; charset=utf-8',
			'Cache-Control': 'no-store',
			'Referrer-Policy': 'no-referrer',
			'X-Robots-Tag': 'noindex, nofollow',
		},
	});
}
