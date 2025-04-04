import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import dts from 'vite-plugin-dts';
import { resolve } from 'path';

// Library configuration
const libConfig = defineConfig({
  plugins: [
    react(),
    dts({
      insertTypesEntry: true,
      include: ['src'],
      rollupTypes: true,
    }),
  ],
  server: {
    port: 8000,
  },
  resolve: {
    alias: {
      '@': resolve(__dirname, './src'),
    },
  },
  assetsInclude: ['**/*.png', '**/*.jpg', '**/*.jpeg', '**/*.gif', '**/*.svg'],
  build: {
    lib: {
      entry: resolve(__dirname, 'src/index.ts'),
      name: 'OcentraBlogEditor',
      formats: ['es', 'umd'],
      fileName: (format) => `ocentra-blog-editor.${format}.js`,
    },
    rollupOptions: {
      external: ['react', 'react-dom'],
      output: {
        globals: {
          react: 'React',
          'react-dom': 'ReactDOM',
        },
        assetFileNames: (assetInfo) => {
          if (assetInfo.name === 'style.css') return 'blog-editor.css';
          return `assets/[name][extname]`;
        },
      },
    },
    outDir: 'dist',
    emptyOutDir: true,
    assetsDir: 'assets',
    copyPublicDir: false,
    assetsInlineLimit: 0,
  },
});

// Example app configuration
const exampleConfig = defineConfig({
  plugins: [react()],
  root: './example',
  server: {
    port: 8000,
  },
  resolve: {
    alias: {
      '@ocentra/blog-editor': resolve(__dirname, './src'),
    },
  },
});

// Export configuration based on command
export default ({ command }) => {
  if (command === 'build' && process.env.BUILD_EXAMPLE) {
    return exampleConfig;
  }
  return libConfig;
}; 