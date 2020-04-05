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
const chalk = require('chalk')

class ActivationResult extends RuntimeBaseCommand {
  async run () {
    const { args, flags } = this.parse(ActivationResult)
    // note: could be null, but we wait to check
    let activations = [{ activationId: args.activationId }]
    const ow = await this.wsk()
    const name = flags.filter
    const limit = Math.max(1, Math.min(flags.count, ActivationListLimits.max))

    if (flags.last) {
      const options = { limit, skip: 0 }
      if (name) options.name = name
      activations = await ow.activations.list(options)
    } else if (!args.activationId) {
      // just a thought, but we could just return --last activation log when no id is present
      this.error('Missing required arg: `activationId`')
    }

    const logger = this.log
    await Promise.all(activations.map((ax) => {
      return ow.activations.result(ax.activationId).then((result) => {
        if (flags.last && limit > 1) {
          logger(chalk.dim('=== ') + chalk.bold('activation result %s %s:%s (%s) %s'), ax.activationId, ax.name || '', ax.version || '', ActivationResult.statusToString(ax.statusCode), new Date(ax.end).toLocaleString())
        }
        this.logJSON('', result.result)
      }, (err) => {
        this.handleError('failed to retrieve results for activation', err)
      })
    }))
  }
}

ActivationResult.statusToString = (status) => {
  switch (status) {
    case 0: return 'success'
    case 1: return 'application error'
    case 2: return 'developer error'
    default: return 'system error'
  }
}

ActivationResult.args = [
  {
    name: 'activationId'
  }
]

ActivationResult.limits = {
  max: 200
}

ActivationResult.flags = {
  ...RuntimeBaseCommand.flags,
  last: flags.boolean({
    char: 'l',
    description: 'retrieves the most recent activation result'
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

ActivationResult.description = 'Retrieves the Results for an Activation'

ActivationResult.aliases = [
  'rt:activation:result'
]

module.exports = ActivationResult
