.PHONY: clean test features serve containers

build:
	$(MAKE) -C web build
	rm -rf build
	tar -xzf web/build/build.tar.gz

clean:
	$(MAKE) -C web clean
	rm -rf build

test:
	$(MAKE) -C web test

features: containers
	docker-compose run features
	docker-compose down

serve: containers
	@echo "[32mView at http://localhost:3000/ [0m(^C to stop)"
	-docker-compose run --service-ports web
	docker-compose down

containers:
	docker-compose build --quiet --parallel
