import { defineIntegration } from '@demo/helpers';
import sitemap from '@astrojs/sitemap';
import { z } from 'astro/zod';

export default defineIntegration({
	name: '@demo/sitemap',
	optionsSchema: z.never().optional(),
	setup() {
		const extraPages: string[] = [];

		return {
			hooks: {
				'astro:config:setup': ({ updateConfig }) => {
					updateConfig({
						integrations: [
							sitemap({
								customPages: extraPages,
							}),
						],
					});
				},
			},
			addExtraPage(page: string) {
				extraPages.push(page);
			},
		};
	},
});
