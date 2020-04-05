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

const { statusToString, bannerFunc } = require('../../../src/banner.js')

jest.mock('chalk', () => ({
  dim: (_) => _,
  bold: (_) => _
}))

test('map status code to string', () => {
  expect(statusToString(0)).toMatch('success')
  expect(statusToString(1)).toMatch('application error')
  expect(statusToString(2)).toMatch('developer error')
  expect(statusToString(3)).toMatch('system error')
  expect(statusToString(undefined)).toMatch('??')
})

test('generate custom log banner', () => {
  const logger = jest.fn()
  const banner = bannerFunc(logger)
  banner({
    end: new Date(),
    activationId: '123',
    name: 'hello',
    version: '1.2.3',
    statusCode: 0
  })

  expect(logger).toHaveBeenCalledWith(expect.stringMatching(/.*=== 123 \(success\) *.* hello:1\.2\.3/))
})
