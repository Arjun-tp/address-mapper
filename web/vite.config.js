import { sveltekit } from '@sveltejs/kit/vite';
import { defineConfig } from 'vite';

export default defineConfig({
	plugins: [sveltekit()],
	preview: {
		allowedHosts: [
			'address-mapper-production-322e.up.railway.app',
			// 'https://address-mapper-production-322e.up.railway.app',
			// 'http://address-mapper-production-322e.up.railway.app',
		]
	}
});
