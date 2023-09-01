# 10. Use `app` and `server` instead of `web` and `api`

Date: 2023-09-01

## Status

Accepted

## Context

Last time, I copied redwood with this monorepo directory structure:

- `api`: Server-side code
- `docs`: Documentation
- `features`: Feature specifications and end-to-end acceptance tests
- `web`: Client-side code (single-page application)

I stand by `docs` as standard and `features` as well, but `api` and
`web` are downright stupid names in my opinion.

**Contenders for client-side code:**

- `web`
- `client`
- `single_page_app` (or `spa`)
- `frontend`
- `app`
- `webapp`
- `browser_app`
- `cdn`
- `progressive_web_app` (or `pwa`)

**Contenders for server-side code:**

- `api`
- `server`
- `backend`
- `backup`
- `archive`
- `junction`

I think I like `app` and `server` because they convey the scope clearly:
one represents the application itself (which can be run on a phone or a
tablet or a browser); and the other, that code which must run remotely
on some centralized server.

Also neither conflicts alphabetically with `docs` or `features`, and it
leaves me room in the future to add `cli` if I find I want to.

Moreover, if we're talking alphabetical order, it puts the application
first, which is where I think it belongs. (Next could come a CLI, which
would be similarly user-facing.) After that, documentation, which is
important but of secondary importance to the application itself. Then
there's the feature specifications, which are essentially
machine-readable documentation, and at the bottom, we have the server
code, which should be little more than a shared archive.

One could argue that `client`/`server` is a better dichotomy, but I
don't think `client` has a clear meaning on its own (not to mention it
shares the same first three letters as `cli`). Or `frontend`/`backend`,
which has stood the test of time, but look: `frontend` has the same
first letter as `features`, so it's out. My van, my rules.

I guess I ought to give more time to `api` and `web`, which I called
stupid earlier. I dislike `web` because it implies a misleading scope.
I almost feel `offline` would be a better name than `web`, since we're
talking about an application that should work just fine without an
internet connection, assuming the single-page application has been
downloaded. Calling it `web` only makes sense because it's written in
HTML, CSS, and JavaScript, and the web is much more than that.

We literally call our servers "web servers" sometimes, so why would I
use the word _web_ to describe the thing that goes to a CDN?

I also dislike `api`, but that might just be personal tbh. If I'm being
fair, an application programming interface is exactly what runs on the
server—but an interface to what? An interface implies something that
lies between two more important players. I agree that the application is
more important, but what's the other thing? (It's a database.)

I don't care whether there's a database, but, from the perspective of my
application, something has to run on a server somewhere. Maybe it's an
API to yet another thing, or maybe it's the thing itself. The only thing
I'm certain about is that it will need to be hosted on a server.

Why `app` instead of `application`? Back in 2010 I believe I was firmly
in the camp that felt _app_ was an annoying buzzword, and I wanted it to
go away. But it's 2023, and I think it's safe to say that _app_ has
earned its place as a word that implies something distinct from the more
generic _application._ An _app_ makes me think of a smartphone with a
screen full of little rectangles, and those rectangles are called apps.

Like it or not, `app` is the perfect word for what I am attempting to
build for myself.

## Decision

I'll move forward with client-side code in an `app` directory and with
server-side code in a `server` directory.

## Consequences

My directory structure will be as follows:

- `app`: single-page progressive web application code
- `cli`: maybe someday I'll make a command-line interface
- `docs`: documentation
- `features`: feature specifications and end-to-end acceptance tests
- `pipeline`: maybe if I want tests to run as part of deployment that
  are distinct from the features, I might put them here, but honestly
  this idea could use more development and thought, and it's distant.
- `server`: server-side application code
