'use strict'

const {SessionAdapter} = require('../../src/adapters/SessionAdapter')

class MockSessionAdapter extends SessionAdapter {
  create (_userRecord, req, res, callback) {
    res.headers('X-Token', 'abc')
    callback(null, req, res)
  }

  load (req, res, next) {
    if (req.headers.authorization === 'abc') {
      res.locals.session = {id: 'abc'}
    }
    next()
  }

  destroy (_req, _res, callback) {
    callback(null)
  }
}

exports.MockSessionAdapter = MockSessionAdapter
