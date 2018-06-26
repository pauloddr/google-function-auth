'use strict'

class PasswordAdapter {
  validate (_hash, _plain, callback, req, res) {
    callback(new Error('PASSWORD_ADAPTER_NOT_IMPLEMENTED'), false, req, res)
  }
}

exports.PasswordAdapter = PasswordAdapter
