<template>
  <v-app>
    <router-view name="navigation" />

    <router-view name="aside" />

    <!-- main content -->
    <v-main>
      <router-view />
    </v-main>

    <!-- footer -->
    <v-footer v-if="$vuetify.breakpoint.smAndUp"
              app color="grey lighten-5">
      <small>eCamp <a v-if="version" :href="versionLink" target="_blank">
        {{ version }}
      </a></small>
      <v-spacer />
      <language-switcher />
    </v-footer>
  </v-app>
</template>

<script>
import LanguageSwitcher from '@/components/layout/LanguageSwitcher'
import VueI18n from '@/plugins/i18n'
import urltemplate from 'url-template'

export default {
  name: 'App',
  components: { LanguageSwitcher },
  computed: {
    profile () {
      return this.api.get().profile()
    },
    version () {
      return window.environment.VERSION || ''
    },
    versionLink () {
      return urltemplate.parse(window.environment.VERSION_LINK_TEMPLATE).expand({ version: this.version }) || '#'
    }
  },
  created () {
    this.$store.commit('setLanguage', this.$store.state.lang.language)
  },
  async mounted () {
    if (await this.$auth.refreshLoginStatus()) {
      this.profile._meta.load.then(profile => {
        if (VueI18n.availableLocales.includes(profile.language)) {
          this.$store.commit('setLanguage', profile.language)
        }
      })
    }
  }
}
</script>
<style lang="scss">
  @import "src/scss/global";
  @import "~@mdi/font/css/materialdesignicons.css";

  .v-btn.ec-drawer-collapse {
    right: 0;
  }

  @media #{map-get($display-breakpoints, 'xs-only')}{
    html,body,.v-application {
      height: 100%;
    }

    .v-application--wrap {
      min-height: 100%!important;
    }
  }

  .v-app-bar .v-toolbar__content {
    padding-left: 0;
    padding-right: 0;
    width: 100%;
  }

  .user-nav {
    border-top-left-radius: 0 !important;
    border-top-right-radius: 0 !important;
  }

  .v-navigation-drawer--temporary.v-navigation-drawer--clipped {
    margin-top: 56px;
  }

  .v-btn--open {
    background: #B0BEC5 !important;
    color: rgba(0, 0, 0, 0.87) !important;
  }

  .ec-usermenu {
    border-top-left-radius: 0 !important;
    border-top-right-radius: 0 !important;
    right: 0;
    left: inherit !important;

    .v-list {
      border-radius: 0;
    }
  }

  .v-app-bar .v-toolbar__content {
    padding-left: 0;
    padding-right: 0;
    width: 100%;
  }

  .v-navigation-drawer__content .v-card {
    border-top-left-radius: 0 !important;
    border-top-right-radius: 0 !important;
  }

  @media #{map-get($display-breakpoints, 'xs-only')}{
    .v-main .container {
      min-height: 100%;
      display: flex;

      .v-card {
        margin-left: 0 !important;
        margin-right: 0 !important;
        flex: auto;
      }
    }
  }

  .ec-menu-left {
    left: 0 !important;
    font-feature-settings: 'tnum';
  }

  @media #{map-get($display-breakpoints, 'sm-and-down')}{
    .container.container--fluid {
      padding: 0;

      & > .v-card {
        border-radius: 0;
      }
    }
    .sr-only-sm-and-down {
      position: absolute;
      width: 1px;
      height: 1px;
      padding: 0;
      overflow: hidden;
      clip: rect(0, 0, 0, 0);
      white-space: nowrap;
      clip-path: inset(50%);
      border: 0;
    }
  }
</style>
