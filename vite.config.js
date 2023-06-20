import { sveltekit } from '@sveltejs/kit/vite';

/** @type {import('vite').UserConfig} */
const config = {
	plugins: [sveltekit()],
	kit:{
		typescript:{
			config: (tsconfig) => {
				const {
					// destructure properties we don't want
					importsNotUsedAsValues: _,
					preserveValueImports: __,
					// keep the rest in a single object
					...compilerOptions
				} = tsconfig.compilerOptions

				return {
					...tsconfig,
					compilerOptions: {
						...compilerOptions,
					},
				}
			}
		}
	}
};

export default config;
