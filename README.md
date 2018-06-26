# google-function-auth

This is the base project for [google-function-authorizer](https://github.com/pauloddr/google-function-authorizer) without the external dependencies.

Use this library if you do __not__ want to use either Google Datastore, Bcrypt, or Client Sessions.

## Adapters

Each major functionality of this library relies on an adapter.

Since this library has no dependencies, you need to require and configure the adapters manually.

First, build and configure the adapters, then initialize the authorizer with them:

```javascript
const ClientSessionsAdapter = require('gfa-client-sessions-adapter')
const session = new ClientSessionsAdapter({
  secret: 'MYSECRET',
  // ... other session settings
})

const GoogleDatastoreAdapter = require('gfr-datastore-adapter')
const database = new GoogleDatastoreAdapter({
  table: 'Users',
  // ... other database settings
})

const BcryptAdapter = require('gfr-bcrypt-adapter')
const password = new BcryptAdapter({
  rounds: 10,
  // ... other password settings
})

const Authorizer = require('google-function-auth')
const authorizer = new Authorizer({
  session: session,
  database: database,
  password: password
})
```

You can also create your own adapters. This library provides base classes for your new adapters to extend from:

### SessionAdapter

This adapter handles client sessions and validates session credentials.

If you prefer JWT tokens instead of cookies, you can create a new adapter here.

### DatabaseAdapter

This adapter handles database operations, such as queries, insertions, updates, etc.

If you prefer MySQL or Postgres as opposed to Datastore, you can create a new adapter here.

### PasswordAdapter

This adapter hashes and verifies passwords.

If you prefer something other than Bcrypt, you can create a new adapter here.

## Custom Middleware

This library uses the [router](https://github.com/pillarjs/router) package to handle routing.

Custom middleware isn't supported at this time, but in the meantime, you can access the router via `authorizer.router` and manipulate it to insert additional middleware where you need.

The current stack order is:

* 0 - add headers
* 1 - load session from request
* 2 - handle POST (sign-in)
* 3 - handle GET (current session)
* 4 - handle HEAD (current session)
* 5 - handle DELETE (sign-out)
* 6 - handle OPTIONS (preflight)
* 7 - handle rest of methods (404)
* 8 - capture middleware errors

Another way is creating your own Authorizer class, and overriding the `routerize()` method, adding your middlewares to the stack.

## License

MIT
