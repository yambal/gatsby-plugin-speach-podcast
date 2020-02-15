"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var fs = require('fs');
const get_mp3_duration_1 = require("./get-mp3-duration");
exports.getITunesDuration = (mp3FilePath) => {
    const buffer = fs.readFileSync(mp3FilePath);
    const duration = get_mp3_duration_1.getMp3Duration(buffer); // ms
    const h = Math.floor(duration / 1000 / 3600);
    const m = Math.floor((duration / 1000 - h * 3600) / 60);
    const s = Math.floor(duration / 1000 - h * 3600 - m * 60) + 1;
    const strDuration = `${('00' + h).slice(-2)}:${('00' + m).slice(-2)}:${('00' + s).slice(-2)}`;
    return strDuration;
};
