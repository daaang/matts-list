# 8. Start building the API with Rust

Date: 2021-11-22

## Status

Accepted

## Context

With [ADR-7][1], I'm committed to building something that will run in a
container. That doesn't really narrow anything down, as there are a lot
of different patterns to follow.

[1]: 0007-start-hosting-the-api-with-digitalocean-and-cockroachdb.md

My favorite languages to write in are ruby and rust, although I'm
frequently disappointed with rust's lack of maturity around ways to
write tests. That said, [Actix][2], [Rocket][3], [Warp][4], and
[Tide][5] each at least document patterns for writing tests when
using them to write web applications. Of the four, Tide also mentions
specifically that it's designed with APIs in mind.

[2]: https://actix.rs/docs/testing/
[3]: https://rocket.rs/v0.5-rc/guide/testing/#testing
[4]: https://docs.rs/warp/0.3.2/warp/test/index.html
[5]: https://github.com/http-rs/tide-testing

I especially enjoyed reading the documentation around Tide; it brought
up all the right questions and didn't feel worryingly hurried. That
said, Actix and Rocket are the most mature. Actix and Tide both have
similar approaches to routing.

On the other hand, if I go with ruby instead of rust, I'm already
familiar with Sinatra, and it wouldn't hurt for me to become familiar
with Rails.

I should probably at least mention that most of my application is
already written in javascript, and I could write the API in javascript.
If I do that, it'll probably be worthwhile to rewrite my cucumber tests
in javascript instead of ruby, which I don't think would be difficult.

## Decision

I'll start developing my API with rust/actix because it sounds like fun.

## Consequences

This repository uses three different programming languages: javascript
for the progressive web application, rust for the API, and ruby for the
end-to-end acceptance tests. I expect this to discourage some people
from contributing to this project, which is a shame.

It would be more inclusive if I wrote this whole thing in javascript,
but I honestly just don't really like javascript. Since the primary
target audience of this entire product is myself, I think it's sensible
to give weight to my own taste.

That said, I'd do well to consider how best to guide a new developer as
this grows in complexity.
