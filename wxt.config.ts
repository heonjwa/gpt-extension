import { defineConfig } from 'wxt';

// See https://wxt.dev/api/config.html
export default defineConfig({
  modules: ['@wxt-dev/module-react'],
  manifest: ({ browser, manifestVersion, mode, command }) => {
    return {
      manifest_version: 2,
      name: 'GPTree',
      description: 'GPTree is a Chrome extension that helps you to paraphrase your input for ChatGPT to save trees.',
      version: '1.0.0',
      permissions: ['activeTab', 'contextMenus', 'storage', "scripting","tabs", "declarativeNetRequest"],
    };
  },
});
