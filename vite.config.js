import { defineConfig } from 'vite'
import mdx from '@mdx-js/rollup'
import react from '@vitejs/plugin-react-swc'
import svgr from "vite-plugin-svgr";
import remarkGfm from 'remark-gfm'

// https://vitejs.dev/config/
export default defineConfig({
  base: '/sfm-designer/',
  plugins: [
    {enforce: 'pre', ...mdx({providerImportSource: '@mdx-js/react', remarkPlugins: [remarkGfm]})},
    react({include: /\.(jsx|js|mdx|md|tsx|ts)$/}),
    svgr(),
  ],
})
