/**
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @flow
 */

export type PriorityLevel = 0 | 1 | 2 | 3 | 4 | 5;

// TODO: Use symbols?
export const NoPriority = 0; // 无优先级(默认值)
export const ImmediatePriority = 1; // 立即执行优先级(最高)
export const UserBlockingPriority = 2; // 用户阻塞优先级(需要快速响应)
export const NormalPriority = 3; // 普通优先级(默认)
export const LowPriority = 4; // 低优先级(可延迟执行)
export const IdlePriority = 5; // 空闲优先级(最低)
