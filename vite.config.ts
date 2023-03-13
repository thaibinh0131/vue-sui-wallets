import { defineConfig } from 'vite';
import vue from '@vitejs/plugin-vue';
import typescript2 from 'rollup-plugin-typescript2';
import dts from 'vite-plugin-dts';
import { fileURLToPath, URL } from 'url';

// https://vitejs.dev/config/
export default defineConfig({
	plugins: [
		vue(),
		dts({
			insertTypesEntry: true,
		}),
		typescript2({
			check: false,
			include: ['src/components/**/*.vue'],
			tsconfigOverride: {
				compilerOptions: {
					outDir: 'dist',
					sourceMap: true,
					declaration: true,
					declarationMap: true,
				},
			},
			exclude: ['vite.config.ts'],
		}),
	],
	build: {
		lib: {
			// Could also be a dictionary or array of multiple entry points
			entry: 'src/index.ts',
			name: 'suiWalletsVue',
			fileName: 'index',
		},
		rollupOptions: {
			external: ['vue'],
			output: {
				globals: {
					vue: 'Vue',
				},
			},
		},
	},
	resolve: {
		alias: {
			'@': fileURLToPath(new URL('./src', import.meta.url)),
		},
	},
});
