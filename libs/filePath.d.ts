export declare const buildMDHash: (title: string, rawMarkdownBody: string) => string;
export declare const edgeFileName: (channel: string, slug: string, exe?: string | undefined) => string;
export declare const path: {
    cacheDir: string;
    publicDir: string;
    publicMp3Dir: (option: any) => string;
    cacheFilePath: (key: string) => string;
    edgeFileName: (channel: string, slug: string, exe?: string | undefined) => string;
    edgeKey: (channel: string, slug: string) => string;
    edgeMp3FileName: (channel: string, slug: string) => string;
    edgeMp3CacheFilePath: (channel: string, slug: string) => string;
    edgeMp3PublicFilePath: (channel: string, slug: string, option: any) => string;
    edgeMp3AbsoluteUrl: (channel: string, slug: string, option: any) => string;
};
