export interface iPodcastEdge {
    node: {
        html: string;
        frontmatter: {
            title: string;
            description: string;
            date: string;
            channel: string;
            slug: string;
        };
        rawMarkdownBody: string;
    };
}
export interface iPluginOption {
    projectId: string;
    keyFilename: string;
    siteURL: string;
    audioDir: string;
    channels: any;
}
