/**
 * HTML utils
 */
'use strict';
const fs = require('fs');
const config = require('config');
const Handlebars = require('handlebars');
const ERR = require('../errors.json');

function create(opts = {}, cb) {
    if (opts.templateName) {
        fs.readFile(`./templates/header.html`, 'utf8', (err, headercontent) => {
            if (err) {
                return cb(err);
            } else {
                fs.readFile(`./templates/${opts.templateName}.html`, 'utf8', (err, content) => {
                    if (err) {
                        //@todo add logging
                        return cb(err);
                    } else {
                        if(opts.replaceContent)  content = content.replace("code to be replaced", opts.replaceContent)
                        var template = Handlebars.compile(headercontent + content);
                        var context = opts.data || {};
                        var html = template(context);
                        return cb(null, html);
                    }
                });
            }
        });
        
    }
}

module.exports = {
    create: create
}
