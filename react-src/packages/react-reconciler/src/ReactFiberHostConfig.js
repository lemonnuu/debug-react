/**
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @flow
 */

/* eslint-disable react-internal/prod-error-codes */

// We expect that our Rollup, Jest, and Flow configurations
// always shim this module with the corresponding host config
// (either provided by a renderer, or a generic shim for npm).
//
// We should never resolve to this file, but it exists to make
// sure that if we *do* accidentally break the configuration,
// the failure isn't silent.

/**
 * !「源码引入环境调整」
 * 1. 注释掉抛出错误的代码
 * 2. 引入dom环境的配置
 */

// throw new Error('This module must be shimmed by a specific renderer.');

export * from './forks/ReactFiberHostConfig.dom';
