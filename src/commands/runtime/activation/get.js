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
const { printLogs } = require('@adobe/aio-lib-runtime').utils
const chalk = require('chalk')

class ActivationGet extends RuntimeBaseCommand {
  async run () {
    const { args, flags } = this.parse(ActivationGet)
    let id = args.activationId
    try {
      const ow = await this.wsk()
      if (flags.last) {
        const ax = await ow.activations.list({ limit: 1, skip: 0 })
        if (ax && ax.length > 0) {
          id = ax[0].activationId
        } else {
          this.handleError('no activations were returned')
        }
      }
      if (!id) {
        this.error('Missing required arg: `activationId`')
      }

      if (flags.logs) {
        const result = await ow.activations.logs(id)
        this.log(chalk.dim('=== ') + chalk.bold('activation logs %s %s'), id, flags.filter || '')
        printLogs(result, true, this.log)
      } else if (flags.result) {
        const result = await ow.activations.result(id)
        this.logJSON('', result.result)
      } else {
        const result = await ow.activations.get(id)
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
    description: 'retrieves the most recent activation'
  }),
  logs: flags.boolean({
    char: 'g',
    description: 'emit only the logs, stripped of time stamps and stream identifier'
  }),
  result: flags.boolean({
    char: 'r',
    description: 'emit only the result'
  })
}

ActivationGet.description = 'Retrieves an Activation'
ActivationGet.aliases = [
  'rt:activation:get'
]

module.exports = ActivationGet
