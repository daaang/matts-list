import React, { useState } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.js'
import * as serviceWorkerRegistration from './serviceWorkerRegistration.js'
import netlifyIdentity from 'netlify-identity-widget'

const root = createRoot(document.getElementById('root'))

window.netlifyIdentity = netlifyIdentity
netlifyIdentity.init()

/** Class representing an authenticated user. */
class User {
  /**
   * Create a user.
   * @param {Object} user - A netlifyIdentity user object.
   * @param {string} user.id - The user's unique id.
   * @param {string} user.email - The user's email address.
   * @param {Object} user.user_metadata
   * @param {string} user.user_metadata.full_name
   */
  constructor (user) {
    /**
     * @type {string}
     * @public
     */
    this.id = user.id

    /**
     * @type {string}
     * @public
     */
    this.name = user.user_metadata.full_name

    /**
     * @type {string}
     * @public
     */
    this.email = user.email
  }

  /**
   * Fetch a valid JWT for the user, refreshing if necessary.
   * @async
   * @returns {Promise<string>} The JWT.
   */
  jwt () {
    return netlifyIdentity.currentUser().jwt()
  }
}

class FakeUser extends User {
  constructor (user) {
    super({
      id: user.id,
      email: user.email,
      user_metadata: { full_name: user.name }
    })

    this._jwt = JSON.stringify(user)
  }

  jwt () {
    return new Promise((resolve, reject) => {
      resolve(this._jwt)
    })
  }
}

const AppWithAuth = props => {
  const newUser = user => {
    const params = new URLSearchParams(window.location.search)
    if (params.has('fakeuser')) {
      return new FakeUser(JSON.parse(params.get('fakeuser')))
    }

    return user ? new User(user) : null
  }

  const [buttonIsDisabled, setButtonDisabled] = useState(false)
  const [user, setUser] = useState(newUser(netlifyIdentity.currentUser()))

  netlifyIdentity.on('init', u => setUser(newUser(u)))
  netlifyIdentity.on('login', u => setUser(newUser(u)))
  netlifyIdentity.on('login', () => netlifyIdentity.close())
  netlifyIdentity.on('logout', () => setButtonDisabled(false))

  const login = () => netlifyIdentity.open()

  const logout = () => {
    setButtonDisabled(true)
    setUser(null)
    netlifyIdentity.logout()
  }

  const button = (user)
    ? (<button disabled={buttonIsDisabled} onClick={logout}>Log out</button>)
    : (<button disabled={buttonIsDisabled} onClick={login}>Log in</button>)

  return (
    <>
      <h1>{user ? user.name : 'Matt'}'s List</h1>
      <div>
        {button}
      </div>
      <App user={user} />
    </>
  )
}

root.render(
  <React.StrictMode>
    <AppWithAuth />
  </React.StrictMode>
)

serviceWorkerRegistration.register()
