import { GraphQLObjectType, GraphQLString, GraphQLList, GraphQLInt } from 'gatsby/graphql'
import { path } from './libs/filePath'
import { getAudioPath, getSiteUrl } from './libs/option-parser'
import { iPluginOption } from './libs/interfaces';
import { getAbout } from 'md-to-google-ssml';

// =====================================================
let HeaderType = new GraphQLObjectType({
  name: `header`,
  fields: {
    text: {
      type: GraphQLString
    },
    level: {
      type: GraphQLInt
    }
  }
})

let LinkType = new GraphQLObjectType({
  name: `link`,
  fields: {
    text: {
      type: GraphQLString
    },
    href: {
      type: GraphQLString
    }
  }
})


let PodCastType = new GraphQLObjectType({
  name: 'Mp3',
  fields: {
    absoluteUrl: { type: GraphQLString },
    url: { type: GraphQLString },
    path: { type: GraphQLString },
    headers: {type: new GraphQLList(HeaderType)},
    links: {type: new GraphQLList(LinkType)}
  },
});
  
// @ts-ignore: Unreachable code error
module.exports = ({ type }, option: iPluginOption) => {
  if (type.name !== `MarkdownRemark`) {
    return {}
  }

  return {
    mp3: {
      type: PodCastType,
      args: {
        prefix: {
          type: GraphQLString,
        }
      },
      // @ts-ignore: Unreachable code error
      resolve: (MDNode, args) => {
        const {
          frontmatter,
          rawMarkdownBody
        } = MDNode

        const { templateKey, slug, channel } = frontmatter
        const audioPath = getAudioPath(option)
        const fileName = path.edgeMp3FileName(channel, slug)
        const mp3PublicFilePath = path.edgeMp3PublicFilePath(channel, slug, option)
        const absoluteUrl = path.edgeMp3AbsoluteUrl(channel, slug, option)

        const about = getAbout(rawMarkdownBody)

        if (templateKey === 'PodCast'){
          return {
            absoluteUrl: absoluteUrl,
            url: `/${audioPath}/${fileName}`,
            path: mp3PublicFilePath,
            headers: about.headers,
            links: about.links
          }
        }

        return null
      }
    }
  }
}