import textToSpeech from '@google-cloud/text-to-speech'

const getMp3 = (ssml: string, projectId: string, keyFilename: string) => {

  return new Promise((resolve: (data: any) => void, reject) => {
    const client = new textToSpeech.TextToSpeechClient({
      projectId: projectId,
      keyFilename: keyFilename,
    });
  
    const request: any = {
      input: {
        ssml
      },
      voice: {
        languageCode: 'ja-JP',
        name: 'ja-JP-Standard-A',
        ssmlGender: 'NEUTRAL'
      },
      audioConfig: {audioEncoding: 'MP3'},
    };
  
    client.synthesizeSpeech(request)
      .then((responses: any) => {
        const audioContent = responses[0].audioContent
        resolve(audioContent)
      })
  })
}

export default getMp3