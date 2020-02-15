"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var _mkdirp = require('mkdirp');
var Promise = require('any-promise');
exports.mkdirpThen = (dir, mode) => {
    return new Promise((resolve, reject) => {
        _mkdirp(dir, mode, (err) => {
            if (err) {
                reject(err);
            }
            else {
                resolve();
            }
        });
    });
};
