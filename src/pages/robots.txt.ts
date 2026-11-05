import type { APIRoute } from 'astro';

export const GET: APIRoute = ({ site }) => {
	if (!site) throw new Error('astro.config: "site" is required');

	const sitemapUrl = new URL('sitemap.xml', site);

	const robotsTxt = [
		'User-agent: *',
		'Content-Signal: search=yes, ai-input=yes, ai-train=no, use=reference',
		'Allow: /',
		'',
		`Sitemap: ${sitemapUrl.href}`,
		'',
	].join('\n');

	return new Response(robotsTxt, {
		headers: { 'Content-Type': 'text/plain; charset=utf-8' },
	});
};
