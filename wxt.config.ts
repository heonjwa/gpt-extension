import { defineConfig } from 'wxt';

// See https://wxt.dev/api/config.html
export default defineConfig({
  modules: ['@wxt-dev/module-react'],
  manifest: ({ browser, manifestVersion, mode, command }) => {
    return {
      manifest_version: 2,
      name: 'Concise No thank you',
      description: 'Concise No thank you is a Chrome extension that helps you to paraphrase your text in a concise way.',
      version: '1.0.0',
      permissions: ['activeTab', 'contextMenus', 'storage', "scripting","tabs", "declarativeNetRequest"],
    };
  },
  dev: {
    port: 5173, // Specify a port for wxt to use
  }
});
