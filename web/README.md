This is a Create React App project
==================================

So all the usual commands work:

-   `yarn start` runs development mode in <http://localhost:3000>.
-   `yarn test` runs unit tests.
-   `yarn build` builds for production in the `build` directory.

I also maintain a Makefile:

-   `make` or `make build` runs `yarn install` and `yarn build`.
-   `make clean` removes the `build` and `node_modules` directories.
-   `make test` runs the unit tests in a docker container.

At the moment, I'm enforcing 100% unit test coverage. I'm enforcing that
only because I don't want to dip below 100% coverage by accident.

Dependencies
------------

-   [Nodejs][1]
-   Yarn (`npm install -g yarn`)
-   [ImageMagick][2] (only for generating logo192.png and favicon.ico)
-   [Docker][3] (if you want to run the containerized tests locally)

[1]: https://nodejs.dev/download/
[2]: https://imagemagick.org/script/download.php
[3]: https://www.docker.com/products/docker-desktop
