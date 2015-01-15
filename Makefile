jsmin=python -m rjsmin < $1 > $2
# csslint=csslint-0.6 $1 > $2
# cssmin=python -m rcssmin < $1 > $2

# uncomment to ease debug:
# jsmin=cat < $1 > $2
# cssmin=cat < $1 > $2

ICONS=$(wildcard src/icons/icon_*.svg)

all: 1ftn

1ftn: src/_code.js  src/index.html  src/runner.py ${ICONS} src/style.css compile
	./compile

src/_code.js: src/code.js Makefile
	$(call jsmin , $<, $@)

src/icons.svg: ${ICONS}
	@echo "haha"
	touch $@

clean:
	rm 1ftn
	rm src/_style.css src/_code.js
