import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'
import fs from 'fs'
import { fileURLToPath } from 'url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    {
      name: 'serve-admin-static',
      configureServer(server) {
        server.middlewares.use((req, res, next) => {
          if (!req.url?.startsWith('/admin')) return next()

          const urlPath = req.url.split('?')[0]

          // Exact static file (JS, CSS, images etc.) → serve as-is
          if (urlPath.includes('.')) return next()

          // Try /admin/some-path/index.html
          const cleanPath = urlPath.replace(/\/$/, '') || '/admin'
          const indexPath = path.join(__dirname, 'public', cleanPath, 'index.html')
          if (fs.existsSync(indexPath)) {
            req.url = cleanPath + '/index.html'
            return next()
          }

          // Fallback → serve /admin/index.html (SPA client-side routing)
          req.url = '/admin/index.html'
          return next()
        })
      }
    }
  ],
})
