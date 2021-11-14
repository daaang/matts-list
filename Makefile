dc = docker-compose --file features/support/docker-compose.yml --project-directory .
.PHONY: all clean test features serve containers teardown

# Default action is running all unit and acceptance tests
all: test features

build:
	$(MAKE) -C web build

clean:
	$(MAKE) -C web clean

# Clean up any stray docker-compose artifacts
teardown:
	$(MAKE) -C web teardown
	$(dc) down

# Run all unit tests
test:
	$(MAKE) -C web test

# Run the end-to-end acceptance tests
features: containers
	$(dc) run features
	$(dc) down

# Run a production deployment locally with docker-compose
serve: containers
	@echo "[32mView at http://localhost:8080/ [0m(^C to stop)"
	-$(dc) run --service-ports web
	$(dc) down

containers:
	$(dc) build --quiet --parallel
