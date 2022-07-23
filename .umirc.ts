import { resolve } from 'path';

export default {
  npmClient: 'yarn',
  fastRefresh: true,
  plugins: [require.resolve('umi-plugin-redux-toolkit')],
  alias: {
    components: resolve(__dirname, './src/components'),
    models: resolve(__dirname, './src/models'),
    services: resolve(__dirname, './src/services'),
    styles: resolve(__dirname, './src/styles'),
    utils: resolve(__dirname, './src/utils'),
  }
};
