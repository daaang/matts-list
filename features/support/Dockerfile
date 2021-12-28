FROM ruby:3.1.0

# Create the app user and ensure that bundle won't tolerate an outdated
# Gemfile.lock.
RUN useradd -d /tmp tester \
      && bundle config --global frozen 1 \
      && apt-get update \
      && apt-get install -y firefox-esr \
      && wget -O /tmp/driver.tar.gz https://github.com/mozilla/geckodriver/releases/download/v0.30.0/geckodriver-v0.30.0-linux64.tar.gz \
      && cd /usr/local/bin \
      && tar -xzf /tmp/driver.tar.gz

# Build the dependencies. To create a new Gemfile, you can run the
# following:
#
#     docker run --rm -v "$PWD":/usr/src/app -w /usr/src/app ruby:3.0 bundle install
WORKDIR /usr/src/app
COPY support/Gemfile support/Gemfile.lock ./
RUN bundle install

# After building dependencies, then copy in the code (which is much more
# likely to change).
COPY . features

ENV APP_URL="http://web:80"
ENV CUCUMBER_PUBLISH_QUIET="true"

USER tester
RUN bundle exec standardrb
CMD ["bundle", "exec", "cucumber", "--tags", "not @draft"]
