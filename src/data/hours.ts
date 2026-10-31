import schedule from '../content/opening-hours.json';
import { ui } from '../config/ui';

export const locale = 'uk-UA';
export const timeZone = 'Europe/Kyiv';

const days = [
	{ key: 'mon', weekday: 1 },
	{ key: 'tue', weekday: 2 },
	{ key: 'wed', weekday: 3 },
	{ key: 'thu', weekday: 4 },
	{ key: 'fri', weekday: 5 },
	{ key: 'sat', weekday: 6 },
	{ key: 'sun', weekday: 0 },
] as const;

// 1 Jan 2023 is Sunday, so day number = weekday index
const getDayName = (weekday: number) =>
	new Intl.DateTimeFormat(locale, { weekday: 'long', timeZone: 'UTC' }).format(
		new Date(Date.UTC(2023, 0, 1 + weekday)),
	);

export const getOpeningHours = () =>
	days.map(({ key, weekday }) => {
		const { open, close } = schedule[key];
		const isClosed = !open || !close;
		return {
			weekday,
			day: getDayName(weekday),
			time: isClosed ? ui.schedule.closedLabel : `${open} – ${close}`,
			isClosed,
		};
	});

export const highlightToday = () => {
	const today = new Date(new Date().toLocaleString('en-US', { timeZone })).getDay();
	document
		.querySelector(`[data-hours-table] [data-day="${today}"]`)
		?.classList.add('hours__row--today');
};
