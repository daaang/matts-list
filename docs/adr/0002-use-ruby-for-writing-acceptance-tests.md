# 2. Use ruby for writing acceptance tests

Date: 2021-10-04

## Status

Accepted

## Context

[The cucumber website][1] lists a lot of official plugins, but the top
three are java, javascript, and ruby. There are other officially
supported languages, but they're weird ones like ocaml and scala, so,
for me, this is really a choice between javascript and ruby.

[1]: https://cucumber.io/docs/installation/ruby/

In javascript's favor: my static site will be written in javascript
because there is no other option. If this is in javascript too, then
this won't be adding a new language to my repository.

In ruby's favor: I like ruby better. Also, per ADR-1, I already decided
to treat these components in isolation from one another. Besides, if I
go with rails or sinatra, then ruby shares javascript's only pro.

My intention is that, rather than require that a development environment
run bundle install and bundle exec cucumber, a developer (or a github
action) should be able to run docker-compose up, and one of the
containers should run through all the features.

## Decision

I'll use ruby to implement my acceptance tests. It'll be set up to run
in a container with docker compose, along with any other containers that
the application requires.

## Consequences

Regardless of what language I choose, by insisting from the beginning
that the feature specs be isolated in their own container, I'm
committing to a model where those tests truly come from the outside.
I've never done that before, but it seems like a good idea. I hope it
isn't a bad idea.
