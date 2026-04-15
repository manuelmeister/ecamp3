import fs from 'fs'
import path from 'path'
import * as pdfjsLib from 'pdfjs-dist/legacy/build/pdf.mjs'

export function moveDownloads(testInfo, downloadsFolder) {
  if (!downloadsFolder) downloadsFolder = 'data/downloads'
  const destSubDir = testInfo.title.replace(/[/\\?%*:|"<>]/g, '-')
  const destDirName = path.join(downloadsFolder, destSubDir)
  fs.mkdirSync(destDirName, { recursive: true })
  const files = fs.readdirSync(downloadsFolder, { withFileTypes: true })
  files.forEach((file) => {
    if (file.isDirectory()) {
      return
    }
    if (file.name !== '.gitkeep') {
      const oldPath = path.join(downloadsFolder, file.name)
      const newPath = path.join(destDirName, file.name)
      fs.renameSync(oldPath, newPath)
    }
  })
}

export function deleteDownloads(downloadsFolder) {
  if (!downloadsFolder) downloadsFolder = 'data/downloads'
  if (!fs.existsSync(downloadsFolder)) return
  const files = fs.readdirSync(downloadsFolder, { withFileTypes: true })
  files.forEach((file) => {
    if (file.name === '.gitkeep') {
      return
    }
    if (file.isDirectory()) {
      return
    }
    fs.unlinkSync(path.join(downloadsFolder, file.name))
  })
}

export async function getPdfProperties(filePath) {
  const data = new Uint8Array(fs.readFileSync(filePath))
  const loadDocument = pdfjsLib.getDocument({ data: data })
  const pdfDocument = await loadDocument.promise
  return {
    numPages: pdfDocument.numPages,
  }
}
