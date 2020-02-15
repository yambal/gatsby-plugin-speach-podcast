var fs = require('fs')
import { getMp3Duration } from './get-mp3-duration'

export const getITunesDuration = (mp3FilePath: string) => {
  const buffer = fs.readFileSync(mp3FilePath)
  const duration = getMp3Duration(buffer) // ms
  const h = Math.floor(duration / 1000 / 3600)
  const m = Math.floor((duration / 1000 - h * 3600) / 60)
  const s = Math.floor(duration / 1000 - h * 3600 - m * 60) + 1
  const strDuration = `${('00' + h).slice(-2)}:${('00' + m).slice(-2)}:${('00' + s).slice(-2)}`
  return strDuration
}