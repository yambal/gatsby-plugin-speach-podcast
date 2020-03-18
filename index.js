"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const md_to_google_ssml_1 = require("md-to-google-ssml");
exports.ssmlMaxLength = (ssml) => {
    return md_to_google_ssml_1.getSsmLMaxLength(ssml, { projectId: '', keyFileName: '' });
};
