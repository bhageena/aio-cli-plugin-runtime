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

const { statusToString } = require('../../../../src/commands/runtime/activation/banner.js')

test('map status code to string', () => {
  expect(statusToString(0)).toMatch('success')
  expect(statusToString(1)).toMatch('application error')
  expect(statusToString(2)).toMatch('developer error')
  expect(statusToString(3)).toMatch('system error')
  expect(statusToString(undefined)).toMatch('??')
})
