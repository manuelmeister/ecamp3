import { test, expect } from '@playwright/test'
import * as fs from 'node:fs'
import * as path from 'node:path'
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
