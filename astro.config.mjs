import { defineConfig } from 'astro/config';
import browserslist from 'browserslist';
import { browserslistToTargets } from 'lightningcss';

const isBuild = process.argv.includes('build');

// https://astro.build/config
export default defineConfig({
	site: process.env.SITE_URL ?? 'https://sto-porshen.pages.dev',
	output: 'static',
	build: {
		inlineStylesheets: 'auto',
	},
	vite: {
		css: {
			preprocessorOptions: {
				scss: {
					api: 'modern-compiler',
				},
			},
			// prefixes only in production build
			...(isBuild && {
				transformer: 'lightningcss',
				lightningcss: {
					targets: browserslistToTargets(browserslist()),
				},
			}),
		},
		build: {
			...(isBuild && { cssMinify: 'lightningcss' }),
		},
	},
});
