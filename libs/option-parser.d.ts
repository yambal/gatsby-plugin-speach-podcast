import { iPluginOption } from './interfaces';
interface iChannelOption {
    title: string;
    description: string;
}
export declare const getChannelOption: (channel?: string | undefined, option?: iPluginOption | undefined) => iChannelOption | null;
export declare const getSiteUrl: (option?: iPluginOption | undefined) => string | undefined;
export declare const getAudioPath: (option?: iPluginOption | undefined) => string | undefined;
export declare const getChannelTitle: (channel?: string | undefined, option?: any) => string;
export declare const getChannelDescription: (channel?: string | undefined, option?: any) => string;
export declare const getGoogleProjectId: (option?: any) => string | null;
export declare const getGoogleKeyFileName: (option?: any) => string | null;
export {};
