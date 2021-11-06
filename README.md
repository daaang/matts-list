Matt's List
===========

I'm Matt and this is my to do list.

Make commands
-------------

All the make commands rely on docker-compose, so you'll need that and
docker installed and working in order to use them.

You can run `make build` to build the static site in the `build`
directory, and you can clean it up with `make clean`.

You can also run tests with `make features` for acceptance tests and
`make test` for unit tests.

To build the static site and run it inside a container, you can run
`make serve`.

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
