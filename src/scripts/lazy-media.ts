const SELECTOR = '[data-lazy-media]';

const observedElements = new WeakSet<Element>();

let observer: IntersectionObserver | undefined;

function loadMedia(element: Element): void {
	if (element instanceof HTMLImageElement) {
		const src = element.dataset.src;

		if (!src) return;

		element.src = src;

		delete element.dataset.src;
		delete element.dataset.lazyMedia;

		return;
	}

	if (element instanceof HTMLVideoElement) {
		const poster = element.dataset.poster;

		if (poster) {
			element.poster = poster;
			delete element.dataset.poster;
		}

		element.querySelectorAll<HTMLSourceElement>('source[data-src]').forEach((source) => {
			const src = source.dataset.src;

			if (!src) return;

			source.src = src;
			delete source.dataset.src;
		});

		delete element.dataset.lazyMedia;

		// Start native resource selection and autoplay.
		element.load();
	}
}

export function initLazyMedia(root: ParentNode = document): void {
	const elements = root.querySelectorAll(SELECTOR);

	if (!elements.length) return;

	if (!('IntersectionObserver' in window)) {
		elements.forEach(loadMedia);
		return;
	}

	observer ??= new IntersectionObserver(
		(entries) => {
			entries.forEach((entry) => {
				if (!entry.isIntersecting) return;

				observer?.unobserve(entry.target);

				loadMedia(entry.target);
			});
		},
		{
			rootMargin: '100px 0px',
			threshold: 0,
		},
	);

	elements.forEach((element) => {
		if (observedElements.has(element)) return;

		observedElements.add(element);
		observer?.observe(element);
	});
}
