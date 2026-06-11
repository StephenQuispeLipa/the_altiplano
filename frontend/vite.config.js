import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'

export default defineConfig({
  plugins: [vue()],
  server: {
    proxy: {
      '/api': {
        target: 'http://localhost:3000',
        changeOrigin: true,
        configure: (proxy) => {
          proxy.on('proxyReq', (proxyReq, req) => {
            const clientIp = req.socket?.remoteAddress;
            if (clientIp) {
              proxyReq.setHeader('X-Forwarded-For', clientIp);
            }
          });
        },
      },
    },
  },
})
