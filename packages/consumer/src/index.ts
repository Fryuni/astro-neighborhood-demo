import { defineIntegration, withPlugins } from 'astro-integration-kit';
import sitemap from '@demo/sitemap';
import { z } from 'astro/zod';

export default defineIntegration({
  name: '@demo/consumer',
  optionsSchema: z.never().optional(),
  setup({ name }) {
    return withPlugins({
      name,
      plugins: [sitemap.asPlugin('sitemapApi')],
      hooks: {
        'astro:config:setup': ({ sitemapApi, injectRoute, config }) => {
          injectRoute({
            pattern: '/added-route',
            entrypoint: '@demo/consumer/entripoint',
            prerender: false,
          });

          // Using AIK the API is available as a plugin
          sitemapApi?.addExtraPage('/added-route');

          // Get the API without using AIK
          const noAikApi = sitemap.fromConfig(config);
          noAikApi?.addExtraPage('/added-route');
        },
      }
    });
  },
});
