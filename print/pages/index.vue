<template>
  <div>
    <div>
      <h1>GUGUsusudasldkjflk jkaldsjfkladsj lsjfaksjd lkfjsdlfjk as</h1>
      Lorem ipsum dolor sit amet, consectetur adipisicing elit. Adipisci at aut
      cupiditate dignissimos distinctio, dolor eius expedita hic ipsam molestiae
      perspiciatis praesentium ratione rerum sed sit sunt unde veniam
      voluptates.
    </div>

    <div class="blubi">
      <picasso :camp="camp" />
    </div>
  </div>
</template>

<script>
export default {
  data() {
    return {
      config: {},
      pagedjs: '',
      camp: null,
      activities: null,
    }
  },
  async fetch() {
    const query = this.$route.query

    this.config = {
      showFrontpage:
        query.showFrontpage && query.showFrontpage.toLowerCase() === 'true',
      showToc: query.showToc && query.showToc.toLowerCase() === 'true',
      showPicasso:
        query.showPicasso && query.showPicasso.toLowerCase() === 'true',
      showStoryline:
        query.showStoryline && query.showStoryline.toLowerCase() === 'true',
      showDailySummary:
        query.showDailySummary &&
        query.showDailySummary.toLowerCase() === 'true',
      showActivities:
        query.showActivities && query.showActivities.toLowerCase() === 'true',
    }

    await this.$api
      .post('/authentication_token', {
        username: 'test-user',
        password: 'test',
      })
      // eslint-disable-next-line no-console
      .then(() => console.log('succ'))

    this.camp = await this.$api.get().camps({ id: query.camp })._meta.load
    this.activities = (await this.camp.activities()._meta.load).items
  },
}
</script>

<style>
@page picassopage {
  size: a4 landscape !important;
  margin: 2cm;
}

.blubi {
  page: picassopage;
  break-inside: avoid;
}
</style>
