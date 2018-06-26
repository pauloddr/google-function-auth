'use strict'

const chai = require('chai')
const expect = chai.expect
const {Authorizer} = require('../src/Authorizer')
const {SessionAdapter} = require('../src/adapters/SessionAdapter')
const {DatabaseAdapter} = require('../src/adapters/DatabaseAdapter')
const {PasswordAdapter} = require('../src/adapters/PasswordAdapter')
const {app, setAuthorizer} = require('./support/app')

const shouldError = require('./support/should-error')
// const shouldErrorSession = shouldError(500, 'SESSION_ADAPTER_NOT_IMPLEMENTED')
const shouldErrorDatabase = shouldError(500, 'DATABASE_ADAPTER_NOT_IMPLEMENTED')
const shouldError401 = shouldError(401)

describe('Authorizer', function () {
  context('with base adapters', function () {
    let authorizer = new Authorizer({
      session: new SessionAdapter({secret: 'abc'}),
      database: new DatabaseAdapter(),
      password: new PasswordAdapter()
    })
    authorizer.headers.push(['x-custom-header', 'abc'])

    setAuthorizer(authorizer)

    it('initializes with adapters set', function () {
      expect(authorizer.session).to.be.an.instanceof(SessionAdapter)
      expect(authorizer.database).to.be.an.instanceof(DatabaseAdapter)
      expect(authorizer.password).to.be.an.instanceof(PasswordAdapter)
    })

    describe('#signIn', function () {
      it('fails with error 500', function () {
        let data = {username: 'abc', password: '123'}
        return chai
          .request(app)
          .post('/')
          .send(data)
          .then(shouldErrorDatabase)
      })
    })

    describe('#info', function () {
      it('fails with error 401', function () {
        return chai
          .request(app)
          .get('/')
          .then(shouldError401)
      })
    })

    describe('#delete', function () {
      it('fails with error 401', function () {
        return chai
          .request(app)
          .delete('/')
          .then(shouldError401)
      })
    })

    describe('#options', function () {
      it('returns headers', function () {
        return chai
          .request(app)
          .options('/')
          .then(response => {
            expect(response).to.have.status(204)
            expect(response).to.have.header('x-custom-header', 'abc')
          })
      })
    })
  })
})
