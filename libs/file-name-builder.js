"use strict";
exports.__esModule = true;
var crypto = require("crypto");
exports.buildMDHash = function (title, rawMarkdownBody) {
    return crypto.createHash('md5').update(title + "-" + rawMarkdownBody, 'utf8').digest('hex');
};
/*
export const buildFileName = (slag: string, title: string, rawMarkdownBody: string, exe: string) => {
    return `${slag}-${buildMDHash(title, rawMarkdownBody)}.${exe}`
}
*/
exports.buildMpCacheValue = function (title, body, channel, date, slug) {
    var hashSeed = title + "-" + body + "-" + channel + "-" + date + "-" + slug;
    return crypto.createHash('md5').update(hashSeed, 'utf8').digest('hex');
};
exports.buildFileNameShort = function (channel, slug, exe) {
    var channelFix = channel ? channel + "-" : '';
    var exeFix = exe ? "." + exe : '';
    return "podcast-" + channelFix + slug + exeFix;
};
