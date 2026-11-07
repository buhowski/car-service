document.addEventListener('DOMContentLoaded', () => {
	const burger = document.querySelector<HTMLButtonElement>('[data-nav-toggle]');
	const menu = document.querySelector<HTMLElement>('[data-nav-menu]');
	const overlay = document.querySelector<HTMLElement>('[data-nav-overlay]');
	const closeBtn = document.querySelector<HTMLButtonElement>('[data-nav-close]');

	if (!burger || !menu) return;

	function open() {
		menu.classList.add('header__mobile--open');
		overlay?.classList.add('header__overlay--open');
		burger.classList.add('header__burger--open');
		burger.setAttribute('aria-expanded', 'true');
		document.body.classList.add('nav-lock');
	}

	function close() {
		menu.classList.remove('header__mobile--open');
		overlay?.classList.remove('header__overlay--open');
		burger.classList.remove('header__burger--open');
		burger.setAttribute('aria-expanded', 'false');
		document.body.classList.remove('nav-lock');
	}

	function toggle() {
		menu.classList.contains('header__mobile--open') ? close() : open();
	}

	burger.addEventListener('click', toggle);
	overlay?.addEventListener('click', close);
	closeBtn?.addEventListener('click', close);
	menu
		.querySelectorAll<HTMLAnchorElement>('[data-nav-link], [data-booking-open]')
		.forEach((link) => {
			link.addEventListener('click', close);
		});

	document.addEventListener('keydown', (e) => {
		if (e.key === 'Escape' && menu.classList.contains('header__mobile--open')) close();
	});
	const nav = document.querySelector<HTMLElement>('[data-site-header]');
	const sectionLinks = Array.from(
		document.querySelectorAll<HTMLAnchorElement>('[data-nav-link]'),
	).filter((link) => document.getElementById(link.hash.slice(1)));

	function updateActiveLink() {
		if (!sectionLinks.length) return;

		const activationLine = (nav?.getBoundingClientRect().height ?? 72) + 8;
		let activeSectionId: string | undefined;

		sectionLinks.forEach((link) => {
			const section = document.getElementById(link.hash.slice(1));
			if (section && section.getBoundingClientRect().top <= activationLine) {
				activeSectionId = section.id;
			}
		});

		const reachedPageBottom =
			window.innerHeight + window.scrollY >= document.documentElement.scrollHeight - 2;
		if (reachedPageBottom) activeSectionId = sectionLinks.at(-1)?.hash.slice(1);

		sectionLinks.forEach((link) => {
			const isActive = Boolean(activeSectionId && link.hash === `#${activeSectionId}`);
			link.classList.toggle('is-active', isActive);
			if (isActive) link.setAttribute('aria-current', 'location');
			else link.removeAttribute('aria-current');
		});
	}

	const onScroll = () => {
		nav?.classList.toggle('header--scrolled', window.scrollY > 20);
		updateActiveLink();
	};
	onScroll();
	window.addEventListener('scroll', onScroll, { passive: true });
	window.addEventListener('resize', updateActiveLink, { passive: true });
});
