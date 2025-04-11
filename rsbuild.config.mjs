import { defineConfig } from '@rsbuild/core';
import { pluginReact } from '@rsbuild/plugin-react';
import { pluginBabel } from '@rsbuild/plugin-babel';

export default defineConfig({
  // !「源码引入环境调整」引入 react 环境变量
  source: {
    define: {
      __DEV__: true,
      __PROFILE__: true,
      __UMD__: true,
      __EXPERIMENTAL__: true,
      __VARIANT__: false,
    },
  },
  // !「源码引入环境调整」设置别名，从 react-src 引入 react
  resolve: {
    alias: {
      react: './react-src/packages/react',
      'react-dom': './react-src/packages/react-dom',
      shared: './react-src/packages/shared',
      'react-reconciler': './react-src/packages/react-reconciler',
      scheduler: './react-src/packages/scheduler',
      'react-devtools-scheduling-profiler':
        './react-src/packages/react-devtools-scheduling-profiler',
      'react-devtools-shared': './react-src/packages/react-devtools-shared',
      'react-devtools-timeline': './react-src/packages/react-devtools-timeline',
    },
  },
  plugins: [
    pluginReact(),
    // !「源码引入环境调整」引入 react 源码时，需要使用 babel-loader 对 flow 进行转换
    pluginBabel({
      include: /[\\/]react-src[\\/]/,
      babelLoaderOptions: {
        presets: ['@babel/preset-flow'],
      },
    }),
  ],
});
