import mp3 from './libs/mp3'
import { listFiles } from './file-checker'
import { cacheToPablic, podcastCashSet, checkCache, iPodcastCacheCheckResponse } from './libs/cache'
import { getChannelTitle, getChannelDescription, getGoogleProjectId, getGoogleKeyFileName } from './libs/option-parser'
import { iPodcastEdge, iPluginOption } from './libs/interfaces'
import { mdToMp3 } from 'md-to-google-ssml'

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

      const { title, channel } = edge.node.frontmatter
      const { rawMarkdownBody } = edge.node

      const channelTitle = getChannelTitle(channel, options)
      const channelDescription = getChannelDescription(channel, options)

      mdToMp3(rawMarkdownBody, {
        projectId,
        keyFileName: keyFilename,
        title: channelTitle,
        description: channelDescription,
        subTitle: title,
        tempDir: '.podcast-temp'
      })
      .then(
        audioData => {
          console.log('podcast: make mp3 success')
          checkCacheResponse.audioData = audioData
          resolve(checkCacheResponse)
        }
      )
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

    } else {
      console.log('podcast: make mp3 skip')
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
        /*
        const ssml = mdToSsml(rawMarkdownBody, title, channelDescription, { google: true })
        return podcastBuildMp3(checkCacheResponse, ssml, getGoogleProjectId(options), getGoogleKeyFileName(options))
        */
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

    const list = listFiles(`${process.cwd()}/.podcast`);
    console.log('file check', list.length);

    const edges: iPodcastEdge[] = result.data.allMarkdownRemark.edges

    Promise.all(edges.map(
      edge => {
        return podcastEdgeToFile(edge, pluginOptions)
      }
    ))
    .then(
      () => {
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