# 8. Use Svelte instead of React for the static site

Date: 2023-09-01

## Status

Accepted

## Context

I abandoned development more than a year ago, and as I renew my
interest, I have to wonder what was making building easy, and what was
fighting me. One tool I just never came to enjoy was React.

I can't really put my finger on why I didn't like it, but I also don't
really have to. I build in part because it can be fun, and some tools
are just funner than others.

It's tempting to give up entirely and just use vanilla JavaScript (i.e.
without a framework), but I don't think that would be fun either.
Operating with nothing but the DOM is really nice for simple web pages
with very little local state to keep track of, but I'm building a
potentially complex user interface with a potentially complex state, and
that is what frameworks are built for.

So I did tutorials for Angular, Vue, and Svelte. I didn't enjoy Angular,
and I did enjoy both Vue and Svelte. I enjoyed Svelte a little more than
I enjoyed Vue, and it's hard to put my finger on why.

Maybe it's the lack of a `<template>` tag, or maybe it's the single
curly braces (`{code}` vs `{{code}}`) for inserting code. Maybe it's
just newer and has been able to learn from past mistakes.

I'm definitely not factoring in hypothetical performance improvements
that could come from compiling to vanilla JavaScript vs loading a
virtual DOM. I do not care about that.

## Decision

I'll use Svelte and SvelteKit to build the main static website.

## Consequences

Svelte is kind of a small framework, so maybe it'll be abandoned and
I'll have to switch to something else. I kind of doubt it though.
