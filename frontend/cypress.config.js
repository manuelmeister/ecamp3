const { defineConfig } = require('cypress')

const fs = require('fs')
const path = require('path')

module.exports = defineConfig({
  video: false,
  pageLoadTimeout: 120000,
  defaultCommandTimeout: 8000,
  fixturesFolder: 'tests/e2e/fixtures',
  screenshotsFolder: 'data/e2e/screenshots',
  videosFolder: 'data/e2e/videos',
  e2e: {
    setupNodeEvents(on, config) {
      on('task', {
        deleteDownloads() {
          const dirPath = config.downloadsFolder
          fs.readdir(dirPath, (err, files) => {
            for (const file of files) {
              fs.unlink(path.join(dirPath, file), () => {
                console.log('Removed ' + file)
              })
            }
          })
          return null
        },
      })
    },
    specPattern: 'tests/e2e/specs/**/*.cy.{js,jsx,ts,tsx}',
    supportFile: 'tests/e2e/support/index.js',
    baseUrl: 'http://localhost:3000',
  },
  env: {
    PRINT_URL: 'http://localhost:3000/print',
    API_ROOT_URL: 'http://localhost:3000/api',
  },
})
