"use strict";
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (Object.hasOwnProperty.call(mod, k)) result[k] = mod[k];
    result["default"] = mod;
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
const crypto = __importStar(require("crypto"));
const option_parser_1 = require("./option-parser");
const CACHE_DIR = '.podcast';
exports.buildMDHash = (title, rawMarkdownBody) => {
    return crypto.createHash('md5').update(`${title}-${rawMarkdownBody}`, 'utf8').digest('hex');
};
exports.edgeFileName = (channel, slug, exe) => {
    const channelFix = channel ? `${channel}-` : '';
    const exeFix = exe ? `.${exe}` : '';
    return `podcast-${channelFix}${slug}${exeFix}`;
};
exports.path = {
    cacheDir: `${process.cwd()}/${CACHE_DIR}`,
    publicDir: `${process.cwd()}/public`,
    publicMp3Dir: (option) => {
        const audioPath = option_parser_1.getAudioPath(option);
        return `${exports.path.publicDir}/${audioPath}`;
    },
    cacheFilePath: (key) => {
        return `${exports.path.cacheDir}/cache-${key}.txt`;
    },
    edgeFileName: (channel, slug, exe) => {
        const channelFix = channel ? `${channel}-` : '';
        const exeFix = exe ? `.${exe}` : '';
        return `podcast-${channelFix}${slug}${exeFix}`;
    },
    edgeKey: (channel, slug) => {
        return exports.path.edgeFileName(channel, slug);
    },
    edgeMp3FileName: (channel, slug) => {
        return exports.path.edgeFileName(channel, slug, 'mp3');
    },
    edgeMp3CacheFilePath: (channel, slug) => {
        return `${exports.path.cacheDir}/${exports.path.edgeMp3FileName(channel, slug)}`;
    },
    edgeMp3PublicFilePath: (channel, slug, option) => {
        return `${exports.path.publicMp3Dir(option)}/${exports.path.edgeMp3FileName(channel, slug)}`;
    },
    edgeMp3AbsoluteUrl: (channel, slug, option) => {
        const siteUrl = option_parser_1.getSiteUrl(option);
        const audioPath = option_parser_1.getAudioPath(option);
        return siteUrl ? `${siteUrl}/${audioPath}/${exports.path.edgeMp3FileName(channel, slug)}` : 'siteUrl not set @option';
    }
};
