.PHONY: all reskin clean

# jsmin=python -m rjsmin < $1 > $2
# csslint=csslint-0.6 $1 > $2

# uncomment to ease debug:
jsmin=cat < $1 > $2

ICONS=$(wildcard src/icons/icon_*.svg)

all: 1ftn

1ftn: src/_code.js  src/index.html  src/runner.py ${ICONS} src/style.css compile
	./compile
	@cp 1ftn 1ftn.unthemed
	./themify

reskin:
	@cp 1ftn.unthemed 1ftn
	./themify

src/_code.js: src/code.js Makefile
#     cp $< $@
	$(call jsmin , $<, $@)

src/icons.svg: ${ICONS}
	@echo "haha"
	touch $@

clean:
	rm -f 1ftn
	rm -f src/_style.css src/_code.js
