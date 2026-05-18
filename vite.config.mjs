import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';
import jsconfigPaths from 'vite-jsconfig-paths';
import path from 'path';

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '');
  const API_URL = env.VITE_APP_BASE_NAME || '/';
  const PORT = 3000;

  return {
    base: API_URL,
    server: {
      open: true,
      port: PORT,
      host: true
    },
    preview: {
      open: true,
      host: true
    },
    define: {
      global: 'window'
    },
    resolve: {
      alias: {
        '@ant-design/icons': path.resolve(__dirname, 'node_modules/@ant-design/icons')
        // Add more aliases as needed
      }
    },
    plugins: [
      react(),
      jsconfigPaths(),
      // Dev-only mock API for POST /api/customer/feedback/create/order/{orderId}
      {
        name: 'dev-api-mock',
        configureServer(server) {
          server.middlewares.use((req, res, next) => {
            try {
              // Dev GET: /api/customer/feedback/{customerId}
              if (
                req.method === 'GET' &&
                req.url &&
                req.url.startsWith('/api/customer/feedback/')
              ) {
                // ignore create endpoints (e.g. /api/customer/feedback/create)
                if (req.url.startsWith('/api/customer/feedback/create')) {
                  // let other handlers process
                } else {
                  const parts = req.url.split('/');
                  const rawId = parts[parts.length - 1].split('?')[0];
                  const customerId = decodeURIComponent(rawId || '');
                  const sample = {
                    customerId: Number(customerId) || 9007199254740991,
                    customerName: 'string',
                    feedbacks: [
                      {
                        questionNo: 1073741824,
                        question: 'string',
                        rating: 1073741824
                      }
                    ]
                  };
                  res.setHeader('Content-Type', 'application/json');
                  res.statusCode = 200;
                  res.end(JSON.stringify(sample));
                  return;
                }
              }
              if (
                req.method === 'POST' &&
                req.url &&
                req.url.startsWith('/api/customer/feedback/create/order/')
              ) {
                const parts = req.url.split('/');
                const rawId = parts[parts.length - 1].split('?')[0];
                const orderId = decodeURIComponent(rawId || '');
                let body = '';
                req.on('data', (chunk) => {
                  body += chunk;
                });
                req.on('end', () => {
                  try {
                    const data = body ? JSON.parse(body) : {};
                    res.setHeader('Content-Type', 'application/json');
                    res.statusCode = 200;
                    res.end(
                      JSON.stringify({ success: true, message: 'Mock feedback received', orderId, data })
                    );
                  } catch (err) {
                    res.statusCode = 400;
                    res.setHeader('Content-Type', 'application/json');
                    res.end(JSON.stringify({ success: false, message: 'Invalid JSON' }));
                  }
                });
                return;
              }
            } catch (e) {
              // fallthrough to next middleware on error
            }
            next();
          });
        }
      }
    ],
    build: {
      chunkSizeWarningLimit: 1000,
      sourcemap: true,
      cssCodeSplit: true,
      rollupOptions: {
        output: {
          chunkFileNames: 'js/[name]-[hash].js',
          entryFileNames: 'js/[name]-[hash].js',
          assetFileNames: (assetInfo) => {
            const name = assetInfo.name || '';
            const ext = name.split('.').pop();
            if (/\.css$/.test(name)) return `css/[name]-[hash].${ext}`;
            if (/\.(png|jpe?g|gif|svg|webp|ico)$/.test(name)) return `images/[name]-[hash].${ext}`;
            if (/\.(woff2?|eot|ttf|otf)$/.test(name)) return `fonts/[name]-[hash].${ext}`;
            return `assets/[name]-[hash].${ext}`;
          }
          // manualChunks: { ... } // Add if you want custom chunk splitting
        }
      },
      // Only drop console/debugger in production
      ...(mode === 'production' && {
        esbuild: {
          drop: ['console', 'debugger'],
          pure: ['console.log', 'console.info', 'console.debug', 'console.warn']
        }
      })
      // No need to set build.target unless you need to support older browsers
      // target: 'baseline-widely-available', // This is now the default
    },
    optimizeDeps: {
      include: ['@mui/material/Tooltip', 'react', 'react-dom', 'react-router-dom']
    }
  };
});
