import * as fs from 'fs'

const FileType = {
  File: 'file',
  Directory: 'directory',
  Unknown: 'unknown'
}
  
const getFileType = (path: string) => {
  try {
    const stat = fs.statSync(path);

    switch (true) {
      case stat.isFile():
        return FileType.File;

      case stat.isDirectory():
        return FileType.Directory;

      default:
        return FileType.Unknown;
    }

  } catch(e) {
    return FileType.Unknown;
  }
}
  
export const listFiles = (dirPath: string) => {
  const ret: any[] = [];
  try {
    const paths = fs.readdirSync(dirPath);
    paths.forEach(a => {
      const path = `${dirPath}/${a}`;

      switch (getFileType(path)) {
        case FileType.File:
          ret.push(path);
          break;

        case FileType.Directory:
          ret.push(...listFiles(path));
          break;

        default:
          /* noop */
      }
    })

    return ret;
  } catch (e) {
    return []
  }
};