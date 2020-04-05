
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
const { makeBanner } = require('../../../banner')

class ActivationResult extends RuntimeBaseCommand {
  async run () {
    const { args, flags } = this.parse(ActivationResult)
    // note: could be null, but we wait to check
    let activations = [{ activationId: args.activationId }]
    const ow = await this.wsk()
    const filter = flags.action
    const limit = Math.max(1, Math.min(flags.limit, ActivationListLimits.max))
    const options = { limit, skip: flags.skip }

    if (!args.activationId) {
      if (filter) {
        options.name = filter
      }
      activations = await ow.activations.list(options)
    }

    await Promise.all(activations.map((activation) => {
      return ow.activations.result(activation.activationId).then((result) => {
        if (flags.last && !flags.quiet) {
          makeBanner(this.log, activation)
        }
        this.logJSON('', result.result)
      }, (err) => {
        this.handleError('failed to retrieve results for activation', err)
      })
    }))
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
    description: 'Fetch the most recent activation result (default)'
  }),
  limit: flags.integer({
    char: 'n',
    description: `Fetch the last LIMIT activation results (up to ${ActivationListLimits.max})`,
    default: 1
  }),
  skip: flags.integer({
    char: 's',
    description: 'SKIP number of activations',
    default: 0
  }),
  action: flags.string({
    description: 'Fetch results for a specific action',
    char: 'a'
  }),
  quiet: flags.boolean({
    char: 'q',
    description: 'Suppress last activation information header',
    dependsOn: ['last']
  })
}

ActivationResult.description = 'Retrieves the Results for an Activation'

ActivationResult.aliases = [
  'rt:activation:result'
]

module.exports = ActivationResult
