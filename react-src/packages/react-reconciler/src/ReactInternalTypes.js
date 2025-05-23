/**
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @flow
 */

import type {Source} from 'shared/ReactElementType';
import type {
  RefObject,
  ReactContext,
  MutableSourceSubscribeFn,
  MutableSourceGetSnapshotFn,
  MutableSourceVersion,
  MutableSource,
  StartTransitionOptions,
  Wakeable,
} from 'shared/ReactTypes';
import type {SuspenseInstance} from './ReactFiberHostConfig';
import type {WorkTag} from './ReactWorkTags';
import type {TypeOfMode} from './ReactTypeOfMode';
import type {Flags} from './ReactFiberFlags';
import type {Lane, Lanes, LaneMap} from './ReactFiberLane.old';
import type {RootTag} from './ReactRootTags';
import type {TimeoutHandle, NoTimeout} from './ReactFiberHostConfig';
import type {Cache} from './ReactFiberCacheComponent.old';
import type {Transition} from './ReactFiberTracingMarkerComponent.new';
import type {ConcurrentUpdate} from './ReactFiberConcurrentUpdates.new';

// Unwind Circular: moved from ReactFiberHooks.old
export type HookType =
  | 'useState'
  | 'useReducer'
  | 'useContext'
  | 'useRef'
  | 'useEffect'
  | 'useInsertionEffect'
  | 'useLayoutEffect'
  | 'useCallback'
  | 'useMemo'
  | 'useImperativeHandle'
  | 'useDebugValue'
  | 'useDeferredValue'
  | 'useTransition'
  | 'useMutableSource'
  | 'useSyncExternalStore'
  | 'useId'
  | 'useCacheRefresh';

export type ContextDependency<T> = {
  context: ReactContext<T>,
  next: ContextDependency<mixed> | null,
  memoizedValue: T,
  ...
};

export type Dependencies = {
  lanes: Lanes,
  firstContext: ContextDependency<mixed> | null,
  ...
};

// A Fiber is work on a Component that needs to be done or was done. There can
// be more than one per component.
export type Fiber = {|
  // These first fields are conceptually members of an Instance. This used to
  // be split into a separate type and intersected with the other Fiber fields,
  // but until Flow fixes its intersection bugs, we've merged them into a
  // single type.

  // An Instance is shared between all versions of a component. We can easily
  // break this out into a separate object to avoid copying so much to the
  // alternate versions of the tree. We put this on a single object for now to
  // minimize the number of objects created during the initial render.

  // Tag identifying the type of fiber.
  // ! 标记 fiber 的类型，可以是函数组件、类组件、原生节点等
  tag: WorkTag,

  // Unique identifier of this child.
  // ! fiber 的 key，只会比较同一层级，不会跨层级比较，用于区分兄弟节点，
  key: null | string,

  // The value of element.type which is used to preserve the identity during
  // reconciliation of this child.
  // ! 组件类型，和 type 一致
  elementType: any,

  // The resolved function/class/ associated with this fiber.
  // ! 组件类型，如果宿主组件，就是 div、span 这样的字符串，类组件就是 class 本身，函数组件就是 function 本身
  type: any,

  // The local state associated with this fiber.
  // ! 组件实例，如果是宿主组件就是 DOM 节点，类组件就是组件实例，函数组件就是 null
  stateNode: any,

  // Conceptual aliases
  // parent : Instance -> return The parent happens to be the same as the
  // return fiber since we've merged the fiber and instance.

  // Remaining fields belong to Fiber

  // The Fiber to return to after finishing processing this one.
  // This is effectively the parent, but there can be multiple parents (two)
  // so this is only the parent of the thing we're currently processing.
  // It is conceptually the same as the return address of a stack frame.
  // ! 父 fiber
  return: Fiber | null,

  // Singly Linked List Tree Structure.
  // ! 第一个子 fiber
  child: Fiber | null,
  // ! 下一个兄弟 fiber
  sibling: Fiber | null,
  // ! 在兄弟节点中的索引位置，用于 diff 时判断节点是否需要发生移动
  index: number,

  // The ref last used to attach this node.
  // I'll avoid adding an owner field for prod and model that as functions.
  ref:
    | null
    | (((handle: mixed) => void) & {_stringRef: ?string, ...})
    | RefObject,

  // Input is the data coming into process this fiber. Arguments. Props.
  // ! 新传入的 props (还未处理的 props)
  pendingProps: any, // This type will be more specific once we overload the tag.
  // ! 上一次渲染使用的 props
  memoizedProps: any, // The props used to create the output.

  // A queue of state updates and callbacks.
  // ! 状态更新队列，存储 updates 和 callbacks，比如 setState、useState、useReducer 的更新
  updateQueue: mixed,

  // The state used to create the output
  // ! 上次渲染使用的状态，函数组件是 hooks0(也是单链表存储)，类组件是 state
  memoizedState: any,

  // Dependencies (contexts, events) for this fiber, if it has any
  // ! 依赖的 context、事件等
  dependencies: Dependencies | null,

  // Bitfield that describes properties about the fiber and its subtree. E.g.
  // the ConcurrentMode flag indicates whether the subtree should be async-by-
  // default. When a fiber is created, it inherits the mode of its
  // parent. Additional flags can be set at creation time, but after that the
  // value should remain unchanged throughout the fiber's lifetime, particularly
  // before its child fibers are created.
  // ! 模式，比如 ConcurrentMode（渲染模式）、StrictMode（严格模式） 等
  mode: TypeOfMode,

  // Effect
  flags: Flags, // ! 标记需要执行的副作用类型，例如 Placement(创建或位置变更)、Update(更新)、Deletion(删除) 等
  subtreeFlags: Flags, // ! 子树中的副作用标记
  deletions: Array<Fiber> | null, // ! 待删除的子节点列表

  // Singly linked list fast path to the next fiber with side-effects.
  nextEffect: Fiber | null, // ! 下一个有副作用的节点

  // The first and last fiber with side-effect within this subtree. This allows
  // us to reuse a slice of the linked list when we reuse the work done within
  // this fiber.
  firstEffect: Fiber | null, // ! 子树中第一个有副作用的节点
  lastEffect: Fiber | null, // ! 子树中最后一个有副作用的节点

  lanes: Lanes, // ! 当前 fiber 的 lanes（优先级）
  childLanes: Lanes, // ! 子 fiber 的 lanes（优先级）

  // This is a pooled version of a Fiber. Every fiber that gets updated will
  // eventually have a pair. There are cases when we can clean up pairs to save
  // memory if we need to.
  // ! 用于存储更新前的 fiber
  alternate: Fiber | null,

  // Time spent rendering this Fiber and its descendants for the current update.
  // This tells us how well the tree makes use of sCU for memoization.
  // It is reset to 0 each time we render and only updated when we don't bailout.
  // This field is only set when the enableProfilerTimer flag is enabled.
  actualDuration?: number, // 本次渲染耗时

  // If the Fiber is currently active in the "render" phase,
  // This marks the time at which the work began.
  // This field is only set when the enableProfilerTimer flag is enabled.
  actualStartTime?: number, // 本次渲染开始时间

  // Duration of the most recent render time for this Fiber.
  // This value is not updated when we bailout for memoization purposes.
  // This field is only set when the enableProfilerTimer flag is enabled.
  selfBaseDuration?: number, // 当前节点最近渲染耗时

  // Sum of base times for all descendants of this Fiber.
  // This value bubbles up during the "complete" phase.
  // This field is only set when the enableProfilerTimer flag is enabled.
  treeBaseDuration?: number, // 子树最近渲染总耗时

  // Conceptual aliases
  // workInProgress : Fiber ->  alternate The alternate used for reuse happens
  // to be the same as work in progress.
  // __DEV__ only

  _debugSource?: Source | null, // 源码位置
  _debugOwner?: Fiber | null, // 创建此 fiber 的组件
  _debugIsCurrentlyTiming?: boolean,
  _debugNeedsRemount?: boolean,

  // Used to verify that the order of hooks does not change between renders.
  _debugHookTypes?: Array<HookType> | null, // 使用的 hooks 类型
|};

type BaseFiberRootProperties = {|
  // The type of root (legacy, batched, concurrent, etc.)
  tag: RootTag, // ! 根节点渲染模式（LegacyRoot 同步渲染 | ConcurrentRoot 并发渲染）

  // Any additional information from the host associated with this root.
  containerInfo: any, // ! container
  // Used only by persistent updates.
  pendingChildren: any, // 持久化更新时暂存子节点，主要是 SSR 和 hydration 过程中使用
  // The currently active root fiber. This is the mutable root of the tree.
  current: Fiber, // ! 当前渲染的根 fiber

  pingCache: WeakMap<Wakeable, Set<mixed>> | Map<Wakeable, Set<mixed>> | null, // ! 缓存 Suspense 组件的唤醒状态

  // A finished work-in-progress HostRoot that's ready to be committed.
  finishedWork: Fiber | null, // ! 指向已完成但尚未提交的 fiber 树，协调器完成工作后会设置此属性
  // Timeout handle returned by setTimeout. Used to cancel a pending timeout, if
  // it's superseded by a new one.
  timeoutHandle: TimeoutHandle | NoTimeout,
  // Top context object, used by renderSubtreeIntoContainer
  context: Object | null, // ! 顶层的 context 对象
  pendingContext: Object | null, // ! 待处理的 context 变更

  // Used by useMutableSource hook to avoid tearing during hydration.
  mutableSourceEagerHydrationData?: Array<
    MutableSource<any> | MutableSourceVersion,
  > | null,

  // Node returned by Scheduler.scheduleCallback. Represents the next rendering
  // task that the root will work on.
  callbackNode: *, // ! 调度器返回的任务节点
  callbackPriority: Lane, // ! 当前回调任务的优先级
  eventTimes: LaneMap<number>, // ! 记录各 lane 对应事件的触发时间
  expirationTimes: LaneMap<number>, // ! 记录各 lane 的过期时间
  hiddenUpdates: LaneMap<Array<ConcurrentUpdate> | null>, // 存储隐藏的并发更新

  pendingLanes: Lanes, // ! 待处理的所有 lane 的集合
  suspendedLanes: Lanes, // ! 被挂起的 lane 集合
  pingedLanes: Lanes, // ! 被唤醒的 lane 集合
  expiredLanes: Lanes, // ! 已过期的 lane 集合
  mutableReadLanes: Lanes, // ! 可变的读取 lane 集合

  finishedLanes: Lanes, // ! 已完成渲染的 lane 集合

  entangledLanes: Lanes, // ! 相互纠缠的 lane 集合
  entanglements: LaneMap<Lanes>, // ! 记录 lane 之间的纠缠关系

  pooledCache: Cache | null, // ! 对象池缓存
  pooledCacheLanes: Lanes, // ! 使用对象池缓存的 lane 集合

  // TODO: In Fizz, id generation is specific to each server config. Maybe we
  // should do this in Fiber, too? Deferring this decision for now because
  // there's no other place to store the prefix except for an internal field on
  // the public createRoot object, which the fiber tree does not currently have
  // a reference to.
  identifierPrefix: string, // ! ID 标识前缀

  // ! 可恢复错误的回调处理函数
  onRecoverableError: (
    error: mixed,
    errorInfo: {digest?: ?string, componentStack?: ?string},
  ) => void,
|};

// The following attributes are only used by DevTools and are only present in DEV builds.
// They enable DevTools Profiler UI to show which Fiber(s) scheduled a given commit.
type UpdaterTrackingOnlyFiberRootProperties = {|
  memoizedUpdaters: Set<Fiber>,
  pendingUpdatersLaneMap: LaneMap<Set<Fiber>>,
|};

export type SuspenseHydrationCallbacks = {
  onHydrated?: (suspenseInstance: SuspenseInstance) => void,
  onDeleted?: (suspenseInstance: SuspenseInstance) => void,
  ...
};

// The follow fields are only used by enableSuspenseCallback for hydration.
type SuspenseCallbackOnlyFiberRootProperties = {|
  hydrationCallbacks: null | SuspenseHydrationCallbacks,
|};

export type TransitionTracingCallbacks = {
  onTransitionStart?: (transitionName: string, startTime: number) => void,
  onTransitionProgress?: (
    transitionName: string,
    startTime: number,
    currentTime: number,
    pending: Array<{name: null | string}>,
  ) => void,
  onTransitionIncomplete?: (
    transitionName: string,
    startTime: number,
    deletions: Array<{
      type: string,
      name?: string,
      newName?: string,
      endTime: number,
    }>,
  ) => void,
  onTransitionComplete?: (
    transitionName: string,
    startTime: number,
    endTime: number,
  ) => void,
  onMarkerProgress?: (
    transitionName: string,
    marker: string,
    startTime: number,
    currentTime: number,
    pending: Array<{name: null | string}>,
  ) => void,
  onMarkerIncomplete?: (
    transitionName: string,
    marker: string,
    startTime: number,
    deletions: Array<{
      type: string,
      name?: string,
      newName?: string,
      endTime: number,
    }>,
  ) => void,
  onMarkerComplete?: (
    transitionName: string,
    marker: string,
    startTime: number,
    endTime: number,
  ) => void,
};

// The following fields are only used in transition tracing in Profile builds
type TransitionTracingOnlyFiberRootProperties = {|
  transitionCallbacks: null | TransitionTracingCallbacks,
  transitionLanes: Array<Array<Transition> | null>,
|};

// Exported FiberRoot type includes all properties,
// To avoid requiring potentially error-prone :any casts throughout the project.
// The types are defined separately within this file to ensure they stay in sync.
export type FiberRoot = {
  ...BaseFiberRootProperties,
  ...SuspenseCallbackOnlyFiberRootProperties,
  ...UpdaterTrackingOnlyFiberRootProperties,
  ...TransitionTracingOnlyFiberRootProperties,
  ...
};

type BasicStateAction<S> = (S => S) | S;
type Dispatch<A> = A => void;

export type Dispatcher = {|
  getCacheSignal?: () => AbortSignal,
  getCacheForType?: <T>(resourceType: () => T) => T,
  readContext<T>(context: ReactContext<T>): T,
  useState<S>(initialState: (() => S) | S): [S, Dispatch<BasicStateAction<S>>],
  useReducer<S, I, A>(
    reducer: (S, A) => S,
    initialArg: I,
    init?: (I) => S,
  ): [S, Dispatch<A>],
  useContext<T>(context: ReactContext<T>): T,
  useRef<T>(initialValue: T): {|current: T|},
  useEffect(
    create: () => (() => void) | void,
    deps: Array<mixed> | void | null,
  ): void,
  useInsertionEffect(
    create: () => (() => void) | void,
    deps: Array<mixed> | void | null,
  ): void,
  useLayoutEffect(
    create: () => (() => void) | void,
    deps: Array<mixed> | void | null,
  ): void,
  useCallback<T>(callback: T, deps: Array<mixed> | void | null): T,
  useMemo<T>(nextCreate: () => T, deps: Array<mixed> | void | null): T,
  useImperativeHandle<T>(
    ref: {|current: T | null|} | ((inst: T | null) => mixed) | null | void,
    create: () => T,
    deps: Array<mixed> | void | null,
  ): void,
  useDebugValue<T>(value: T, formatterFn: ?(value: T) => mixed): void,
  useDeferredValue<T>(value: T): T,
  useTransition(): [
    boolean,
    (callback: () => void, options?: StartTransitionOptions) => void,
  ],
  useMutableSource<Source, Snapshot>(
    source: MutableSource<Source>,
    getSnapshot: MutableSourceGetSnapshotFn<Source, Snapshot>,
    subscribe: MutableSourceSubscribeFn<Source, Snapshot>,
  ): Snapshot,
  useSyncExternalStore<T>(
    subscribe: (() => void) => () => void,
    getSnapshot: () => T,
    getServerSnapshot?: () => T,
  ): T,
  useId(): string,
  useCacheRefresh?: () => <T>(?() => T, ?T) => void,

  unstable_isNewReconciler?: boolean,
|};
