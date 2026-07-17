import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import { Toaster } from '@/components/ui/sonner'
import { WorkspaceLayout } from '@/components/layout/workspace-layout'
import './globals.css'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'Social Art Base',
  description: 'Social Art ajans operasyon sistemi',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="tr">
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `
              (function() {
                function forceReload() {
                  var lastReload = sessionStorage.getItem('last-chunk-reload');
                  var now = Date.now();
                  if (!lastReload || (now - parseInt(lastReload) > 5000)) {
                    sessionStorage.setItem('last-chunk-reload', now);
                    console.warn('Next.js asset load failure. Reloading...');
                    window.location.reload();
                  }
                }

                // 1. Tag loading errors (LINK/SCRIPT)
                window.addEventListener('error', function(e) {
                  var target = e.target;
                  if (target && (target.tagName === 'LINK' || target.tagName === 'SCRIPT')) {
                    var src = target.src || target.href;
                    if (src && src.indexOf('/_next/static/') !== -1) {
                      forceReload();
                    }
                  }
                }, true);

                // 2. Uncaught JS chunk errors
                window.addEventListener('error', function(e) {
                  if (e.message && (
                    e.message.indexOf('ChunkLoadError') !== -1 ||
                    e.message.indexOf('Loading chunk') !== -1 ||
                    e.message.indexOf('Failed to fetch') !== -1
                  )) {
                    forceReload();
                  }
                });

                // 3. Unhandled promise rejections (like dynamic import failures)
                window.addEventListener('unhandledrejection', function(e) {
                  var reason = e.reason;
                  if (reason && (
                    (reason.message && (reason.message.indexOf('ChunkLoadError') !== -1 || reason.message.indexOf('Loading chunk') !== -1)) ||
                    (reason.name && reason.name === 'ChunkLoadError')
                  )) {
                    forceReload();
                  }
                });
              })();
            `,
          }}
        />
      </head>
      <body className={`${inter.className} min-h-screen bg-gradient-to-br from-[#09090b] via-[#111115] to-[#1a112d] text-neutral-100 antialiased`}>
        <WorkspaceLayout>
          {children}
        </WorkspaceLayout>
        <Toaster richColors position="top-right" />
      </body>
    </html>
  )
}
