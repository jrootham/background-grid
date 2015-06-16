SRC = $(wildcard js/src/*.js)
BUILD = $(SRC:js/src/%.js=js/build/%.js)

build: $(BUILD)

js/build/%.js: js/src/%.js
	mkdir -p $(@D)
	babel $< -o $@
