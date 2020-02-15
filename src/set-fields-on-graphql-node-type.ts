import { GraphQLObjectType, GraphQLString } from 'gatsby/graphql'
import { path } from './libs/filePath'
import { getAudioPath, getSiteUrl } from './libs/option-parser'

// =====================================================
let MP3Type = new GraphQLObjectType({
    name: 'Mp3',
    fields: {
      absoluteUrl: { type: GraphQLString },
      url: { type: GraphQLString },
      path: { type: GraphQLString }
    },
  });
  
  module.exports = ({ type }, option) => {
    if (type.name !== `MarkdownRemark`) {
      return {}
    }
  
    return {
      mp3: {
        type: MP3Type,
        args: {
          prefix: {
            type: GraphQLString,
          }
        },
        resolve: (MDNode, args) => {
          const {
            frontmatter
          } = MDNode
  
          const { templateKey, slug, channel } = frontmatter
          const audioPath = getAudioPath(option)
          const fileName = path.edgeMp3FileName(channel, slug)
          const mp3PublicFilePath = path.edgeMp3PublicFilePath(channel, slug, option)
          const absoluteUrl = path.edgeMp3AbsoluteUrl(channel, slug, option)

          if (templateKey === 'PodCast'){
            return {
              absoluteUrl: absoluteUrl,
              url: `/${audioPath}/${fileName}`,
              path: mp3PublicFilePath
            }
          }
  
          return null
        }
      }
    }
  }