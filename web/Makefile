.PHONY: clean test containers

build: containers
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
