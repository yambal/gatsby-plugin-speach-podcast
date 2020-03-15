"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const graphql_1 = require("gatsby/graphql");
const filePath_1 = require("./libs/filePath");
const option_parser_1 = require("./libs/option-parser");
const md_to_google_ssml_1 = require("md-to-google-ssml");
// =====================================================
let HeaderType = new graphql_1.GraphQLObjectType({
    name: `header`,
    fields: {
        text: {
            type: graphql_1.GraphQLString
        },
        level: {
            type: graphql_1.GraphQLInt
        }
    }
});
let LinkType = new graphql_1.GraphQLObjectType({
    name: `link`,
    fields: {
        text: {
            type: graphql_1.GraphQLString
        },
        href: {
            type: graphql_1.GraphQLString
        }
    }
});
let PodCastType = new graphql_1.GraphQLObjectType({
    name: 'Mp3',
    fields: {
        absoluteUrl: { type: graphql_1.GraphQLString },
        url: { type: graphql_1.GraphQLString },
        path: { type: graphql_1.GraphQLString },
        headers: { type: new graphql_1.GraphQLList(HeaderType) },
        links: { type: new graphql_1.GraphQLList(LinkType) }
    },
});
// @ts-ignore: Unreachable code error
module.exports = ({ type }, option) => {
    if (type.name !== `MarkdownRemark`) {
        return {};
    }
    return {
        mp3: {
            type: PodCastType,
            args: {
                prefix: {
                    type: graphql_1.GraphQLString,
                }
            },
            // @ts-ignore: Unreachable code error
            resolve: (MDNode, args) => {
                const { frontmatter, rawMarkdownBody } = MDNode;
                const { templateKey, slug, channel } = frontmatter;
                const audioPath = option_parser_1.getAudioPath(option);
                const fileName = filePath_1.path.edgeMp3FileName(channel, slug);
                const mp3PublicFilePath = filePath_1.path.edgeMp3PublicFilePath(channel, slug, option);
                const absoluteUrl = filePath_1.path.edgeMp3AbsoluteUrl(channel, slug, option);
                const about = md_to_google_ssml_1.getAbout(rawMarkdownBody);
                if (templateKey === 'PodCast') {
                    return {
                        absoluteUrl: absoluteUrl,
                        url: `/${audioPath}/${fileName}`,
                        path: mp3PublicFilePath,
                        headers: about.headers,
                        links: about.links
                    };
                }
                return null;
            }
        }
    };
};
