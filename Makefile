jsmin=python -m rjsmin < $1 > $2
csslint=csslint-0.6 $1 > $2
cssmin=python -m rcssmin < $1 > $2

# uncomment to ease debug:
# jsmin=cat < $1 > $2
# cssmin=cat < $1 > $2

all: 1ftn

1ftn: src/_code.js  src/index.html  src/runner.py	src/_style.css compile
	./compile

src/_code.js: src/code.js Makefile
	$(call jsmin , $<, $@)

src/_style.css: src/style.css Makefile
	$(call csslint, $<, tmp_)
	$(call cssmin, tmp_, $@)
	rm tmp_

clean:
	rm 1ftn
	rm src/_style.css src/_code.js
