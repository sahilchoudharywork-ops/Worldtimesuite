// import path from 'path';
// import { defineConfig, loadEnv } from 'vite';
// import react from '@vitejs/plugin-react';

// export default defineConfig(({ mode }) => {
//     const env = loadEnv(mode, '.', '');
//     return {
//       server: {
//         port: 3000,
//         host: '0.0.0.0',
//       },
//       plugins: [react()],
//       define: {
//         'process.env.API_KEY': JSON.stringify(env.GEMINI_API_KEY),
//         'process.env.GEMINI_API_KEY': JSON.stringify(env.GEMINI_API_KEY)
//       },
//       resolve: {
//         alias: {
//           '@': path.resolve(__dirname, '.'),
//         }
//       }
//     };
// });


import path from 'path';
import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig(({ mode }) => {
    const env = loadEnv(mode, '.', '');
    return {
      server: {
        port: 3000,
        host: '0.0.0.0',
      },
      plugins: [react()],
      define: {
        'process.env.API_KEY': JSON.stringify(env.GEMINI_API_KEY),
        'process.env.GEMINI_API_KEY': JSON.stringify(env.GEMINI_API_KEY)
      },
      resolve: {
        alias: {
          '@': path.resolve(__dirname, '.'),
        }
      },
      build: {
        // Increase chunk warning threshold (your bundle is intentionally ~82KB)
        chunkSizeWarningLimit: 600,
        rollupOptions: {
          output: {
            // Split vendor code into a separate chunk so the main bundle is smaller.
            // React + ReactDOM go into vendor.js and are cached separately from your app code.
            manualChunks: {
              // React — tiny, changes rarely, long cache lifetime
              vendor: ['react', 'react-dom'],
              // Three.js + globe — ~900 KB gzipped, almost never changes.
              // Own chunk = browser caches it independently of app code.
              // App code edits no longer bust this large cache entry.
              globe: ['three', 'react-globe.gl'],
            }
          }
        }
      }
    };
});