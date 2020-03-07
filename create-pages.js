"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const file_checker_1 = require("./file-checker");
const cache_1 = require("./libs/cache");
const option_parser_1 = require("./libs/option-parser");
const md_to_google_ssml_1 = require("md-to-google-ssml");
const podcastBuildMp3 = (checkCacheResponse, edge, options, projectId, keyFilename) => {
    return new Promise((resolve) => {
        if (!checkCacheResponse.hasCashe || checkCacheResponse.isOld) {
            console.log('podcast: make mp3');
            console.log('projectId', projectId);
            console.log('keyFilename', keyFilename);
            if (!projectId || !keyFilename) {
                throw new Error('error: projectId, keyFilename');
            }
            const { title, channel } = edge.node.frontmatter;
            const { rawMarkdownBody } = edge.node;
            const channelTitle = option_parser_1.getChannelTitle(channel, options);
            const channelDescription = option_parser_1.getChannelDescription(channel, options);
            md_to_google_ssml_1.mdToMp3(rawMarkdownBody, {
                projectId,
                keyFileName: keyFilename,
                title: channelTitle,
                description: channelDescription,
                subTitle: title,
                tempDir: '.podcast-temp'
            })
                .then(audioData => {
                console.log('podcast: make mp3 success');
                checkCacheResponse.audioData = audioData;
                resolve(checkCacheResponse);
            });
            /*
            mp3(ssml, projectId, keyFilename)
            .then(
              audioData => {
                console.log('podcast: make mp3 success')
                checkCacheResponse.audioData = audioData
                resolve(checkCacheResponse)
              }
            )
            */
        }
        else {
            console.log('podcast: make mp3 skip');
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
            /*
            const ssml = mdToSsml(rawMarkdownBody, title, channelDescription, { google: true })
            return podcastBuildMp3(checkCacheResponse, ssml, getGoogleProjectId(options), getGoogleKeyFileName(options))
            */
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
        const list = file_checker_1.listFiles(`${process.cwd()}/.podcast`);
        console.log('file check', list.length);
        const edges = result.data.allMarkdownRemark.edges;
        Promise.all(edges.map(edge => {
            return podcastEdgeToFile(edge, pluginOptions);
        }))
            .then(() => {
            console.log('/podcast');
            cb && cb();
        }).catch(() => {
            console.log('error');
            console.log('/podcast');
            cb && cb();
        });
    });
};
