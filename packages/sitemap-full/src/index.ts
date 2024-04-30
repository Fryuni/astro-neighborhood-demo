import { defineIntegration, execLibHookSync } from '@demo/helpers';
import sitemap from '@astrojs/sitemap';
import { z } from 'astro/zod';

export default defineIntegration({
	name: '@demo/sitemap',
	optionsSchema: z.never().optional(),
	setup() {
		const extraPages: string[] = [];

		return {
			hooks: {
				'astro:config:setup': ({ updateConfig, config }) => {
					updateConfig({
						integrations: [
							sitemap({
								customPages: extraPages,
								filter: (page) => {
									let keepPage = true;

									execLibHookSync(config.integrations, 'sitemap:pageCandidate', {
										page,
										omitPage: () => {
											keepPage = false;
										},
									});

									return keepPage;
								},
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
