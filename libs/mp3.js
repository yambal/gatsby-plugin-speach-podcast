"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const text_to_speech_1 = __importDefault(require("@google-cloud/text-to-speech"));
const getMp3 = (ssml, projectId, keyFilename) => {
    return new Promise((resolve, reject) => {
        const client = new text_to_speech_1.default.TextToSpeechClient({
            projectId: projectId,
            keyFilename: keyFilename,
        });
        // https://cloud.google.com/text-to-speech/docs/reference/rest/v1beta1/text/synthesize?hl=ja
        const request = {
            input: {
                ssml
            },
            voice: {
                languageCode: 'ja-JP',
                name: 'ja-JP-Standard-A',
                ssmlGender: 'NEUTRAL'
            },
            audioConfig: {
                speakingRate: 1.15,
                pitch: -5,
                audioEncoding: 'MP3'
            },
        };
        client.synthesizeSpeech(request)
            .then((responses) => {
            const audioContent = responses[0].audioContent;
            resolve(audioContent);
        });
    });
};
exports.default = getMp3;
