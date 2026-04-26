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
        chunkSizeWarningLimit: 2000,
        rollupOptions: {
          output: {
            manualChunks: {
              // React is tiny and changes rarely — own chunk for long cache lifetime.
              // Three.js is intentionally NOT listed here. Keeping it out of manualChunks
              // lets Rollup bundle it inside the lazily-imported Globe section chunk,
              // so it is only downloaded when the user actually navigates to /globe.
              // Listing it in manualChunks caused Rollup to promote the globe chunk into
              // the main module graph, making it load on every page (confirmed via PSI:
              // 483 KB transferred, 344 KB unused on /london-to-new-york).
              vendor: ['react', 'react-dom'],
            }
          }
        }
      }
    };
});