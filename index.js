"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const utility_1 = require("md-to-google-ssml/utility");
exports.ssmlMaxLength = (ssml) => {
    return utility_1.getSsmLMaxLength(ssml, { projectId: '', keyFileName: '' });
};
