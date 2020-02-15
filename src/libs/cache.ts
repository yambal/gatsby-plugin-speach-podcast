import * as fs from 'fs'
import { path } from './filePath'
import * as mkdirp from 'mkdirp-then'
import * as crypto from 'crypto'
import * as util from 'util'

/** キャッシュを取得 */
export const podcastCacheGet = (key: string) => {
  return new Promise((resolve: (resolve: string) => void) => {
    const cacheFilePath = path.cacheFilePath(key)
    try {
      fs.statSync(cacheFilePath)
      fs.readFile(cacheFilePath, "utf-8", (err, data) => {
        if(!err) {
          resolve(data)
          return
        }
        resolve(null)
      })
    } catch (error) {
      resolve(null)
    }
  })
}

/** キャッシュを保存 */
export const podcastCashSet = (key: string, value: string, channel: string, slug: string, audio?: Buffer) => {
  return new Promise((resolve: () => void) => {
    const cacheDir = path.cacheDir
    const cacheFilePath = path.cacheFilePath(key)
    const edgeMp3CacheFilePath = path.edgeMp3CacheFilePath(channel, slug)
    mkdirp(cacheDir)
    .then(
      () => {
        fs.writeFile(cacheFilePath, value, 'utf8', () => {
          if (audio) {
            const writeFile = util.promisify(fs.writeFile)
            writeFile(edgeMp3CacheFilePath, audio, 'binary')
            .then(
              () => {
                resolve()
              }
            )
          } else {
            resolve()
          }
        });
      }
    )
  })
}

/** ハッシュ生成器 */
export const buildMDHash = (title: string, rawMarkdownBody: string) => {
  return crypto.createHash('md5').update(`${title}-${rawMarkdownBody}` , 'utf8').digest('hex')
}

/** キャッシュ値 */
export const buildMpCacheValue = (title: string, body: string, channel: string, date:string, slug: string) => {
  const hashSeed = `${title}-${body}-${channel}-${date}-${slug}`
  return crypto.createHash('md5').update(hashSeed , 'utf8').digest('hex')
}

export interface iPodcastCacheCheckResponse {
  hasCashe: boolean
  isOld: boolean
  cacheKey: string
  cacheValue: string
  mp3CacheFilePath: string
  mp3PublicDir: string
  mp3PublicFilePath: string
  channel: string
  slug: string
  audioData?: Buffer
}

export const checkCache = (edge, pluginOption) => {
  return new Promise((resolve: (resolve: iPodcastCacheCheckResponse) => void) => {
    const html = edge.node.html
    const { title, date, channel, slug } = edge.node.frontmatter
    const cacheKey = path.edgeKey(channel, slug)
    podcastCacheGet(cacheKey)
    .then(
      cachedValue => {
        let response: iPodcastCacheCheckResponse = {
          hasCashe: false,
          isOld: false,
          cacheKey: path.edgeKey(channel, slug),
          cacheValue: buildMpCacheValue(title, html, channel, date, slug),
          mp3CacheFilePath: path.edgeMp3CacheFilePath(channel, slug),
          mp3PublicDir: path.publicMp3Dir(pluginOption),
          mp3PublicFilePath: path.edgeMp3PublicFilePath(channel, slug, pluginOption),
          channel,
          slug
        }

        if (cachedValue) {
          response.hasCashe = true
          if (cachedValue === response.cacheValue){
            // 変更なし
            response.isOld = false
          } else {
            // 変更あり
            response.isOld = true
          }
        } else {
          // キャッシュなし
          response.isOld = false
        }

        resolve(response)
      }
    )
  })
}

export const cacheToPablic = (podcastCacheCheckResponse: iPodcastCacheCheckResponse) => {
  return new Promise((resolve: (podcastCacheCheckResponse: iPodcastCacheCheckResponse) => void) => {
    mkdirp(podcastCacheCheckResponse.mp3PublicDir)
    .then(
      () => {
        fs.copyFile(podcastCacheCheckResponse.mp3CacheFilePath, podcastCacheCheckResponse.mp3PublicFilePath, (err) => {
          if (!err) {
            console.log('podcast: cache recovered')
            resolve(podcastCacheCheckResponse)
            return
          }
          resolve(podcastCacheCheckResponse)
        });
      }
    )
  })
}