# 4. Use Create React App for the static site

Data: 2021-10-08

## Status

Accepted

## Context

I've used [react][1] before, but I know there are alternatives. That
said, a lot of people use react, so it's certainly a safe choice. Also,
react isn't in itself very complicated: it marries javascript with html
in a way that helps seamlessly track javascript state in html.

[1]: https://reactjs.org/

As ever, I'll need to be careful to use pure javascript and pure html
wherever possible, in order to isolate that which depends on react, but
that isn't hard.

[Create React App][2] is also something I've used, and it seems like the
main way to get started when you know you're making something in react.
On one hand, I'm a little uncomfortable with "building around react" in
this way, especially since I could [add react to an existing site][3],
but I'm already dividing this project into separate parts, and create
react app solves a few problems (building a static site) for me.

[2]: https://create-react-app.dev/
[3]: https://reactjs.org/docs/add-react-to-a-website.html

## Decision

I'll use Create React App to get started with the main static website.
