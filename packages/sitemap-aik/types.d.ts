export {};

declare global {
	namespace AstroLibs {
		interface Hooks {
			'sitemap:pageCandidate'?: (params: { page: string; omitPage: () => void }) => void;
		}
	}
}
