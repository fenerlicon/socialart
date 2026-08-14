import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'
import fs from 'fs'
import { fileURLToPath } from 'url'
import metaInsightsHandler from './api/meta-insights.js'

const __dirname = path.dirname(fileURLToPath(import.meta.url))

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    {
      name: 'serve-api-and-admin',
      configureServer(server) {
        // 1. API Route Handler for local Vite dev server
        server.middlewares.use(async (req, res, next) => {
          if (req.url?.startsWith('/api/meta-insights')) {
            try {
              const urlObj = new URL(req.url, 'http://localhost');
              req.query = Object.fromEntries(urlObj.searchParams.entries());

              if (!res.status) {
                res.status = (code) => {
                  res.statusCode = code;
                  return res;
                };
              }
              if (!res.json) {
                res.json = (data) => {
                  res.setHeader('Content-Type', 'application/json');
                  res.end(JSON.stringify(data));
                };
              }

              return await metaInsightsHandler(req, res);
            } catch (apiErr) {
              console.error('Vite local API handler error:', apiErr);
              res.statusCode = 500;
              res.setHeader('Content-Type', 'application/json');
              res.end(JSON.stringify({ success: false, error: apiErr.message }));
              return;
            }
          }
          next();
        });

        // 2. Admin static routes
        server.middlewares.use((req, res, next) => {
          if (!req.url?.startsWith('/admin')) return next()

          const urlPath = req.url.split('?')[0]

          // Static assets (JS, CSS, fonts, images etc.) → serve as-is
          if (urlPath.includes('.')) return next()

          const cleanPath = urlPath.replace(/\/$/, '') || '/admin'

          // 1. Try /admin/some-path/index.html  (trailingSlash mode)
          const indexPath = path.join(__dirname, 'public', cleanPath, 'index.html')
          if (fs.existsSync(indexPath)) {
            req.url = cleanPath + '/index.html'
            return next()
          }

          // 2. Try /admin/some-path.html  (Next.js default static export)
          const htmlPath = path.join(__dirname, 'public', cleanPath + '.html')
          if (fs.existsSync(htmlPath)) {
            req.url = cleanPath + '.html'
            return next()
          }

          // 3. Dynamic routes: find a [param] sibling folder
          //    e.g. /admin/brands/REAL_UUID → try /admin/brands/[uuid].html or /admin/brands/temp.html
          const segments = cleanPath.split('/') // ['', 'admin', 'brands', 'UUID']
          if (segments.length >= 4) {
            const parentPath = segments.slice(0, -1).join('/')

            // Try /admin/brands/temp.html  (pre-built static param)
            const tempHtml = path.join(__dirname, 'public', parentPath, 'temp.html')
            if (fs.existsSync(tempHtml)) {
              req.url = parentPath + '/temp.html'
              return next()
            }

            // Try /admin/brands/temp/index.html
            const tempIndex = path.join(__dirname, 'public', parentPath, 'temp', 'index.html')
            if (fs.existsSync(tempIndex)) {
              req.url = parentPath + '/temp/index.html'
              return next()
            }
          }

          // 4. Fallback → /admin/index.html (root SPA shell)
          req.url = '/admin/index.html'
          return next()
        })
      }
    }
  ],
})
