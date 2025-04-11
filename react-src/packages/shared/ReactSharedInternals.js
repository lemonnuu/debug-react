/**
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @flow
 */

/**
 * !「源码引入环境调整」
 * 1. 注释掉 import * as React from 'react'; 和 const ReactSharedInternals = React.__SECRET_INTERNALS_DO_NOT_USE_OR_YOU_WILL_BE_FIRED;
 * 2. ReactSharedInternals 从 react 包中引入
 */

// import * as React from 'react';

// const ReactSharedInternals =
//   React.__SECRET_INTERNALS_DO_NOT_USE_OR_YOU_WILL_BE_FIRED;

import ReactSharedInternals from '../react/src/ReactSharedInternals';

export default ReactSharedInternals;
