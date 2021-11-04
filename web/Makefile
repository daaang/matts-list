.PHONY: clean test containers

build: containers public/favicon.ico public/logo512.png public/logo192.png
	mkdir -p build
	chmod 777 build
	docker-compose run build
	docker-compose down
	chmod go-w build

clean:
	rm -rf build

test: containers
	docker-compose run test
	docker-compose down

containers:
	docker-compose build --quiet --parallel

public/favicon.ico: src/logo16.ico src/logo24.ico src/logo32.ico src/logo64.ico
	convert $^ $@

src/logo16.ico: src/logo32.ico
	convert -resize x16 $< $@

src/logo24.ico: src/logo64.ico
	convert -resize x24 $< $@

src/logo32.ico: src/logo64.ico
	convert -resize x32 $< $@

src/logo64.ico: public/logo512.png
	convert -resize x64 $< $@

public/logo192.png: public/logo512.png
	convert -resize x192 $< $@
