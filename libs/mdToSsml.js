"use strict";
exports.__esModule = true;
var marked = require("marked");
exports.mdToSsml = function (markdown, title, description) {
    var renderer = new marked.Renderer();
    renderer.heading = function (text, level, raw, slug) {
        // console.log(slug)
        return "<par>\n  <media>\n    <emphasis level=\"strong\">\n    " + text + "\n    </emphasis>\n  </media>\n</par>\n<break time=\"1.5s\" />\n";
    };
    // Blockquote
    renderer.blockquote = function (text) {
        return "<p><prosody rate=\"slow\">" + text + "</prosody></p><break time=\"2s\" />\n";
    };
    // p
    renderer.paragraph = function (text) {
        return "<p>" + text + "</p><break time=\"2s\" />\n";
    };
    // hr
    renderer.hr = function () {
        return "<break time=\"3s\" />\n";
    };
    // list
    renderer.list = function (body, ordered, start) {
        return "<p>" + body + "</p>";
    };
    renderer.listitem = function (text, task, checked) {
        return "<p>" + text + "</p>";
    };
    // Strong
    renderer.strong = function (text) {
        return "<break time=\"0.25s\" /><emphasis level=\"strong\">" + text + "</emphasis><break time=\"0.25s\" />";
    };
    // BR
    renderer.br = function () {
        return "<break time=\"1s\" />\n";
    };
    var parsed = marked(markdown, { renderer: renderer });
    var openning = "<emphasis level=\"strong\">\n  <prosody rate=\"slow\" pitch=\"+0.12st\">" + title + "</prosody>\n</emphasis>\n<break time=\"2s\" />\n<p>" + description + "</p><break time=\"2s\" />\n";
    return "<speak><prosody rate=\"125%\">" + openning + parsed + "</prosody></speak>";
};
// <audio src="https://actions.google.com/sounds/v1/animals/cat_purr_close.ogg"></audio>
