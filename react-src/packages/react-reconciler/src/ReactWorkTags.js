/**
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @flow
 */

export type WorkTag =
  | 0
  | 1
  | 2
  | 3
  | 4
  | 5
  | 6
  | 7
  | 8
  | 9
  | 10
  | 11
  | 12
  | 13
  | 14
  | 15
  | 16
  | 17
  | 18
  | 19
  | 20
  | 21
  | 22
  | 23
  | 24
  | 25;

export const FunctionComponent = 0; // ! 函数组件
export const ClassComponent = 1; // ! 类组件
export const IndeterminateComponent = 2; // Before we know whether it is function or class ! 初始化时不确定是函数组件还是类组件
export const HostRoot = 3; // Root of a host tree. Could be nested inside another node. 根节点，! React 应用的入口
export const HostPortal = 4; // A subtree. Could be an entry point to a different renderer. ! Portal 组件
export const HostComponent = 5; // ! 宿主组件，对应原生 DOM 元素，例如 div、span 等
export const HostText = 6; // ! 文本节点，对应 DOM 的文本内容
export const Fragment = 7; // ! Fragment 组件，对应 React.Fragment，例如 <></>
export const Mode = 8;
export const ContextConsumer = 9; // ! Context.Consumer 组件
export const ContextProvider = 10; // ! Context.Provider 组件
export const ForwardRef = 11;
export const Profiler = 12; // ! Profiler 性能测量组件
export const SuspenseComponent = 13;
export const MemoComponent = 14; // ! React.memo() 包裹的组件
export const SimpleMemoComponent = 15;
export const LazyComponent = 16; // ! React.lazy() 包裹的组件
export const IncompleteClassComponent = 17;
export const DehydratedFragment = 18;
export const SuspenseListComponent = 19;
export const ScopeComponent = 21;
export const OffscreenComponent = 22;
export const LegacyHiddenComponent = 23;
export const CacheComponent = 24;
export const TracingMarkerComponent = 25;
