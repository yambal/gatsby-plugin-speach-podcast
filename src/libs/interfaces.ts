export interface iPodcastEdge {
  node: {
    html: string
    frontmatter: {
      title: string
      date: string
      channel: string
      slug : string
    }
    rawMarkdownBody: string
  }
}

export interface iPluginOption {
  projectId: string
  keyFilename: string
  siteURL: string
  audioDir: string
  channels: any
}

/*
      options: {
        projectId: 'texttospeach-261314',
        keyFilename: 'TextToSpeach-e373fcafd2ef.json',
        siteURL: 'https://www.yambal.net',
        audioDir: 'audio',
        channels: {
          default : {
            title: 'WWW.YAMBAL.NET',
            description: 'WWW.YAMBAL.NET'
          },
          test :{
            title: 'HAL4500',
            description: 'Text To Speech によるポッドキャスト配信のテストです。'
          }
        }
      }
      */