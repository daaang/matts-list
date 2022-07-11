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
  /**
   * Create a fake user. The input object will be JSON.stringified as
   * well, and it will be treated as the JWT.
   * @param {Object} user - A fake user object.
   * @param {string} user.id - The user's unique id.
   * @param {string} user.email - The user's email address.
   * @param {string} user.name - The user's name.
   */
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
  /**
   * Convert a netlify user object to a new User (or pull a FakeUser
   * from the GET parameters).
   * @param {Object|null} user - netlify user object (or null)
   * @return {User}
   */
  const newUser = user => {
    // First, check the GET parameters.
    const params = new URLSearchParams(window.location.search)
    if (params.has('fakeuser')) {
      // If there's a fakeuser parameter set, just go with it.
      return new FakeUser(JSON.parse(params.get('fakeuser')))
    }

    return user ? new User(user) : null
  }

  // The login button does not start disabled.
  const [buttonIsDisabled, setButtonDisabled] = useState(false)

  // The user should attempt to get the current netlify user if there
  // is one.
  const [user, setUser] = useState(newUser(netlifyIdentity.currentUser()))

  // Set up the User object on init/login.
  netlifyIdentity.on('init', u => setUser(newUser(u)))
  netlifyIdentity.on('login', u => setUser(newUser(u)))

  // Close the login widget on login. (Otherwise it stays up, getting in
  // the way and taking up space on login.)
  netlifyIdentity.on('login', () => netlifyIdentity.close())

  // On logout, enable the login button.
  netlifyIdentity.on('logout', () => setButtonDisabled(false))

  /**
   * Open the netlify login widget. With this, the user will ideally
   * trigger a login event, closing the widget and setting a new User.
   */
  const login = () => netlifyIdentity.open()

  /**
   * Log the user out (and disable the logout button until finished).
   */
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
