import { defineConfig } from 'astro/config'
import tailwind from '@astrojs/tailwind'

import vercel from '@astrojs/vercel/serverless'

const includeFiles = ['src/assets/images/gay_flag.webp']

// https://astro.build/config
export default defineConfig({
    output: 'hybrid',
    integrations: [tailwind()],
    adapter: vercel({
        functionPerRoute: false,
        includeFiles: includeFiles,
    }),
})
