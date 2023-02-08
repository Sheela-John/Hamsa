/**
 * logging utils
 */
'use strict'

require('storyboard-preset-console');

var log = function(component, filename) {
    return require('storyboard').mainStory.child({ src: component, title: filename });
}

module.exports = {
    log: log
}
