import schedule from '../content/opening-hours.json';

export type OpeningScheduleGroup = (typeof schedule.groups)[number];
export const openingSchedule = schedule.groups;
export const closedLabel = schedule.closedLabel;
export type OpeningHour = {
	day: string;
	time: string;
	weekday: number;
	isClosed: boolean;
};

const weekdays = [1, 2, 3, 4, 5, 6, 0];
const formatWeekday = (weekday: number) =>
	new Intl.DateTimeFormat('uk-UA', { weekday: 'long', timeZone: 'UTC' }).format(
		new Date(Date.UTC(2023, 0, weekday)),
	);

const formatTime = (group: OpeningScheduleGroup) =>
	group.open && group.close ? `${group.open} – ${group.close}` : closedLabel;

export const openingHours: OpeningHour[] = weekdays.map((weekday) => {
	const group = openingSchedule.find((item) => item.days.includes(weekday));
	const isClosed = !group?.open || !group.close;
	return {
		day: formatWeekday(weekday),
		weekday,
		time: group ? formatTime(group) : closedLabel,
		isClosed,
	};
});
