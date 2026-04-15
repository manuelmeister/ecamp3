import * as pdfjsLib from 'pdfjs-dist/legacy/build/pdf.mjs'

async function getPdfProperties(buffer) {
  const data = new Uint8Array(buffer)
  const loadDocument = pdfjsLib.getDocument({ data: data })
  const pdfDocument = await loadDocument.promise
  return {
    numPages: pdfDocument.numPages,
  }
}

export { getPdfProperties }
