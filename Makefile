JS_COMPILER = ./node_modules/uglify-js/bin/uglifyjs

all: rserve.js rserve.min.js main.js

main.js:					\
	js/_begin.js				\
	js/_begin_node.js			\
	js/robj.js				\
	js/rsrv.js				\
	js/parse.js				\
	js/endian_aware_dataview.js		\
	js/rserve.js				\
	js/error.js				\
	js/write.js				\
	js/_end.js				\
	js/_end_node.js

rserve.js:					\
	js/_begin.js				\
	js/robj.js				\
	js/rsrv.js				\
	js/parse.js				\
	js/endian_aware_dataview.js		\
	js/rserve.js				\
	js/error.js				\
	js/write.js				\
	js/_end.js

rserve.min.js: rserve.js Makefile
	@rm -f $@
	$(JS_COMPILER) < $< > $@
	chmod -w $@

rserve.js: Makefile
	echo $^
	@rm -f $@
	cat $(filter %.js,$^) > $@
ifeq ($(CHECK),1)
	jshint $(filter %.js,$(filter-out lib/%.js,$(filter-out %/_begin.js,$(filter-out %/_end.js, $^))))
endif
	chmod -w $@

main.js: Makefile
	echo $^
	@rm -f $@
	cat $(filter %.js,$^) > $@
ifeq ($(CHECK),1)
	jshint $(filter %.js,$(filter-out lib/%.js,$(filter-out %/_begin.js,$(filter-out %/_end.js, $^))))
endif
	chmod -w $@

clean:
	rm -f rserve.js rserve.min.js main.js
