/**
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @flow
 */

export type RootTag = 0 | 1;

export const LegacyRoot = 0; // ! React@17 及之前版本的同步渲染模式
export const ConcurrentRoot = 1; // ! React@18 新特性的并发渲染模式
