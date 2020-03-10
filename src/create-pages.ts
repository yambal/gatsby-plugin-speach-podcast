import { listFiles } from './libs/file-checker'
import { cacheToPablic, podcastCashSet, checkCache, iPodcastCacheCheckResponse, getCacheList } from './libs/cache'
import { getChannelTitle, getChannelDescription, getGoogleProjectId, getGoogleKeyFileName } from './libs/option-parser'
import { iPodcastEdge, iPluginOption } from './libs/interfaces'
import { mdToMp3 } from 'md-to-google-ssml'
import { path } from './libs/filePath'

export interface iPodcastBuild {
  edge: any
  cacheDir: string
  publicDir: string
  ssml: string
  options: any
  fileName?: string
  chacheValue?: string
  cacheKey?: string,
  cachedFilePath?: string
  isNeedReflash?:boolean
}

const podcastBuildMp3 = (
  checkCacheResponse: iPodcastCacheCheckResponse,
  edge: any,
  options: any,
  projectId?: string | null,
  keyFilename?: string | null
) => {

  return new Promise((resolve: (resolve: iPodcastCacheCheckResponse) => void) => {
    if (!checkCacheResponse.hasCashe || checkCacheResponse.isOld) {
      console.log('podcast: make mp3')
      console.log('projectId', projectId)
      console.log('keyFilename', keyFilename)

      if (!projectId || !keyFilename) {
        throw new Error('error: projectId, keyFilename')
      }

      const { title, channel, description } = edge.node.frontmatter
      const { rawMarkdownBody } = edge.node

      const channelTitle = getChannelTitle(channel, options)
      const channelDescription = getChannelDescription(channel, options)

      mdToMp3(rawMarkdownBody, {
        projectId,
        keyFileName: keyFilename,
        title: channelTitle,
        description: channelDescription,
        subTitle: title,
        subDescription: description,
        tempDir: '.podcast-temp'
      })
      .then(
        audioData => {
          console.log('podcast: make mp3 success')
          checkCacheResponse.audioData = audioData
          resolve(checkCacheResponse)
        }
      )
    } else {
      // console.log('podcast: make mp3 skip')
      resolve(checkCacheResponse)
    }
  })
}

const podcastCacheSaver = (checkCacheResponse: iPodcastCacheCheckResponse) => {
  return new Promise((resolve: (resolve: iPodcastCacheCheckResponse) => void) => {
    if (checkCacheResponse.audioData) {
      podcastCashSet(
        checkCacheResponse.cacheKey,
        checkCacheResponse.cacheValue,
        checkCacheResponse.channel,
        checkCacheResponse.slug,
        checkCacheResponse.audioData
      )
      .then(
        () => {
          console.log('podcast: cached')
          resolve(checkCacheResponse)
        }
      )
    } else {
      console.log('podcast: cacheing skip')
      resolve(checkCacheResponse)
    }

  })
}

const podcastEdgeToFile = (edge: iPodcastEdge, options: iPluginOption):Promise<iPodcastCacheCheckResponse> => {
  return new Promise((
    resolve: (resolve: iPodcastCacheCheckResponse) => void,
    reject: () => void
  ) => {
    
    return checkCache(edge, options)
    .then(
      (checkCacheResponse) => {
        return podcastBuildMp3(checkCacheResponse, edge, options, getGoogleProjectId(options), getGoogleKeyFileName(options))
      }
    )
    .then(
      (res) => {
        return podcastCacheSaver(res)
      }
    )
    .then(
      (res) => {
        return cacheToPablic(res)
      }
    )
    .then(
      (res) => {
        resolve(res)
      }
    ).catch(
      (message) => {
        reject()
      }
    )
  })
}

// @ts-ignore: Unreachable code error
module.exports = ({ graphql }, pluginOptions: iPluginOption, cb: () => void) => {
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
  `).then((result: any) => {
    if (result.errors) {
      result.errors.forEach((e: any) => console.error(e.toString()))
      return Promise.reject(result.errors)
    }

    const edges: iPodcastEdge[] = result.data.allMarkdownRemark.edges

    Promise.all(edges.map(
      edge => {
        return podcastEdgeToFile(edge, pluginOptions)
      }
    ))
    .then(
      () => {
        const slugs = edges.map(
          edge => {
            const { channel, slug } = edge.node.frontmatter
            return path.cacheFilePath(path.edgeKey(channel, slug))
          }
        )
        getCacheList()
        .then(
          keys => {
            //console.log('krys', JSON.stringify(keys, null, 2))
            //console.log('slugs', JSON.stringify(slugs, null, 2))

            const del = keys.filter(
              key => {
                return slugs.indexOf(key) === -1
              }
            )
            console.log('del', del)
          }
        )

        console.log('/podcast')
        cb && cb()
      }
    ).catch(
      () => {
        console.log('error')
        console.log('/podcast')
        cb && cb()
      }
    )
  })
}