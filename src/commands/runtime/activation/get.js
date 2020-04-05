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
const { flags } = require('@oclif/command')
const RuntimeBaseCommand = require('../../../RuntimeBaseCommand')
const { printLogs } = require('@adobe/aio-lib-runtime').utils
const { makeBanner } = require('../../../banner')

class ActivationGet extends RuntimeBaseCommand {
  async run () {
    const { args, flags } = this.parse(ActivationGet)
    const ow = await this.wsk()
    const filter = flags.action
    const options = { limit: 1, skip: flags.skip }
    let id = args.activationId

    try {
      if (!id) {
        if (filter) {
          options.name = filter
        }

        const activations = await ow.activations.list(options)
        if (activations && activations.length > 0) {
          const activation = activations[0]
          id = activation.activationId

          if (flags.last && !flags.quiet && (flags.logs || flags.result)) {
            makeBanner(this.log, activation)
          }
        } else {
          return this.handleError('no activations were returned')
        }
      }

      if (flags.logs) {
        const result = await ow.activations.logs(id)
        printLogs(result, true, this.log)
      } else if (flags.result) {
        const result = await ow.activations.result(id)
        this.logJSON('', result.result)
      } else {
        const result = await ow.activations.get(id)
        // rewrite updated to human readable form
        result.date = moment(result.start).format('YYYY-MM-DD HH:mm:ss')
        this.logJSON('', result)
      }
    } catch (err) {
      this.handleError('failed to retrieve the activation', err)
    }
  }
}

ActivationGet.args = [
  {
    name: 'activationId'
  }
]

ActivationGet.flags = {
  ...RuntimeBaseCommand.flags,
  last: flags.boolean({
    char: 'l',
    description: 'Fetch the most recent activation (default)'
  }),
  skip: flags.integer({
    char: 's',
    description: 'SKIP number of activations',
    default: 0
  }),
  logs: flags.boolean({
    char: 'g',
    description: 'Emit only the logs, stripped of time stamps and stream identifier'
  }),
  result: flags.boolean({
    char: 'r',
    description: 'Emit only the result'
  }),
  action: flags.string({
    char: 'a',
    description: 'Fetch logs for a specific action'
  }),
  quiet: flags.boolean({
    char: 'q',
    description: 'Suppress last activation information header',
    dependsOn: ['last']
  })
}

ActivationGet.description = 'Retrieves an Activation'
ActivationGet.aliases = [
  'rt:activation:get'
]

module.exports = ActivationGet
