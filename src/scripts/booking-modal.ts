type Status = 'idle' | 'loading' | 'success' | 'error';

declare global {
	interface Window {
		turnstile?: { reset: () => void };
	}
}

const REQUEST_TIMEOUT_MS = 10_000;

function init(): void {
	const dialog = document.querySelector<HTMLDialogElement>('[data-booking-modal]');
	const form = dialog?.querySelector<HTMLFormElement>('[data-booking-form]');
	const panel = dialog?.querySelector<HTMLElement>('.booking-modal__panel');
	const nameInput = form?.querySelector<HTMLInputElement>('#booking-name');
	const phoneInput = form?.querySelector<HTMLInputElement>('#booking-phone');
	const statusEl = form?.querySelector<HTMLElement>('[data-booking-status]');
	const submitButton = form?.querySelector<HTMLButtonElement>('button[type="submit"]');

	if (!dialog || !form || !panel || !nameInput || !phoneInput || !statusEl || !submitButton) return;

	const messages: Record<Exclude<Status, 'idle'>, string> = {
		loading: form.dataset.loadingMessage?.trim() || 'Надсилаємо заявку…',
		success: form.dataset.successMessage?.trim() || 'Заявку надіслано.',
		error: form.dataset.errorMessage?.trim() || 'Не вдалося надіслати заявку. Спробуй ще раз.',
	};

	function setStatus(state: Status): void {
		statusEl!.dataset.state = state;
		statusEl!.textContent = state === 'idle' ? '' : messages[state];
	}

	// ---- Dialog ----

	const isTouchDevice = window.matchMedia('(hover: none) and (pointer: coarse)').matches;

	document.addEventListener('click', (event) => {
		if (!(event.target instanceof Element)) return;
		if (!event.target.closest('[data-booking-open]')) return;

		event.preventDefault();

		if (dialog.open) return;

		setStatus('idle');
		document.body.classList.add('booking-modal-open');
		dialog.showModal();

		// On touch devices skip autofocus, otherwise the keyboard covers the form
		if (!isTouchDevice) nameInput.focus({ preventScroll: true });
	});

	// Fires on close(), Escape and form[method=dialog]
	dialog.addEventListener('close', () => {
		document.body.classList.remove('booking-modal-open');
	});

	// Close on outside click, but only if the press also started outside the panel
	// (prevents closing when text selection is dragged out of an input)
	let pressStartedOutside = false;

	dialog.addEventListener('pointerdown', (event) => {
		pressStartedOutside = event.target instanceof Node && !panel.contains(event.target);
	});

	dialog.addEventListener('click', (event) => {
		const target = event.target;

		if (!(target instanceof Element)) return;

		if (
			target.closest('[data-booking-close]') ||
			(pressStartedOutside && !panel.contains(target))
		) {
			dialog.close();
		}

		pressStartedOutside = false;
	});

	// ---- Phone mask (UX only, server normalizes again) ----

	phoneInput.addEventListener('input', () => {
		const oldValue = phoneInput.value;
		const oldCaret = phoneInput.selectionStart ?? oldValue.length;

		const rawDigits = oldValue.replace(/\D/g, '');
		const rawDigitsBeforeCaret = oldValue.slice(0, oldCaret).replace(/\D/g, '').length;

		const prefixLength = rawDigits.startsWith('380') ? 3 : rawDigits.startsWith('0') ? 1 : 0;
		const digits = rawDigits.slice(prefixLength, prefixLength + 9);

		const digitsBeforeCaret = Math.min(
			digits.length,
			Math.max(0, rawDigitsBeforeCaret - prefixLength),
		);

		const formatted = digits
			.replace(/^(\d{2})(\d)/, '$1 $2')
			.replace(/^(\d{2} \d{3})(\d)/, '$1 $2')
			.replace(/^(\d{2} \d{3} \d{2})(\d)/, '$1 $2');

		phoneInput.value = formatted;

		let caret = 0;
		let countedDigits = 0;

		while (caret < formatted.length && countedDigits < digitsBeforeCaret) {
			if (/\d/.test(formatted[caret])) countedDigits += 1;
			caret += 1;
		}

		if (formatted[caret] === ' ' && countedDigits < digits.length) caret += 1;

		phoneInput.setSelectionRange(caret, caret);
	});

	// ---- Submit ----

	form.addEventListener('submit', async (event) => {
		event.preventDefault();

		if (form.getAttribute('aria-busy') === 'true') return;

		form.setAttribute('aria-busy', 'true');
		submitButton.disabled = true;
		setStatus('loading');

		try {
			const response = await fetch(form.action, {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify(Object.fromEntries(new FormData(form))),
				// AbortSignal.timeout is missing in Safari < 16
				signal: 'timeout' in AbortSignal ? AbortSignal.timeout(REQUEST_TIMEOUT_MS) : undefined,
			});

			const result = (await response.json().catch(() => null)) as { ok?: boolean } | null;

			if (!response.ok || !result?.ok) {
				throw new Error(`Booking request failed: ${response.status}`);
			}

			form.reset();
			setStatus('success');
		} catch (error) {
			console.error(error);
			setStatus('error');
		} finally {
			submitButton.disabled = false;
			form.removeAttribute('aria-busy');
			// Turnstile tokens are single-use
			window.turnstile?.reset();
		}
	});
}

init();

export {};
