module.exports = servicenowify = function (apiName) {

    var filewalker = require('filewalker');
    var browserify = require('browserify')({'standalone': apiName});
    var rimraf = require('rimraf');
    var UglifyJS = require("uglify-js");
    var path = require('path');
    var mkdirp = require('mkdirp');
    var exec = require('child_process').exec;
    var fs = require('fs');

    return {
        /*
         Takes an Array of files and attempts to compile them. Requires tsc compiler to be installed at OS level. Fires callback on completion.
         */
        compileAll: function (files, callback) {
            for (var key in files) {
                if (!files.hasOwnProperty(key)) {
                    continue;
                }
                var filesToCompile = files.length;
                var compilationError = false;
                var command = "tsc " + sourceDirectory + '/' + files[key] + " --module commonjs";
                (function (filename) {
                    exec(command, function (error) {
                        if (error !== null) {
                            console.error('Unable to compile file: ' + filename + ', err: ' + error);
                            compilationError = true;
                        } else {
                            compiledFiles.push(filename);
                        }

                        filesToCompile--;
                        if (!filesToCompile) {
                            callback(compilationError);
                        }
                    });
                })(files[key])
            }
        },
        /*
         Takes an file and browserify's it, standard stuff from that package. Produces a single file including all dependencies at the target location.
         */
        browserifyAll: function (file, callback) {
            browserify.add(file);
            browserify.external('angular');
            var globalShim = require('browserify-global-shim').configure({
                'jQuery': 'angular'
            });
            browserify.transform(globalShim);
            browserify.bundle(function (error, code) {
                callback(error, code);
            });
        },
        /*
         Takes an file and uglify's it, standard stuff from that package. Produces a single file at the target location.
         */
        uglifyAll: function (fileContents, callback) {
            var result = UglifyJS.minify(fileContents, {fromString: true});
            callback(null, result.code);
        },
        /*
         Fix Block Scoping - ServiceNow has a poor implementation of JavaScript, causing a single error in the Uglified code. We have to fix this by scoping a variable.
         */
        fixBlockScoping: function (code, callback) {
            var splicedCode = code.toString().replace('return (function e(t,n,r)', 'return (e = function (t,n,r)');
            var fixedCode = '(e = function' + code.toString().substring(11);
            callback(null, splicedCode);
        },
        /*
         Generic cleaning function, uses rimraf to take care of things
         */
        clean: function (file, callback) {
            rimraf(file, callback);
        }
    }
};
