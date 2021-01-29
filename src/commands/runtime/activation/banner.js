/*
Copyright 2019 Adobe Inc. All rights reserved.
This file is licensed to you under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License. You may obtain a copy
of the License at http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software distributed under
the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR REPRESENTATIONS
OF ANY KIND, either express or implied. See the License for the specific language
governing permissions and limitations under the License.
*/

const moment = require('moment')
const chalk = require('chalk')

class ActivationBanner {
}

ActivationBanner.statusToString = (status) => {
  switch (status) {
    case 0: return 'success'
    case 1: return 'application error'
    case 2: return 'developer error'
    case 3: return 'system error'
    default: return '??'
  }
}

/**
 * Creates an info banner for an activation.
 *
 * @param {Activation} activation metadata
 * @param {Array<string>} activationLogs the logs of the activation (may selectively suppress banner if there are no log lines)
 * @returns banner string or falsy if no banner is desired
 */
ActivationBanner.makeBanner = (activation, activationLogs) => {
  const end = moment(activation.end).format('MM/DD HH:mm:ss')
  return chalk.dim('=== ') + chalk.bold(
    `${activation.activationId} ` +
      `(${ActivationBanner.statusToString(activation.statusCode)}) ` +
      `${end} ` +
      `${activation.name}:${activation.version || ''}`)
}

module.exports = ActivationBanner
