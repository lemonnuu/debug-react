/**
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 */

export const enableSchedulerDebugging = false; // 是否启用调度器调试功能
export const enableIsInputPending = false; // 是否启用输入事件检测功能
export const enableProfiling = false; // 是否启用性能分析功能
export const enableIsInputPendingContinuous = false; // 是否启用持续输入事件检测
export const frameYieldMs = 5; // ! 时间切片参数，单帧最大执行时间（5毫秒）
export const continuousYieldMs = 50; // 连续执行的最大时间阈值(50毫秒)
export const maxYieldMs = 300; // 最大让出时间阈值(300毫秒)
