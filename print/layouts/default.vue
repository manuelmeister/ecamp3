<template>
  <v-app>
    <v-main>
      <v-container class="container">
        <nuxt />
      </v-container>
    </v-main>
    <script src="https://unpkg.com/pagedjs/dist/paged.polyfill.js"></script>
  </v-app>
</template>

<script>
export default {
  data() {
    return {
      pagedjs: true,
    }
  },

  head() {
    const header = {}

    /**
     * Define default footer & header
     * This can be overridden in route views
     */
    header.__dangerouslyDisableSanitizersByTagID = {
      defaultMarginBox: ['cssText'], // disable sanitzing of below inline css
    }

    header.style = []

    header.script = []

    // inject FRONTEND_URL to client
    header.__dangerouslyDisableSanitizersByTagID.environmentVariables = [
      'innerHTML',
    ]
    header.script.push({
      hid: 'environmentVariables',
      type: 'application/javascript',
      innerHTML: `window.FRONTEND_URL = '${process.env.FRONTEND_URL}'`,
    })

    // confiugration JS for pagedJS
    header.script.push({
      src: '/pagedConfig.js',
    })

    // PagedJS
    header.script.push({
      src: 'https://unpkg.com/pagedjs/dist/paged.polyfill.js',
    })

    // event listener to communicate with parent when embedded in iFrame
    header.script.push({
      src: '/iframeEvents.js',
    })

    header.link = [
      {
        rel: 'stylesheet',
        href: '/print-preview.css',
      },
    ]

    return header
  },
}
</script>

<style lang="scss" scoped>
.container {
  margin: 0;
  padding: 0;
}
</style>
