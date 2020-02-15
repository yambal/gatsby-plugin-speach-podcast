import * as crypto from 'crypto'
import { getAudioPath, getSiteUrl } from './option-parser'

const CACHE_DIR = '.podcast'

export const buildMDHash = (title: string, rawMarkdownBody: string) => {
    return crypto.createHash('md5').update(`${title}-${rawMarkdownBody}` , 'utf8').digest('hex')
}

export const edgeFileName = (channel: string, slug: string, exe?:string) => {
    const channelFix = channel ? `${channel}-` : ''
    const exeFix = exe ? `.${exe}` : ''
    return `podcast-${channelFix}${slug}${exeFix}`
}

export const path = {
    cacheDir: `${process.cwd()}/${CACHE_DIR}`,
    publicDir: `${process.cwd()}/public`,
    publicMp3Dir: (option) => {
        const audioPath = getAudioPath(option)
        return `${path.publicDir}/${audioPath}`
    },
    cacheFilePath: (key: string):string => {
        return `${path.cacheDir}/cache-${key}.txt`
    },
    edgeFileName: (channel: string, slug: string, exe?:string):string => {
        const channelFix = channel ? `${channel}-` : ''
        const exeFix = exe ? `.${exe}` : ''
        return `podcast-${channelFix}${slug}${exeFix}`
    },
    edgeKey: (channel: string, slug: string):string => {
        return path.edgeFileName(channel, slug)
    },
    edgeMp3FileName: (channel: string, slug: string):string => {
        return path.edgeFileName(channel, slug, 'mp3')
    },
    edgeMp3CacheFilePath: (channel: string, slug: string):string => {
        return `${path.cacheDir}/${path.edgeMp3FileName(channel, slug)}`
    },
    edgeMp3PublicFilePath: (channel: string, slug: string, option: any):string => {
        return `${path.publicMp3Dir(option)}/${path.edgeMp3FileName(channel, slug)}`
    },
    edgeMp3AbsoluteUrl: (channel: string, slug: string, option: any) => {
        const siteUrl = getSiteUrl(option)
        const audioPath = getAudioPath(option)
        return siteUrl ? `${siteUrl}/${audioPath}/${path.edgeMp3FileName(channel, slug)}` : 'siteUrl not set @option'
    }
}