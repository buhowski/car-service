const pageLoader = document.querySelector<HTMLElement>('[data-page-loader]');

if (pageLoader) {
	const hidePageLoader = () => pageLoader.classList.add('is-hidden');

	if (document.readyState === 'complete') {
		hidePageLoader();
	} else {
		window.addEventListener('load', hidePageLoader, { once: true });
	}

	window.setTimeout(hidePageLoader, 1800);
}
