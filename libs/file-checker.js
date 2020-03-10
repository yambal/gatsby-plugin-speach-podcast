"use strict";
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (Object.hasOwnProperty.call(mod, k)) result[k] = mod[k];
    result["default"] = mod;
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
const fs = __importStar(require("fs"));
const FileType = {
    File: 'file',
    Directory: 'directory',
    Unknown: 'unknown'
};
const getFileType = (path) => {
    try {
        const stat = fs.statSync(path);
        switch (true) {
            case stat.isFile():
                return FileType.File;
            case stat.isDirectory():
                return FileType.Directory;
            default:
                return FileType.Unknown;
        }
    }
    catch (e) {
        return FileType.Unknown;
    }
};
exports.listFiles = (dirPath) => {
    const ret = [];
    try {
        const paths = fs.readdirSync(dirPath);
        paths.forEach(a => {
            const path = `${dirPath}/${a}`;
            switch (getFileType(path)) {
                case FileType.File:
                    ret.push(path);
                    break;
                case FileType.Directory:
                    ret.push(...exports.listFiles(path));
                    break;
                default:
                /* noop */
            }
        });
        return ret;
    }
    catch (e) {
        return [];
    }
};
exports.fileDelete = (file) => {
    return new Promise((resolve) => {
        try {
            fs.unlinkSync(file);
            resolve();
        }
        catch (error) {
            resolve();
        }
    });
};
