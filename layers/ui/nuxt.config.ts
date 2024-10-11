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
		viewer: false
	},
	imports: {
		presets: [
		    {
		        from: '~~/layers/ui/components/toast/use-toast.ts',
		        imports: ['useToast']
		    }
		]
	}
})
