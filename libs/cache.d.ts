/// <reference types="node" />
import { iPodcastEdge } from './interfaces';
/** キャッシュを取得 */
export declare const podcastCacheGet: (key: string) => Promise<string | null>;
/** キャッシュを保存 */
export declare const podcastCashSet: (key: string, value: string, channel: string, slug: string, audio?: Buffer | undefined) => Promise<unknown>;
/** ハッシュ生成器 */
export declare const buildMDHash: (title: string, rawMarkdownBody: string) => string;
/** キャッシュ値 */
export declare const buildMpCacheValue: (title: string, body: string, channel: string, date: string, slug: string) => string;
export interface iPodcastCacheCheckResponse {
    hasCashe: boolean;
    isOld: boolean;
    cacheKey: string;
    cacheValue: string;
    mp3CacheFilePath: string;
    mp3PublicDir: string;
    mp3PublicFilePath: string;
    channel: string;
    slug: string;
    audioData?: Buffer;
}
export declare const checkCache: (edge: iPodcastEdge, pluginOption: any) => Promise<iPodcastCacheCheckResponse>;
export declare const cacheToPablic: (podcastCacheCheckResponse: iPodcastCacheCheckResponse) => Promise<iPodcastCacheCheckResponse>;
