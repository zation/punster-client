import { defineConfig } from 'umi';

export default defineConfig({
  npmClient: 'yarn',
  fastRefresh: true,
  title: 'PunStar',
  define: { VERSION: process.env.VERSION || 'dev' },
});
