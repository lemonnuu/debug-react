/**
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @flow
 */

'use strict';

import type {ReactNodeList} from 'shared/ReactTypes';
import type {
  RootType,
  HydrateRootOptions,
  CreateRootOptions,
} from './src/client/ReactDOMRoot';

import {
  createRoot as createRootImpl,
  hydrateRoot as hydrateRootImpl,
  __SECRET_INTERNALS_DO_NOT_USE_OR_YOU_WILL_BE_FIRED as Internals,
} from './';

export function createRoot(
  container: Element | Document | DocumentFragment,
  options?: CreateRootOptions,
): RootType {
  if (__DEV__) {
    // ! usingClientEntryPoint 表示是否是通过 React 开放的标准 API 调用，就是得从 'react-dom/client' 导入
    // ! 因为以前可以 import { createRoot } from 'react-dom' 来使用，但是现在不推荐了，react@19 更是直接去掉了这种兼容的导入方式
    // ! 主要目的是面向开发者提供更准确的警告信息
    Internals.usingClientEntryPoint = true;
  }
  try {
    return createRootImpl(container, options);
  } finally {
    if (__DEV__) {
      Internals.usingClientEntryPoint = false;
    }
  }
}

export function hydrateRoot(
  container: Document | Element,
  children: ReactNodeList,
  options?: HydrateRootOptions,
): RootType {
  if (__DEV__) {
    Internals.usingClientEntryPoint = true;
  }
  try {
    return hydrateRootImpl(container, children, options);
  } finally {
    if (__DEV__) {
      Internals.usingClientEntryPoint = false;
    }
  }
}

/**
 * !「源码引入环境调整」需要默认导出 ReactDOM
 */
const ReactDOM = {createRoot, hydrateRoot};
export default ReactDOM;
