import type { AstroConfig, AstroIntegration, HookParameters } from 'astro';
import { defineIntegration as aikDefiner, definePlugin, type Plugin } from 'astro-integration-kit';
import { z } from 'astro/zod';

export type AstroIntegrationSetupFn<
	Options extends z.ZodTypeAny,
	TApi = Record<string, never>,
> = (params: { name: string; options: z.output<Options> }) => Omit<AstroIntegration, 'name'> & TApi;

export type IntegrationFactory<
	TOptionsSchema extends z.ZodTypeAny,
	TApi = Record<string, never>,
> = (
	...args: [z.input<TOptionsSchema>] extends [never]
		? []
		: undefined extends z.input<TOptionsSchema>
			? [options?: z.input<TOptionsSchema>]
			: [options: z.input<TOptionsSchema>]
) => AstroIntegration & TApi;

type AllHookPlugin<TName extends string, TApi> = {
	[Hook in keyof Required<AstroIntegration['hooks']>]: (
		params: HookParameters<Hook>
	) => Record<TName, TApi | null>;
};

export type IntegrationApi<TName extends string, TApi> = {
	asPlugin<TAttr extends string>(attr: TAttr): Plugin<TName, AllHookPlugin<TAttr, TApi>>;
	fromConfig(config: AstroConfig): TApi | null;
	fromIntegrations(integrations: AstroIntegration[]): TApi | null;
	is(integration: AstroIntegration): integration is AstroIntegration & TApi;
};

export type NeighborIntegration<
	TName extends string,
	TOptionsSchema extends z.ZodTypeAny = z.ZodNever,
	TApi = Record<string, never>,
> = IntegrationFactory<TOptionsSchema, TApi> & IntegrationApi<TName, TApi>;

export function defineIntegration<
	TName extends string,
	TOptionsSchema extends z.ZodTypeAny = z.ZodNever,
	TApi = Record<string, never>,
>(params: {
	name: TName;
	optionsSchema?: TOptionsSchema;
	setup: AstroIntegrationSetupFn<TOptionsSchema, TApi>;
}): NeighborIntegration<TName, TOptionsSchema, TApi> {
	const factory = aikDefiner(params);

	const integrationSymbol = Symbol(params.name);

	const wrapper: IntegrationFactory<TOptionsSchema, TApi> = (...args) => {
		return Object.assign(factory(...args), { [integrationSymbol]: true });
	};

	const api: IntegrationApi<TName, TApi> = {
		is: (integration: any): integration is AstroIntegration & TApi =>
			integration[integrationSymbol] === true,
		fromIntegrations: (integrations) => integrations.find(api.is) ?? null,
		fromConfig: (config) => api.fromIntegrations(config.integrations),
		asPlugin: <TAttr extends string>(attr: TAttr) =>
			definePlugin({
				name: params.name,
				setup() {
					const pluginApi = { [attr]: null } as Record<TAttr, TApi | null>;

					return {
						'astro:config:setup': ({ config }) => {
							pluginApi[attr] = api.fromConfig(config);

							return pluginApi;
						},
						'astro:config:done': ({ config }) => {
							pluginApi[attr] = api.fromConfig(config);

							return pluginApi;
						},
						'astro:build:setup': () => pluginApi,
						'astro:build:start': () => pluginApi,
						'astro:build:ssr': () => pluginApi,
						'astro:build:done': () => pluginApi,
						'astro:build:generated': () => pluginApi,
						'astro:server:setup': () => pluginApi,
						'astro:server:start': () => pluginApi,
						'astro:server:done': () => pluginApi,
					};
				},
			}),
	};

	return Object.assign(wrapper, api);
}
