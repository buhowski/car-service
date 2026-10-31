import settings from '../content/site.json';
import { openingHours } from './openingHours';

const phoneHref = `tel:${settings.phoneNumber}`;
const formattedPhone = settings.phoneNumber.replace(
	/^\+380(\d{2})(\d{3})(\d{2})(\d{2})$/,
	'0$1 $2 $3 $4',
);
const addressLabel = settings.address;
const businessName = `${settings.brandPrefix} ${settings.brandName}`;

export const formatText = (template: string, values: Record<string, string | number>) =>
	template.replace(/\{(\w+)\}/g, (_, key: string) => String(values[key] ?? `{${key}}`));

const mapCoordinates = {
	lat: 49.8068669,
	lng: 24.0550478,
};

export const site = {
	name: businessName,
	brand: { prefix: settings.brandPrefix, name: settings.brandName },
	city: settings.city,
	phone: { display: formattedPhone, href: phoneHref },
	address: {
		full: addressLabel,
		mapLabel: addressLabel,
		mapsUrl: `https://maps.google.com/?q=${encodeURIComponent(addressLabel)}`,
		mapEmbedUrl: settings.mapEmbedUrl,
		coordinates: mapCoordinates,
		directionsUrl: `https://www.google.com/maps/dir/?api=1&destination=${mapCoordinates.lat}%2C${mapCoordinates.lng}&travelmode=driving`,
	},
	openingHours,
	links: {
		booking: phoneHref,
		services: '#services',
	},
	navigation: settings.navigation,
	socialLinks: settings.socialLinks.map((link) => ({
		...link,
		href:
			link.icon === 'viber'
				? `viber://chat?number=${encodeURIComponent(settings.phoneNumber)}`
				: link.icon === 'telegram'
					? `https://t.me/+${settings.phoneNumber.replace('+', '')}`
					: link.href,
		label: formatText(link.label, { name: businessName }),
	})),
} as const;

export const footerAbout = settings.footerAbout;
export const siteSettings = settings;
