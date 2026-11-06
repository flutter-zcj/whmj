// vite.config.ts
// @ts-nocheck
import { resolve } from 'node:path';
import uni from '@dcloudio/vite-plugin-uni';
import AutoImportTypes from 'auto-import-types';
import PiniaAutoRefs from 'pinia-auto-refs';
import Unocss from 'unocss/vite';
import AutoImport from 'unplugin-auto-import/vite';
import Components from 'unplugin-vue-components/vite';
import { defineConfig } from 'vite';

// https://vitejs.dev/config/
export default defineConfig({
   resolve: {
    alias: {
      '@': resolve(__dirname, 'src'),
      // 这里将嵌套依赖统一解析到顶层版本，避免重复打包；uview-plus 3.x 与 uni-ui 1.5.x 均向后兼容。
      'uview-plus': resolve(__dirname, 'node_modules/uview-plus'),
      '@dcloudio/uni-ui': resolve(__dirname, 'node_modules/@dcloudio/uni-ui'),
    }
  },
  plugins: [
    AutoImportTypes(),
    PiniaAutoRefs(),
    AutoImport({
      dts: 'src/auto-imports.d.ts',
      imports: [
        'vue',
        'uni-app',
        'pinia',
        {
          '@/helper/pinia-auto-refs': ['useStore']
        }
      ],
      exclude: ['createApp'],
      eslintrc: {
        enabled: true
      }
    }),
    Components({
      extensions: ['vue'],
      dts: 'src/components.d.ts'
    }),
    uni(),
    Unocss()
  ],
  preview: {
    port: 4173,
    proxy: {
      '^/mahjong-api': {
        target: 'http://127.0.0.1:9101',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/mahjong-api/, '')
      },
      '^/mahjong-ws': {
        target: 'ws://127.0.0.1:9106',
        ws: true,
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/mahjong-ws/, '')
      }
    }
  },
  server: {
    open: false, // 运行后会自动打开浏览器, 默认关闭
    base: './', // 生产环境路径
    proxy: {
      // 石屏测试环境
      '^/zgis': {
        // target: 'http://192.168.2.227:17789/giszjgkyszhjc/zgis',
        target: 'http://192.168.2.207:39092/oadev/zgis',
        changeOrigin: true, // 开启代理
        rewrite: (path) => path.replace(/^\/zgis/, '')
      },
      // 麻将后端 HTTP 接口
      '^/mahjong-api': {
        target: 'http://127.0.0.1:9101',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/mahjong-api/, '')
      },
      // 麻将后端 WebSocket 网关
      '^/mahjong-ws': {
        target: 'ws://127.0.0.1:9106',
        ws: true,
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/mahjong-ws/, '')
      },
    }
  }
});
