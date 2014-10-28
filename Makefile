csslint=csslint-0.6

all: 1ftn

1ftn: src/_code.js  src/index.html  src/runner.py	src/_style.css compile
	./compile

src/_code.js: src/code.js
	jsmin < $< > $@

src/_style.css: src/style.css
	${csslint} $< > $@
