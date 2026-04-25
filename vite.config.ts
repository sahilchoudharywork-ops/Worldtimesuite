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
        chunkSizeWarningLimit: 600,
        modulePreload: {
          // By default Vite injects <link rel="modulepreload"> for every chunk it knows about,
          // including dynamically-imported ones like the Globe page (Three.js = 510 KB gzip).
          // This caused the homepage and every conversion page to pre-fetch ~510 KB of 3D
          // rendering code that most visitors never use. Filtering it out here drops homepage
          // transfer from ~600 KB to ~90 KB gzip. The globe chunk still loads correctly when
          // the user navigates to /globe — it just isn't pre-fetched everywhere else.
          resolveDependencies: (_filename: string, deps: string[]) =>
            deps.filter(dep => !dep.includes('globe')),
        },
        rollupOptions: {
          output: {
            manualChunks: {
              vendor: ['react', 'react-dom'],
              globe: ['three', 'react-globe.gl'],
            }
          }
        }
      }
    };
});