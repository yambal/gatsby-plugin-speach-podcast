var _mkdirp = require('mkdirp')
var Promise = require('any-promise')

export const mkdirpThen = (dir: string, mode?: any) => {

  return new Promise((resolve: () => void, reject: (err: any) => void) => {
    _mkdirp(dir, mode, (err: any) => {
      if (err) {
        reject(err)
      } else {
        resolve()
      }
    })
  })
}