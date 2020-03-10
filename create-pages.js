"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const cache_1 = require("./libs/cache");
const option_parser_1 = require("./libs/option-parser");
const md_to_google_ssml_1 = require("md-to-google-ssml");
const filePath_1 = require("./libs/filePath");
const file_checker_1 = require("./libs/file-checker");
const podcastBuildMp3 = (checkCacheResponse, edge, options, projectId, keyFilename) => {
    return new Promise((resolve) => {
        if (!checkCacheResponse.hasCashe || checkCacheResponse.isOld) {
            console.log('podcast: make mp3');
            console.log('projectId', projectId);
            console.log('keyFilename', keyFilename);
            if (!projectId || !keyFilename) {
                throw new Error('error: projectId, keyFilename');
            }
            const { title, channel, description } = edge.node.frontmatter;
            const { rawMarkdownBody } = edge.node;
            const channelTitle = option_parser_1.getChannelTitle(channel, options);
            const channelDescription = option_parser_1.getChannelDescription(channel, options);
            md_to_google_ssml_1.mdToMp3(rawMarkdownBody, {
                projectId,
                keyFileName: keyFilename,
                title: channelTitle,
                description: channelDescription,
                subTitle: title,
                subDescription: description,
                tempDir: '.podcast-temp'
            })
                .then(audioData => {
                console.log('podcast: make mp3 success');
                checkCacheResponse.audioData = audioData;
                resolve(checkCacheResponse);
            });
        }
        else {
            // console.log('podcast: make mp3 skip')
            resolve(checkCacheResponse);
        }
    });
};
const podcastCacheSaver = (checkCacheResponse) => {
    return new Promise((resolve) => {
        if (checkCacheResponse.audioData) {
            cache_1.podcastCashSet(checkCacheResponse.cacheKey, checkCacheResponse.cacheValue, checkCacheResponse.channel, checkCacheResponse.slug, checkCacheResponse.audioData)
                .then(() => {
                console.log('podcast: cached');
                resolve(checkCacheResponse);
            });
        }
        else {
            console.log('podcast: cacheing skip');
            resolve(checkCacheResponse);
        }
    });
};
const podcastEdgeToFile = (edge, options) => {
    return new Promise((resolve, reject) => {
        return cache_1.checkCache(edge, options)
            .then((checkCacheResponse) => {
            return podcastBuildMp3(checkCacheResponse, edge, options, option_parser_1.getGoogleProjectId(options), option_parser_1.getGoogleKeyFileName(options));
        })
            .then((res) => {
            return podcastCacheSaver(res);
        })
            .then((res) => {
            return cache_1.cacheToPablic(res);
        })
            .then((res) => {
            resolve(res);
        }).catch((message) => {
            reject();
        });
    });
};
// @ts-ignore: Unreachable code error
module.exports = ({ graphql }, pluginOptions, cb) => {
    return graphql(`
  {
    allMarkdownRemark(sort: {fields: frontmatter___date, order: DESC}, filter: {frontmatter: {templateKey: {eq: "PodCast"}}}, limit: 100) {
      edges {
        node {
          id
          fields {
            slug
          }
          frontmatter {
            slug
            title
            description
            date
            channel
          }
          rawMarkdownBody
          html
        }
      }
    }
  }
  `).then((result) => {
        if (result.errors) {
            result.errors.forEach((e) => console.error(e.toString()));
            return Promise.reject(result.errors);
        }
        const edges = result.data.allMarkdownRemark.edges;
        Promise.all(edges.map(edge => {
            return podcastEdgeToFile(edge, pluginOptions);
        }))
            .then(() => {
            const slugs = edges.map(edge => {
                const { channel, slug } = edge.node.frontmatter;
                return filePath_1.path.cacheFilePath(filePath_1.path.edgeKey(channel, slug));
            });
            cache_1.getCacheList()
                .then(keys => {
                //console.log('krys', JSON.stringify(keys, null, 2))
                //console.log('slugs', JSON.stringify(slugs, null, 2))
                const dels = keys.filter(key => {
                    return slugs.indexOf(key) === -1;
                });
                Promise.all(dels.map(del => {
                    console.log('delete', del);
                    return file_checker_1.fileDelete(del);
                })).then(() => {
                    console.log('/podcast');
                    cb && cb();
                });
            });
        }).catch(() => {
            console.log('error');
            console.log('/podcast');
            cb && cb();
        });
    });
};
