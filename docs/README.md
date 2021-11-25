System Context and Containers
=============================

When I talk about *containers* and *components* in this document, I'm
not talking about docker containers or react components. In this
document, I'm following [the C4 model][1].

[1]: https://c4model.com/

Context and Containers
----------------------

![A diagram showing four things: two people, one software system, and
one external software system. The two people are Matt the User and Matt
the Architect. Matt the User manages his to-do list with the Matt's List
software system, and Matt the Architect defines desired behavior with
the Matt's List software system. The external software system is Netlify
Identity; the Matt's List software system uses Netlify Identity for
authentication, and Netlify Identity verifies Matt's identity with Matt
the User.][2]

![This diagram is like the one before except that the Matt's List
software system has been divided into five containers: first is the
Persistent Web Application (PWA) in /web, which is what Matt the User
uses to manage his to-do list, and it's the PWA that authenticates with
Netlify Identity; second is the Companion Website in /docs/matts-app.com
which Matt the User might use to learn about Matt's List, and both the
Companion Website and the PWA link to each other; third is the API in
/api, and the PWA sends events to and receives state from the API;
fourth is the Database, and the API can read from and write to the
Database; and fifth is the End-to-end Acceptance Tests in /features and
which know how to build docker containers for the PWA, the API, and the
Database. Matt the Architect defines desired behavior with the
End-to-end Acceptance Tests.][3]

### PWA Components ###

![This diagram contains some of the people, software systems, and
containers from the container diagram, and the PWA container has been
divided into four components: first is index.html, a static frame around
the app; second is index.js, untested code for logging in and out; third
is App.js, nothing so far; and fourth is List.js, which renders a list
of items. Matt the User visits index.html with a browser, clicks the
login button in index.js, and manages his to-do list with List.js. The
Companion Website and index.html link to one another, and index.html
surrounds index.js. Index.js uses the Netlify Identity Widget to engage
with Netlify Identity, and it passes user data to App.js. App.js passes
user data to List.js and builds requests for the API.][4]

### End-to-end Acceptance Test Components ###

![This diagram contains some of the people, software systems, and
containers from the container diagram, and the End-to-end Acceptance
Tests container has been divided into four components: first is the
Gherkin .feature files which define features; second is the Step
definitions which translate from gherkin to ruby; third is the Ruby
support code which sets up selenium and knows the UI; and fourth is the
Docker/gemfile support code which sets up the environment. Matt the
Architect defins desired behavior in the Gherkin .feature files. The
Docker/gemfile support code builds docker containers for the PWA, the
API, and the Database, and it runs the tests in the Gherkin .feature
files and interprets the tests with the Step definitions. The Step
definitions use the UI with the Ruby support code, and the Ruby support
code drives the UI to manage a to-do list with the PWA.][5]

Deployments
-----------

### Live ###

![This diagram shows that the Companion Website is deployed
to Netlify at matts-list.com and that the PWA is deployed to
Netlify at matts-list.app. It also shows that the API is
deployed in DigitalOcean Kubernetes and that the Database is
deployed in CockroachDB Serverless.][6]

### Testing ###

![This diagram shows that the End-to-end Acceptance Tests run with make
features. The PWA is at web:80; the API is at api:80; and the Database
is at db:8080.][7]

[2]: ./diagrams/context.jpg             "System Context for Matt's List"
[3]: ./diagrams/containers.jpg          "Containers in Matt's List"
[4]: ./diagrams/components-pwa.jpg      "Components in the PWA"
[5]: ./diagrams/components-features.jpg "Components in the Acceptance Tests"
[6]: ./diagrams/deployment-live.jpg     "Live Deployment"
[7]: ./diagrams/deployment-features.jpg "Testing Deployment"
