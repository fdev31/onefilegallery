csslint=csslint-0.6
cssmin=python -m rcssmin

all: 1ftn

1ftn: src/_code.js  src/index.html  src/runner.py	src/_style.css compile
	./compile

src/_code.js: src/code.js
	jsmin < $< > $@

src/_style.css: src/style.css
	${csslint} $< > tmp_
	${cssmin} < tmp_ > $@
	rm tmp_

clean:
	rm 1ftn
	rm src/_style.css src/_code.js
