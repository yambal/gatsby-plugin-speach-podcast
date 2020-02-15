import { getITunesDuration } from './libs/getI-itunes-duration'
import { getChannelTitle, getSiteUrl, getChannelDescription } from './libs/option-parser'
var fs = require('fs')
/**
 * https://www.gatsbyjs.org/docs/node-apis/#onPostBuild
 * ビルドプロセスの他のすべての部分が完了した後に呼び出される最後の拡張ポイント。
 * https://www.npmjs.com/package/get-mp3-duration
 */
interface iPodcastEdge {
    node: {
      fields: {
        slug: string
      }
      frontmatter: {
        title: string
        description: string
        date: string
        channel?: string
      }
      mp3: {
        absoluteUrl: string
        url: string
        path: string
      }
    }
}

interface iOption {
  siteUrl?: string
  channels?: any
}

module.exports = ({ actions, reporter, graphql }, option) => {

  graphql(`
  {
    allMarkdownRemark(filter: {frontmatter: {templateKey: {eq: "PodCast"}}}, limit: 10) {
      edges {
        node {
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
    const siteUrl = getSiteUrl(option)
    const edges:iPodcastEdge[] = result.data.allMarkdownRemark.edges
    const channelIndex = {}

    edges.forEach(
      edge => {
        const {
          node :{
            fields: {
              slug
            },
            mp3 : {
              path,
              url,
              absoluteUrl
            },
            frontmatter: {
              date: pubDateStr,
              description,
              title,
              channel
            }
          }
        } = edge

        if (typeof channelIndex[channel] === 'undefined') {
          channelIndex[channel] = []
        }

        /** Duration(MP3の長さ)を取得する */
        const iTunesDuration = getITunesDuration(path)

        /** Length(ファイルサイズ)を取得する */
        const size = fs.statSync(path).size

        /** pubDate */
        const pubDateUTC = new Date(pubDateStr).toUTCString()

        /** Link 記事ページへのリンク */
        
        const link = siteUrl ? `${siteUrl}${slug}` : slug

        /** MP3 ファイルのTRL */
        const enclosureUrl = siteUrl ? absoluteUrl : url

        const item = `<item>
  <title>${title}</title>
  <description>${description}</description>
  <pubDate>${pubDateUTC}</pubDate>
  <enclosure url="${enclosureUrl}" type="audio/mpeg" length="${size}"/>
  <itunes:duration>${iTunesDuration}</itunes:duration>
  <guid isPermaLink="false">${absoluteUrl}</guid>
  <link>${link}</link>
</item>`
      channelIndex[channel].push(item)
      }
    )

    Object.keys(channelIndex).forEach(
      key => {
        /** チャンネルのタイトル */
        const channelTitle = getChannelTitle(key, option)
        const channelDescription = getChannelDescription(key, option)

        /** rss の パス */
        const rssPath = key && key !== 'null' ? `${process.cwd()}/public/podcast-${key}.rss` : `${process.cwd()}/public/podcast.rss`

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
    <link>${siteUrl}/</link>
    ${channelIndex[key].join('\n')}
  </channel>
</rss>`

        fs.writeFileSync(rssPath, rss);
        // console.log(rss, rssPath)
      }
    )
  })
}
