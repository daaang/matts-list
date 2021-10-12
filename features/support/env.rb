require "capybara/cucumber"

Capybara.default_driver = :selenium_headless
Capybara.app_host = ENV["APP_URL"]
