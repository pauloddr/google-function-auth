'use strict'

class SessionAdapter {
  constructor (opts) {
    var options = opts || {}
    this.name = options.name || process.env['GFA_SESSION_NAME'] || 'userSession'
    this.secret = options.secret || process.env['GFA_SESSION_SECRET']
    this.duration = options.duration || +process.env['GFA_SESSION_DURATION'] || (24 * 60 * 60 * 1000)
    this.activeDuration = options.activeDuration || +process.env['GFA_SESSION_ACTIVE_DURATION'] || (1000 * 60 * 5)
    this.expose = options.expose || (process.env['GFA_SESSION_EXPOSE'] || 'username').split(',')
  }

  // This method is called by other Google Functions.
  authorize (req, res, success, error) {
    this.load(req, res)
    var session = this.data(res)
    if (!session || !session.id) {
      if (error) {
        return error(req, res)
      }
      return res.status(401).end()
    }
    success(req, res, session)
  }

  // Used as middleware
  load (_req, _res, next) {
    // this method should fill res.locals.session
    next()
  }

  create (_userRecord, req, res, callback) {
    callback(new Error('SESSION_ADAPTER_NOT_IMPLEMENTED'), req, res)
  }

  destroy (req, res, callback) {
    callback(new Error('SESSION_ADAPTER_NOT_IMPLEMENTED'), req, res)
  }

  data (res) {
    return res.locals.session
  }
}

exports.SessionAdapter = SessionAdapter
