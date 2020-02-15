"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getChannelOption = (channel, option) => {
    const channelOptions = option && option.channels;
    return channel && channel !== 'null' && channelOptions[channel]
        ? channelOptions[channel]
        : channelOptions.default ? channelOptions.default : null;
};
exports.getSiteUrl = (option) => {
    return option && option.siteURL;
};
exports.getAudioPath = (option) => {
    return option && option.audioDir;
};
exports.getChannelTitle = (channel, option) => {
    const channelOption = exports.getChannelOption(channel, option);
    return channelOption ? channelOption.title : 'channel title is not set';
};
exports.getChannelDescription = (channel, option) => {
    const channelOption = exports.getChannelOption(channel, option);
    return channelOption ? channelOption.description : 'channel description is not set';
};
exports.getGoogleProjectId = (option) => {
    return option && option.projectId ? option.projectId : null;
};
exports.getGoogleKeyFileName = (option) => {
    return option && option.KeyFileName ? option.KeyFileName : null;
};
