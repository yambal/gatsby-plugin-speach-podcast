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
const filePath_1 = require("./filePath");
const mkdirp_then_1 = require("./mkdirp-then");
const crypto = __importStar(require("crypto"));
const util = __importStar(require("util"));
const file_checker_1 = require("./file-checker");
exports.getCacheList = () => {
    return new Promise((resolve) => {
        const dir = `${process.cwd()}/.podcast`;
        const list = file_checker_1.listFiles(dir);
        const cacheFilePaths = list.filter(file => {
            return file.indexOf('.txt') !== -1;
        });
        const keys = cacheFilePaths.map(cacheFilePath => {
            const slug = cacheFilePath.replace(`${filePath_1.path.cacheDir}/cache-podcast-`, '').replace('.txt', '');
            const mp3Path = filePath_1.path.edgeMp3CacheFilePath('', slug);
            return {
                cache: cacheFilePath,
                mp3: mp3Path
            };
        });
        resolve(keys);
    });
};
/** キャッシュを取得 */
exports.podcastCacheGet = (key) => {
    return new Promise((resolve) => {
        const cacheFilePath = filePath_1.path.cacheFilePath(key);
        try {
            fs.statSync(cacheFilePath);
            fs.readFile(cacheFilePath, "utf-8", (err, data) => {
                if (!err) {
                    resolve(data);
                    return;
                }
                resolve(null);
            });
        }
        catch (error) {
            resolve(null);
        }
    });
};
/** キャッシュを保存 */
exports.podcastCashSet = (key, value, channel, slug, audio) => {
    return new Promise((resolve) => {
        const cacheDir = filePath_1.path.cacheDir;
        const cacheFilePath = filePath_1.path.cacheFilePath(key);
        const edgeMp3CacheFilePath = filePath_1.path.edgeMp3CacheFilePath(channel, slug);
        mkdirp_then_1.mkdirpThen(cacheDir)
            .then(() => {
            fs.writeFile(cacheFilePath, value, 'utf8', () => {
                if (audio) {
                    const writeFile = util.promisify(fs.writeFile);
                    writeFile(edgeMp3CacheFilePath, audio, 'binary')
                        .then(() => {
                        resolve();
                    });
                }
                else {
                    resolve();
                }
            });
        });
    });
};
/** ハッシュ生成器 */
exports.buildMDHash = (title, rawMarkdownBody) => {
    return crypto.createHash('md5').update(`${title}-${rawMarkdownBody}`, 'utf8').digest('hex');
};
/** キャッシュ値 */
exports.buildMpCacheValue = (title, body, channel, date, slug) => {
    const hashSeed = `${title}-${body}-${channel}-${date}-${slug}`;
    return crypto.createHash('md5').update(hashSeed, 'utf8').digest('hex');
};
exports.checkCache = (edge, pluginOption) => {
    return new Promise((resolve) => {
        const html = edge.node.html;
        const { title, date, channel, slug, description } = edge.node.frontmatter;
        const cacheKey = filePath_1.path.edgeKey(channel, slug);
        exports.podcastCacheGet(cacheKey)
            .then(cachedValue => {
            let response = {
                hasCashe: false,
                isOld: false,
                cacheKey: filePath_1.path.edgeKey(channel, slug),
                cacheValue: exports.buildMpCacheValue(title, html, channel, date, slug),
                mp3CacheFilePath: filePath_1.path.edgeMp3CacheFilePath(channel, slug),
                mp3PublicDir: filePath_1.path.publicMp3Dir(pluginOption),
                mp3PublicFilePath: filePath_1.path.edgeMp3PublicFilePath(channel, slug, pluginOption),
                channel,
                slug
            };
            if (cachedValue) {
                response.hasCashe = true;
                if (cachedValue === response.cacheValue) {
                    // 変更なし
                    response.isOld = false;
                }
                else {
                    // 変更あり
                    response.isOld = true;
                }
            }
            else {
                // キャッシュなし
                response.isOld = false;
            }
            resolve(response);
        });
    });
};
exports.cacheToPablic = (podcastCacheCheckResponse) => {
    return new Promise((resolve) => {
        mkdirp_then_1.mkdirpThen(podcastCacheCheckResponse.mp3PublicDir)
            .then(() => {
            fs.copyFile(podcastCacheCheckResponse.mp3CacheFilePath, podcastCacheCheckResponse.mp3PublicFilePath, (err) => {
                if (!err) {
                    console.log('podcast: cache recovered');
                    resolve(podcastCacheCheckResponse);
                    return;
                }
                resolve(podcastCacheCheckResponse);
            });
        });
    });
};
