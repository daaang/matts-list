.PHONY: test-app

test-app: app/Containerfile
	podman build --tag mlist-app-test --file $< --target test app
	podman create --tty mlist-app-test > .podman-test-app
	podman start --attach `cat .podman-test-app`
	podman rm `cat .podman-test-app`
	rm .podman-test-app
