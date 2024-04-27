import { defineIntegration, hookProviderPlugin } from '@demo/helpers';
import { addIntegration, withPlugins } from 'astro-integration-kit';
import sitemap from '@astrojs/sitemap';
import { z } from 'astro/zod';

export default defineIntegration({
  name: '@demo/sitemap',
  optionsSchema: z.never().optional(),
  setup({ name }) {
    const extraPages: string[] = [];

    return withPlugins({
      name,
      plugins: [hookProviderPlugin],
      hooks: {
        'astro:config:setup': params => {
          const { execLibHookSync } = params;

          addIntegration(params, {
            integration: sitemap({
              customPages: extraPages,
              filter: page => {
                let keepPage = true;

                execLibHookSync('sitemap:pageCandidate', {
                  page,
                  omitPage: () => {
                    keepPage = false;
                  }
                });

                return keepPage;
              }
            }),
          });
        },
      },
      addExtraPage(page: string) {
        extraPages.push(page);
      }
    });
  },
});
