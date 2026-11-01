import schedule from '../content/opening-hours.json';
import { ui } from './ui';

export const locale = 'uk-UA';
export const timeZone = 'Europe/Kyiv';

const days = [
	{ key: 'weekdays', weekday: 1, schemaDay: 'Monday' },
	{ key: 'weekdays', weekday: 2, schemaDay: 'Tuesday' },
	{ key: 'weekdays', weekday: 3, schemaDay: 'Wednesday' },
	{ key: 'weekdays', weekday: 4, schemaDay: 'Thursday' },
	{ key: 'weekdays', weekday: 5, schemaDay: 'Friday' },
	{ key: 'sat', weekday: 6, schemaDay: 'Saturday' },
	{ key: 'sun', weekday: 0, schemaDay: 'Sunday' },
] as const;

// 1 Jan 2023 is Sunday, so day number = weekday index
const getDayName = (weekday: number) =>
	new Intl.DateTimeFormat(locale, { weekday: 'long', timeZone: 'UTC' }).format(
		new Date(Date.UTC(2023, 0, 1 + weekday)),
	);

export const getOpeningHours = () =>
	days.map(({ key, weekday }) => {
		const { schedule: time } = schedule[key];
		const isClosed = !time;
		return {
			weekday,
			day: getDayName(weekday),
			time: isClosed ? ui.schedule.closedLabel : time,
			isClosed,
		};
	});

export const getOpeningHoursSpecifications = () => {
	const specifications = new Map<
		string,
		{ dayOfWeek: string[]; opens: string; closes: string }
	>();

	days.forEach(({ key, schemaDay }) => {
		const match = schedule[key].schedule.match(
			/^((?:[01]\d|2[0-3]):[0-5]\d)-((?:[01]\d|2[0-3]):[0-5]\d)$/,
		);
		if (!match) return;

		const [, opens, closes] = match;
		const specification = specifications.get(key) ?? { dayOfWeek: [], opens, closes };
		specification.dayOfWeek.push(schemaDay);
		specifications.set(key, specification);
	});

	return [...specifications.values()].map((specification) => ({
		'@type': 'OpeningHoursSpecification',
		...specification,
	}));
};

export const highlightToday = () => {
	const today = new Date(new Date().toLocaleString('en-US', { timeZone })).getDay();
	document
		.querySelector(`[data-hours-table] [data-day="${today}"]`)
		?.classList.add('hours__row--today');
};
