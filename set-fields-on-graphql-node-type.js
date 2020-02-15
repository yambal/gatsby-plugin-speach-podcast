"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const graphql_1 = require("gatsby/graphql");
const filePath_1 = require("./libs/filePath");
const option_parser_1 = require("./libs/option-parser");
// =====================================================
let MP3Type = new graphql_1.GraphQLObjectType({
    name: 'Mp3',
    fields: {
        absoluteUrl: { type: graphql_1.GraphQLString },
        url: { type: graphql_1.GraphQLString },
        path: { type: graphql_1.GraphQLString }
    },
});
module.exports = ({ type }, option) => {
    if (type.name !== `MarkdownRemark`) {
        return {};
    }
    return {
        mp3: {
            type: MP3Type,
            args: {
                prefix: {
                    type: graphql_1.GraphQLString,
                }
            },
            resolve: (MDNode, args) => {
                const { frontmatter } = MDNode;
                const { templateKey, slug, channel } = frontmatter;
                const audioPath = option_parser_1.getAudioPath(option);
                const fileName = filePath_1.path.edgeMp3FileName(channel, slug);
                const mp3PublicFilePath = filePath_1.path.edgeMp3PublicFilePath(channel, slug, option);
                const absoluteUrl = filePath_1.path.edgeMp3AbsoluteUrl(channel, slug, option);
                if (templateKey === 'PodCast') {
                    return {
                        absoluteUrl: absoluteUrl,
                        url: `/${audioPath}/${fileName}`,
                        path: mp3PublicFilePath
                    };
                }
                return null;
            }
        }
    };
};
