"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const getI_itunes_duration_1 = require("./libs/getI-itunes-duration");
const option_parser_1 = require("./libs/option-parser");
var fs = require('fs');
// @ts-ignore: Unreachable code error
module.exports = ({ actions, reporter, graphql }, option) => {
    graphql(`
  {
    allMarkdownRemark(sort: {fields: frontmatter___date, order: DESC}, filter: {frontmatter: {templateKey: {eq: "PodCast"}}}, limit: 100) {
      edges {
        node {
          id
          fields {
            slug
          }
          frontmatter {
            title
            description
            date
            channel
          }
          mp3 {
            absoluteUrl
            url
            path
          }
        }
      }
    }
  }
  `).then(result => {
        const siteUrl = option_parser_1.getSiteUrl(option);
        const edges = result.data.allMarkdownRemark.edges;
        const channelIndex = {};
        edges.forEach(edge => {
            const { node: { id, fields: { slug }, mp3: { path, url, absoluteUrl }, frontmatter: { date: pubDateStr, description, title, channel = '' } } } = edge;
            if (typeof channelIndex[channel] === 'undefined') {
                channelIndex[channel] = [];
            }
            /** Duration(MP3の長さ)を取得する */
            const iTunesDuration = getI_itunes_duration_1.getITunesDuration(path);
            /** Length(ファイルサイズ)を取得する */
            const size = fs.statSync(path).size;
            /** pubDate */
            const pubDateUTC = new Date(pubDateStr).toUTCString();
            /** Link 記事ページへのリンク */
            const link = siteUrl ? `${siteUrl}/podcasts/${channel}/${id}` : slug;
            /** MP3 ファイルのTRL */
            const enclosureUrl = siteUrl ? absoluteUrl : url;
            const item = `<item>
  <title>${title}</title>
  <description>${description}</description>
  <pubDate>${pubDateUTC}</pubDate>
  <enclosure url="${enclosureUrl}" type="audio/mpeg" length="${size}"/>
  <itunes:duration>${iTunesDuration}</itunes:duration>
  <guid isPermaLink="false">${absoluteUrl}</guid>
  <link>${link}</link>
</item>`;
            channelIndex[channel].push(item);
        });
        Object.keys(channelIndex).forEach(key => {
            /** チャンネルのタイトル */
            const channelTitle = option_parser_1.getChannelTitle(key, option);
            const channelDescription = option_parser_1.getChannelDescription(key, option);
            /** rss の パス */
            const rssPath = key && key !== 'null' ? `${process.cwd()}/public/podcast-${key}.rss` : `${process.cwd()}/public/podcast.rss`;
            const rss = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:googleplay="http://www.google.com/schemas/play-podcasts/1.0" xmlns:itunes="http://www.itunes.com/dtds/podcast-1.0.dtd">
  <channel>
    <title>${channelTitle}</title>
    <googleplay:author>June YAMAMOTO</googleplay:author>
    <description>${channelDescription}</description>
    <googleplay:image href="http://placehold.jp/36/99ccff/003366/600x600.png?text=${channelTitle}"/>
    <itunes:image href="http://placehold.jp/200/99ccff/003366/1400x1400.png?text=${channelTitle}"/>
    <itunes:category text="Technology"/>
    <googleplay:category text="Technology"/>
    <itunes:explicit>no</itunes:explicit>
    <language>ja-JP</language>
    <link>${siteUrl}/${key}</link>
    ${channelIndex[key].join('\n')}
  </channel>
</rss>`;
            fs.writeFileSync(rssPath, rss);
            // console.log(rss, rssPath)
        });
    });
};
