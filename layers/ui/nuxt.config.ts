import { defineNuxtConfig } from 'nuxt/config'
import { fileURLToPath } from 'url'
import { dirname, join } from 'path'

const currentDir = dirname(fileURLToPath(import.meta.url))

export default defineNuxtConfig({
	modules: [],
	lucide: {
		namePrefix: 'Icon'
	},
	shadcn: {
		prefix: '',
		componentDir: join(currentDir, './components')
	},
	tailwindcss: {
		viewer: false,
		cssPath: join(currentDir, './assets/css/tailwind.css')
	},
	colorMode: {
		classSuffix: '',
		preference: 'system',
		fallback: 'light'
	},
	imports: {
		presets: [
		    {
		        from: '~~/layers/ui/components/toast/use-toast.ts',
		        imports: ['useToast']
		    }
		]
	}
	// fonts: {
	// 	google: {
	// 		families: [
	// 			{
	// 				name: 'Inter',
	// 				styles: ['400', '500', '600', '700']
	// 			}
	// 		]
	// 	}
	// },
})
