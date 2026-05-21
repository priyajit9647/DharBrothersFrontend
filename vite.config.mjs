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
              // Dev POST: /api/customer-portal/orders/{orderId}/payment-status
              if (
                req.method === 'POST' &&
                req.url &&
                req.url.match(/^\/api\/customer-portal\/orders\/[^/]+\/payment-status/) 
              ) {
                const parts = req.url.split('/');
                const rawId = parts[parts.length - 2];
                const orderId = decodeURIComponent(rawId || '');
                let body = '';
                req.on('data', (chunk) => {
                  body += chunk;
                });
                req.on('end', () => {
                  try {
                    const data = body ? JSON.parse(body) : {};
                    const now = new Date().toISOString();
                    const resp = {
                      message: 'Payment re-initiation triggered',
                      paymentStatus: 'INITIATED',
                      paymentLink: `https://pay.example.com/pay/${orderId}`,
                      updatedAt: now
                    };
                    res.setHeader('Content-Type', 'application/json');
                    res.statusCode = 200;
                    res.end(JSON.stringify(resp));
                  } catch (err) {
                    res.statusCode = 400;
                    res.setHeader('Content-Type', 'application/json');
                    res.end(JSON.stringify({ success: false, message: 'Invalid JSON' }));
                  }
                });
                return;
              }

                // Dev GET: /api/customer-portal/orders/{orderId}/payment-status
                if (
                  req.method === 'GET' &&
                  req.url &&
                  req.url.match(/^\/api\/customer-portal\/orders\/[^/]+\/payment-status/)
                ) {
                  const parts = req.url.split('/');
                  const rawId = parts[parts.length - 2];
                  const orderId = decodeURIComponent(rawId || '');
                  const resp = {
                    orderId,
                    paymentStatus: 'COMPLETED',
                    message: 'Mock payment check: completed',
                    paymentLink: null,
                    checkedAt: new Date().toISOString()
                  };
                  res.setHeader('Content-Type', 'application/json');
                  res.statusCode = 200;
                  res.end(JSON.stringify(resp));
                  return;
                }

                // Dev GET: /api/v1/user/me/profile
                if (
                  req.method === 'GET' &&
                  req.url &&
                  (req.url === '/api/v1/user/me/profile' || req.url.startsWith('/api/v1/user/me/profile'))
                ) {
                  const now = new Date().toISOString();
                  const profile = {
                    id: 12345,
                    fullName: 'John Doe',
                    email: 'john.doe@example.com',
                    phone: '9876543210',
                    customerId: 9001,
                    joinedAt: now
                  };
                  res.setHeader('Content-Type', 'application/json');
                  res.statusCode = 200;
                  res.end(JSON.stringify(profile));
                  return;
                }

                // Dev GET: /api/v1/customers/re-initiate-payment/{orderId}
                if (
                  req.method === 'GET' &&
                  req.url &&
                  req.url.match(/^\/api\/v1\/customers\/re-initiate-payment\/[^^/]+/)
                ) {
                  const parts = req.url.split('/');
                  const rawId = parts[parts.length - 1].split('?')[0];
                  const orderId = decodeURIComponent(rawId || '');
                  const resp = {
                    success: true,
                    message: 'Mock re-initiation started',
                    paymentLink: `https://pay.example.com/reinit/${orderId}`,
                    updatedAt: new Date().toISOString()
                  };
                  res.setHeader('Content-Type', 'application/json');
                  res.statusCode = 200;
                  res.end(JSON.stringify(resp));
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
