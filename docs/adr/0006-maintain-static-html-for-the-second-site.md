# 6. Maintain static HTML for the second site

Date: 2021-11-22

## Status

Accepted

## Context

Alongside matts-list.app, I also bought matts-list.com, with the
intention of having a simple website about the app. There are a lot of
ways to generate and maintain static websites.

## Decision

I'll maintain static HTML and CSS in the `docs/matts-list.com` directory
of this repo.

## Consequences

I had better keep the website simple, else it might start getting very
annoying to have to update each page any time I want to change the
layout or add something to a menu.

Also, since I'm not minifying anything, I guess this website won't be
"optimized." I'm not going to dignify this concern with further comment.

More seriously, if I ever supersede this decision, I expect it to be
because I've decided to multiply the number of pages in order to support
languages other than English. I find that very hard to imagine, and I
don't think this decision will make it hard to start using e.g. Jekyll
later.
