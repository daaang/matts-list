containers = .podman_web .podman_docs .podman_features
define stop-container =
if [ -e $@ ]; then podman stop `cat $@`; podman rm `cat $@`; rm $@; fi
endef

.PHONY: all build clean test features serve

all: test features

build:
	$(MAKE) -C web build

clean:
	$(MAKE) -C web clean
	for i in $(containers); do if [ -e $$i ]; then podman stop `cat $$i`; podman rm `cat $$i`; rm $$i; fi; done

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
	$(stop-container)
	podman build --tag mlist-web --file $< web
	podman create --network host mlist-web > $@

.podman_docs: docs/matts-list.com/Dockerfile docs/matts-list.com/*
	$(stop-container)
	podman build --tag mlist-docs --file $< .
	podman create --network host mlist-docs > $@

.podman_features: features/support/Dockerfile features/*.feature features/*/*.rb features/support/Gemfile features/support/Gemfile.lock
	$(stop-container)
	podman build --tag mlist-features --file $< features
	podman create --network host --env APP_URL=http://localhost:8080 --tty mlist-features > $@
