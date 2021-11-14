Matt's List
===========

I'm Matt and this is my to do list.

Make commands
-------------

-   `make` runs all tests: linters, unit tests, and end-to-end
    acceptance tests.
-   `make test` runs all linters and unit tests.
-   `make features` runs the end-to-end acceptance tests.
-   `make serve` runs a production build in a container listening
    at <http://localhost:8080>.

### Dependencies

-   [Docker][1] (with docker-compose) is all you need to run all
    the tests.

[1]: https://www.docker.com/products/docker-desktop

That said, if you're planning on doing local development work, you'll
probably want to be running nodejs locally. It's the difference between
taking a couple seconds versus a couple minutes to run unit tests. See
[the dependencies for web development][2].

[2]: web/

Layout
------

-   **docs/adr/** holds records for decisions I've made, documenting
    my reasoning.
-   **features/** contains acceptance tests, implemented in ruby
    and cucumber:
    -   The tests themselves are `.feature` files in the base directory.
    -   In addition to a couple `.rb` files, the **features/support/**
        directory contains the Gemfiles and Dockerfile for actually
        running the acceptance tests.
-   **web/** is the single-page web application, implemented in
    javascript and react. It has [its own README][2].

Glossary
--------

There are **lists** of **items.** There are three types of item that
might be on a list:

-   **Habits** are items that never leave the list. Once done, they
    become optional for the rest of the day.
-   **Routines** are items that leave their list once done but will
    return after some interval.
-   **Tasks** are items that never return to the list. Once done, they
    are done forever.

-   If you **complete** an item, then it will be visible on the list for
    the rest of the day, and it will be off the list tomorrow.
-   If you **dismiss** an item, then it will be hidden from the list for
    the rest of the day, and it will reappear tomorrow.

-   If an item is **optional,** then it is visible, but there's no real
    need to complete it.
-   If an item is **completed,** then you must have completed it earlier
    today, and you can **reopen** it if it was completed by mistake.
    Otherwise, it'll be gone tomorrow.

-   The **daily reset** happens at a time of your choosing.

Decisions
---------

1.  [Develop the API, static site, and acceptance tests in isolation][ADR-1]
2.  [Use ruby for writing acceptance tests][ADR-2]
3.  [Use the MIT license][ADR-3]
4.  [Use Create React App for the static site][ADR-4]

[ADR-1]: docs/adr/0001-develop-the-api-static-site-and-acceptance-tests-in-isolation.md
[ADR-2]: docs/adr/0002-use-ruby-for-writing-acceptance-tests.md
[ADR-3]: docs/adr/0003-use-the-mit-license.md
[ADR-4]: docs/adr/0004-use-create-react-app-for-static-site.md
