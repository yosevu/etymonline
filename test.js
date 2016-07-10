const test = require('tape')
const etymonline = require('.')

test('etymonline', function (t) {
  t.ok(Array.isArray(etymonline), 'is an array')
  t.ok(etymonline.length > 45000, 'has over 45000 entries')
  t.end()
})
