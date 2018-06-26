'use strict'

class DatabaseAdapter {
  query (_table, _conditions, callback, req, res) {
    callback(new Error('DATABASE_ADAPTER_NOT_IMPLEMENTED'), null, req, res)
  }
}

exports.DatabaseAdapter = DatabaseAdapter
