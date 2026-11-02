import settings from '../content/site.json';
import seo from '../content/seo.json';
import { ui } from './ui';

const phoneHref = `tel:${settings.phoneNumber}`;
const formattedPhone = settings.phoneNumber.replace(
	/^\+380(\d{2})(\d{3})(\d{2})(\d{2})$/,
	'0$1 $2 $3 $4',
);
const businessName = `${settings.brandPrefix} ${settings.brandName}`;
const phoneDigits = settings.phoneNumber.replace(/\D/g, '');
const addressLabel = settings.address;
const mapTargetGeo = settings.mapTarget || addressLabel;
const encodedTarget = encodeURIComponent(mapTargetGeo);

const textValues = {
	name: businessName,
	city: settings.city,
	phone: formattedPhone,
	address: addressLabel,
};

export const formatText = (template: string, values: Record<string, string | number> = {}) =>
	template.replace(/\{(\w+)\}/g, (_, key: string) =>
		String(values[key] ?? textValues[key as keyof typeof textValues] ?? `{${key}}`),
	);

export const site = {
	name: businessName,
	brand: { prefix: settings.brandPrefix, name: settings.brandName, image: seo.brandImage },
	city: settings.city,
	phone: { display: formattedPhone, href: phoneHref },
	address: {
		full: addressLabel,
		mapUrl: settings.mapUrl || `https://www.google.com/maps/search/?api=1&query=${encodedTarget}`,
		mapEmbedUrl:
			settings.mapEmbedUrl || `https://maps.google.com/maps?q=${encodedTarget}&output=embed`,
		directionsUrl: `https://www.google.com/maps/dir/?api=1&destination=${encodedTarget}&travelmode=driving`,
	},
	links: {
		booking: phoneHref,
		services: '#services',
	},
	navigation: settings.navigation.map(({ sectionId, label }) => ({
		href: `#${sectionId}`,
		label,
	})),
	socialLinks: {
		viber: {
			href: `viber://chat?number=%2B${phoneDigits}`,
			label: formatText(ui.common.viberLabel),
			icon: 'viber' as const,
		},
		telegram: {
			href: `https://t.me/+${phoneDigits}`,
			label: formatText(ui.common.telegramLabel),
			icon: 'telegram' as const,
		},
		instagram: {
			href: settings.instagram,
			label: formatText(ui.common.instagramLabel),
			icon: 'instagram' as const,
		},
	},
} as const;

export const footerAbout = settings.footerAbout;
export const siteSettings = settings;
