.PHONY: build lint clean distclean dev

build: node_modules svelte.config.js vite.config.js
	npm run build

lint: .eslintignore .eslintrc.cjs node_modules
	npm run lint

clean:
	-rm -rf .svelte-kit build

distclean:
	-rm -rf .svelte-kit build node_modules

dev:
	-npm run dev

node_modules: package.json package-lock.json
	npm install

package-lock.json: package.json
	npm install
