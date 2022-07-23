containers = .podman_test
define stop-container =
if [ -e $@ ]; then podman stop `cat $@`; podman rm `cat $@`; rm $@; fi
endef

.PHONY: clean distclean test

build: node_modules public/* src/*
	yarn build

node_modules: package.json yarn.lock
	yarn install

yarn.lock: package.json
	yarn install

clean:
	rm -rf build coverage
	for i in .podman_test; do if [ -e $$i ]; then podman stop `cat $$i`; podman rm `cat $$i`; rm $$i; fi; done

distclean: clean
	rm -rf node_modules

test: .podman_test
	podman start --attach `cat .podman_test`

.podman_test: Dockerfile.test package.json yarn.lock public/* src/*
	$(stop-container)
	podman build --tag mlist-web-test --file $< .
	podman create --tty mlist-web-test > $@

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
