import { defineConfig, type Plugin } from 'vite';
import preact from '@preact/preset-vite';
import { APP } from './src/config';

function brand(): Plugin {
  return {
    name: 'brand',
    transformIndexHtml(html) {
      return html.replace(/%TITLE%/g, APP.title).replace(/%DESC%/g, APP.description).replace(/%NAME%/g, APP.name).replace(/%URL%/g, APP.url);
    },
    generateBundle() {
      const icon = (sizes: string) => ({ src: '/icons/icon-192.png', sizes });
      const manifest = {
        id: '/', name: APP.name, short_name: 'Corper', description: APP.description, prefer_related_applications: false,
        start_url: '/?source=pwa', scope: '/', display: 'standalone', orientation: 'portrait', background_color: '#f5f7f5', theme_color: APP.themeColor,
        lang: 'en-NG', dir: 'ltr', categories: ['education', 'lifestyle', 'productivity'],
        shortcuts: [
          { name: 'Camp checklist', short_name: 'Checklist', url: '/#/checklist', icons: [icon('192x192')] },
          { name: 'Ask Corper Guide', short_name: 'Ask AI', url: '/#/ask', icons: [icon('192x192')] },
          { name: 'Budget', short_name: 'Budget', url: '/#/money', icons: [icon('192x192')] },
        ],
        icons: [
          { src: '/icons/icon-192.png', sizes: '192x192', type: 'image/png', purpose: 'any' },
          { src: '/icons/icon-512.png', sizes: '512x512', type: 'image/png', purpose: 'any' },
          { src: '/icons/maskable-512.png', sizes: '512x512', type: 'image/png', purpose: 'maskable' },
        ],
        screenshots: [
          { src: '/shots/home.png', sizes: '720x1600', type: 'image/png', form_factor: 'narrow', label: 'Countdown to camp' },
          { src: '/shots/checklist.png', sizes: '720x1600', type: 'image/png', form_factor: 'narrow', label: 'Camp checklist' },
        ],
      };
      this.emitFile({ type: 'asset', fileName: 'manifest.webmanifest', source: JSON.stringify(manifest, null, 1) });
    },
  };
}

export default defineConfig({
  plugins: [preact(), brand()],
  build: { target: 'es2019', cssCodeSplit: false, assetsInlineLimit: 0, reportCompressedSize: false, modulePreload: { polyfill: false } },
});
