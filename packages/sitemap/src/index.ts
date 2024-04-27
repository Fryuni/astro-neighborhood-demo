import { defineIntegration } from '@demo/helpers';
import { addIntegration } from 'astro-integration-kit';
import sitemap from '@astrojs/sitemap';
import { z } from 'astro/zod';

export default defineIntegration({
  name: '@demo/sitemap',
  optionsSchema: z.never().optional(),
  setup() {
    const extraPages: string[] = [];

    return {
      hooks: {
        'astro:config:setup': params => {
          addIntegration(params, {
            integration: sitemap({
              customPages: extraPages,
            }),
          });
        },
      },
      addExtraPage(page: string) {
        extraPages.push(page);
      }
    };
  },
});
