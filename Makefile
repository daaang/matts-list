.PHONY: all build clean test features serve

all: test features

build:
	$(MAKE) -C web build

clean:
	$(MAKE) -C web clean
	for i in .podman_web .podman_docs .podman_features; do if [ -e $$i ]; then podman stop `cat $$i`; podman rm `cat $$i`; rm $$i; fi; done

test:
	$(MAKE) -C web test

features: .podman_web .podman_features
	podman start `cat .podman_web`
	podman start --attach `cat .podman_features`

serve: .podman_web .podman_docs
	podman start `cat .podman_web`
	podman start `cat .podman_docs`
	@echo "[32mView at http://localhost:8080/ [0m(docsite at 8081)"

.podman_web: web/Dockerfile.serve web/package.json web/yarn.lock web/public/* web/src/*
	for i in $@; do if [ -e $$i ]; then podman stop `cat $$i`; podman rm `cat $$i`; rm $$i; fi; done
	podman build --tag mlist-web-serve --file web/Dockerfile.serve web
	podman create --network host mlist-web-serve > $@

.podman_docs: docs/matts-list.com/*
	for i in $@; do if [ -e $$i ]; then podman stop `cat $$i`; podman rm `cat $$i`; rm $$i; fi; done
	podman build --tag mlist-docs --file docs/matts-list.com/Dockerfile .
	podman create --network host mlist-docs > $@

.podman_features: features/*.feature features/*/*.rb features/support/Dockerfile features/support/Gemfile features/support/Gemfile.lock
	for i in $@; do if [ -e $$i ]; then podman stop `cat $$i`; podman rm `cat $$i`; rm $$i; fi; done
	podman build --tag mlist-features --file features/support/Dockerfile features
	podman create --tty --network host --env APP_URL=http://localhost:8080 mlist-features > $@
