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

const { flags } = require('@oclif/command')
const RuntimeBaseCommand = require('../../../RuntimeBaseCommand')
const ActivationListLimits = require('./list').limits
const { printLogs } = require('../../../runtime-helpers')
const chalk = require('chalk')

class ActivationLogs extends RuntimeBaseCommand {
  async run () {
    const { args, flags } = this.parse(ActivationLogs)
    // note: could be null, but we wait to check
    let activations = [{ activationId: args.activationId }]
    const ow = await this.wsk()

    if (flags.last && args.activationId) {
      this.error('Cannot specify an `activationId` with --last flag.')
    } else if (flags.last || !args.activationId) {
      const name = flags.filter
      const limit = Math.max(1, Math.min(flags.count, ActivationListLimits.max))
      const options = { limit, skip: 0 }
      if (name) options.name = name
      activations = await ow.activations.list(options)
    }

    const logger = this.log
    await Promise.all(activations.map((ax) => {
      return ow.activations.logs(ax.activationId).then((result) => {
        logger(chalk.dim('=== ') + chalk.bold('activation logs %s %s:%s'), ax.activationId, ax.name || '', ax.version || '')
        if (result.logs.length) {
          printLogs(result, flags.strip, logger)
        } else {
          logger('This activation does not have any logs.')
        }
      }, (err) => {
        this.handleError('failed to retrieve logs for activation', err)
      })
    }))
  }
}

ActivationLogs.args = [
  {
    name: 'activationId'
  }
]

ActivationLogs.flags = {
  ...RuntimeBaseCommand.flags,
  last: flags.boolean({
    char: 'l',
    description: 'retrieves the most recent activation logs'
  }),
  strip: flags.boolean({
    char: 'r',
    description: 'strip timestamp information and output first line only'
  }),
  count: flags.integer({
    char: 'c',
    description: `used with --last, return the last \`count\` activation logs (up to ${ActivationListLimits.max})`,
    default: 1
  }),
  filter: flags.string({
    char: 'f',
    description: 'the name of the activations to filter on (this flag may only be used with --last)'
  })
}

ActivationLogs.description = 'Retrieves the Logs for an Activation'

ActivationLogs.aliases = [
  'runtime:activation:log',
  'runtime:log',
  'runtime:logs',
  'rt:activation:logs',
  'rt:activation:log',
  'rt:log',
  'rt:logs'
]

module.exports = ActivationLogs
