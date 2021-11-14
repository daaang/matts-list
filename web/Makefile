.PHONY: clean test containers teardown

build: node_modules public/* src/*
	yarn build

node_modules: package.json yarn.lock
	yarn install

clean:
	rm -rf build coverage node_modules

# Clean up any stray docker-compose artifacts
teardown:
	docker-compose down

test: containers
	docker-compose run test
	docker-compose down

containers:
	docker-compose build --quiet --parallel

# The current logo is a placeholder that I threw together in like 30
# minutes just to have something better tailored than the react favicon.
# When I make or commission a good logo, I expect that all 6 of these
# resolutions will be managed manually. For now though, they aren't, and
# this is how I generate them.
public/logo192.png: public/logo512.png
	convert -resize x192 public/logo512.png public/logo192.png

public/favicon.ico: public/logo512.png
	convert -resize x64 public/logo512.png tmp64.ico
	convert -resize x32 tmp64.ico tmp32.ico
	convert -resize x24 tmp64.ico tmp24.ico
	convert -resize x16 tmp32.ico tmp16.ico
	convert tmp16.ico tmp24.ico tmp32.ico tmp64.ico public/favicon.ico
	rm tmp16.ico tmp24.ico tmp32.ico tmp64.ico
