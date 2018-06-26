'use strict'

const Router = require('router')
const NOOP = function () {}

class Authorizer {
  constructor (options) {
    if (!options || !options.session || !options.database || !options.password) {
      throw new Error('AUTHORIZER_ADAPTERS_REQUIRED')
    }
    this.session = options.session
    this.database = options.database
    this.password = options.password
    this.table = options.table || process.env['GFA_TABLE_NAME'] || 'User'
    this.fields = options.fields || {
      primary: process.env['GFA_FIELD_USERNAME'] || 'username',
      password: process.env['GFA_FIELD_PASSWORD'] || 'password'
    }
    this.router = new Router()
    this.headers = []
    this.setCallbacks()
    this.routerize()
  }

  routerize () {
    var router = this.router
    router.use(this.callbacks._headers)
    router.use(this.session.load)
    router.post('/*', this.callbacks.signIn)
    router.get('/*', this.callbacks._authorize, this.callbacks.info)
    router.head('/*', this.callbacks._authorize, this.callbacks.empty)
    router.delete('/*', this.callbacks._authorize, this.callbacks.signOut)
    router.options('/*', this.callbacks.empty)
    // router.all('/*', this.callbacks.notFound)
    router.use(this.callbacks.error)
  }

  handle (req, res) {
    this.router.handle(req, res, NOOP)
  }

  _authorize (req, res, next) {
    var session = this.session.data(res)
    if (!session || !session.id) {
      return res.status(401).end()
    }
    next()
  }

  // POST /session
  signIn (req, res) {
    var primaryField = this.fields.primary
    var conditions = [[primaryField, '=', req.body[primaryField]]]
    this
      .database
      .query(
        this.table, conditions,
        this.callbacks.signInQueryResult,
        req, res
      )
  }

  signInQueryResult (err, results, req, res) {
    if (err) {
      console.error('signInQueryResult', err.message)
      return this.error(err, req, res)
    }
    var user = results[0]
    if (!user) {
      return res.status(401).end()
    }
    res.locals.userRecord = user
    var passwordField = this.fields.password
    this
      .password
      .validate(
        user[passwordField], req.body[passwordField],
        this.callbacks.signInPasswordResult,
        req, res
      )
  }

  signInPasswordResult (err, valid, req, res) {
    if (err) {
      console.error('signInPasswordResult', err.message)
      return this.error(err, req, res)
    }
    if (!valid) {
      return res.status(401).end()
    }
    this
      .session
      .create(
        res.locals.userRecord, req, res,
        this.callbacks.signInSessionResult
      )
  }

  signInSessionResult (err, req, res) {
    if (err) {
      console.error('signInSessionResult', err.message)
      return this.error(err, req, res)
    }
    res.status(201).json(this.session.data(res))
  }

  // DELETE /session
  signOut (req, res) {
    this.session.destroy(req, res, this.callbacks.signOutSessionDestroy)
  }

  signOutSessionDestroy (err, req, res) {
    if (err) {
      console.error('signOutSessionDestroy', err.message)
      return this.error(err, req, res)
    }
    this.empty(req, res)
  }

  // GET /session
  info (req, res) {
    res.status(200).json(this.session.data(res))
  }

  // HEAD /session
  // OPTIONS /session
  empty (req, res) {
    res.status(204).end()
  }

  // Called when one of the middlewares fire next(err)
  error (err, req, res, _next) {
    res.status(500).json({code: err.message})
  }

  notFound (req, res) {
    if (!res.status) {
      res.status(404).end()
    }
  }

  _headers (req, res, next) {
    var header
    for (header of this.headers) {
      res.header(header[0], header[1])
    }
    next()
  }

  // Store bound callbacks for better performance
  setCallbacks () {
    this.callbacks = {
      _authorize: this._authorize.bind(this),
      _headers: this._headers.bind(this),
      signIn: this.signIn.bind(this),
      signInQueryResult: this.signInQueryResult.bind(this),
      signInPasswordResult: this.signInPasswordResult.bind(this),
      signInSessionResult: this.signInSessionResult.bind(this),
      signOut: this.signOut.bind(this),
      signOutSessionDestroy: this.signOutSessionDestroy.bind(this),
      info: this.info.bind(this),
      empty: this.empty.bind(this),
      error: this.error.bind(this),
      notFound: this.notFound.bind(this)
    }
  }
}

exports.Authorizer = Authorizer
