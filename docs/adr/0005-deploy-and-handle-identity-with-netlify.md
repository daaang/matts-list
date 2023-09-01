# 5. Deploy and handle identity with Netlify

Date: 2021-11-22  
Questioned: 2023-09-01

## Status

Not sure anymore; will revisit later

## Context

There are something like a million different CDNs out there, and, since
my javascript app is a static site, I absolutely want it to be deployed
to a CDN if possible.

Having already heard about [Netlify][1], I gave it a try to see how easy
it would be to deploy with them. Answer is: very easy. Also, the price
is free (until I start consuming way more resources than I'm likely to).

[1]: https://www.netlify.com/

I also know that I'll need authentication, and it seems like [Auth0][2]
is basically **the place** to do that, but netlify also has an identity
service. Here's a quick comparison between their pricing:

| Service | Max users while free | How much it costs to go over |
| ------- | -------------------- | ---------------------------- |
|   Auth0 |                7,000 |                  $160+/month |
| Netlify |                1,000 |                    $99/month |

[2]: https://auth0.com/

I don't expect to ever have more than one user, so this comparison is
mostly academic.

## Decision

I'll use Netlify not only as my CDN but also as my identity provider.

## Consequences

If I find myself supporting more than a thousand active users, I'll have
to start using Netlify's business tier for &x24;99/month. This will not only
entitle me to unlimited active users but also to more bandwidth, more
build minutes, and whatever else comes with that. If my app is being
used by thousands of people, it makes sense to actually pay for hosting.
