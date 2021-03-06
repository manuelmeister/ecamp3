<!--
Displays a single activity
-->

<template>
  <v-container fluid>
    <content-card toolbar>
      <template #title>
        <v-toolbar-title class="font-weight-bold">
          {{ scheduleEntry().number }}
          <v-chip v-if="!category._meta.loading" dark :color="category.color">{{ category.short }}</v-chip>
          {{ activity.title }}
        </v-toolbar-title>
      </template>
      <template #title-actions>
        <v-btn v-if="!layoutMode"
               color="primary"
               outlined
               @click="layoutMode = true">
          <template v-if="$vuetify.breakpoint.smAndUp">
            <v-icon left>mdi-puzzle-edit-outline</v-icon>
            {{ $tc('views.activity.activity.changeLayout') }}
          </template>
          <template v-else>{{ $tc('views.activity.activity.layout') }}</template>
        </v-btn>
        <v-btn v-else
               color="success"
               outlined
               @click="layoutMode = false">
          <template v-if="$vuetify.breakpoint.smAndUp">
            <v-icon left>mdi-check</v-icon>
            {{ $tc('views.activity.activity.backToContents') }}
          </template>
          <template v-else>{{ $tc('views.activity.activity.back') }}</template>
        </v-btn>
      </template>
      <v-card-text class="px-0 py-0">
        <v-skeleton-loader v-if="activity._meta.loading" type="article" />
        <template v-else>
          <!-- Header -->
          <v-row dense class="activity-header">
            <v-col class="col col-sm-6 col-12">
              <v-row v-if="$vuetify.breakpoint.smAndUp" dense>
                <v-col cols="2">
                  {{ $tc('entity.scheduleEntry.fields.nr') }}
                </v-col>
                <v-col cols="10">
                  {{ $tc('entity.scheduleEntry.fields.time') }}
                </v-col>
              </v-row>
              <v-row
                v-for="scheduleEntryItem in scheduleEntries"
                :key="scheduleEntryItem._meta.self" dense>
                <v-col cols="2">
                  ({{ scheduleEntryItem.number }})
                </v-col>
                <v-col cols="10">
                  {{ $date.utc(scheduleEntryItem.startTime).format($tc('global.datetime.dateShort')) }} <b>
                    {{ $date.utc(scheduleEntryItem.startTime).format($tc('global.datetime.hourShort')) }} </b> - {{
                    $date.utc(scheduleEntryItem.startTime).format($tc('global.datetime.dateShort')) == $date.utc(scheduleEntryItem.endTime).format($tc('global.datetime.dateShort'))
                      ? ''
                      : $date.utc(scheduleEntryItem.endTime).format($tc('global.datetime.dateShort'))
                  }} <b> {{ $date.utc(scheduleEntryItem.endTime).format($tc('global.datetime.hourShort')) }} </b>
                </v-col>
              </v-row>
            </v-col>
            <v-col class="col col-sm-6 col-12">
              <v-row dense>
                <v-col>
                  <api-text-field
                    :name="$tc('entity.activity.fields.location')"
                    :uri="activity._meta.self"
                    fieldname="location"
                    :disabled="layoutMode"
                    dense />
                </v-col>
              </v-row>
              <v-row dense>
                <v-col>
                  <api-select
                    :name="$tc('entity.activity.fields.responsible')"
                    dense
                    multiple
                    chips
                    deletable-chips
                    small-chips
                    :uri="activity._meta.self"
                    fieldname="campCollaborations"
                    :disabled="layoutMode"
                    :items="availableCampCollaborations" />
                </v-col>
              </v-row>
            </v-col>
          </v-row>
          <content-node v-if="activity.rootContentNode" :content-node="activity.rootContentNode()" :layout-mode="layoutMode" />
        </template>
      </v-card-text>
    </content-card>
  </v-container>
</template>

<script>
import ContentCard from '@/components/layout/ContentCard'
import ApiTextField from '@/components/form/api/ApiTextField'
import ApiSelect from '@/components/form/api/ApiSelect'

import ContentNode from '@/components/activity/ContentNode'

import { defineHelpers } from '@/components/scheduleEntry/dateHelperUTC'

export default {
  name: 'Activity',
  components: {
    ContentCard,
    ApiTextField,
    ApiSelect,
    ContentNode
  },
  props: {
    scheduleEntry: {
      type: Function,
      required: true
    }
  },
  data () {
    return {
      layoutMode: false
    }
  },
  computed: {
    availableCampCollaborations () {
      const currentCampCollaborationIds = this.activity.campCollaborations().items.map(cc => cc.id)
      return this.campCollaborations.filter(cc => {
        return (cc.status === 'established') || (currentCampCollaborationIds.includes(cc.id))
      }).map(value => {
        const inactive = value.status === 'inactive'
        const text = value.user().displayName + (inactive ? (' (' + this.$tc('entity.campCollaboration.inactive')) + ')' : '')
        return {
          value,
          text
        }
      })
    },
    campCollaborations () {
      return this.activity.camp().campCollaborations().items
    },
    activity () {
      return this.scheduleEntry().activity()
    },
    category () {
      return this.activity.category()
    },
    scheduleEntries () {
      return this.activity.scheduleEntries().items.map((entry) => defineHelpers(entry))
    },
    contentNodes () {
      return this.activity.contentNodes()
    }
  },
  methods: {
    countContentNodes (contentType) {
      return this.contentNodes.items.filter(cn => {
        return cn.contentType().id === contentType.id
      }).length
    }
  }
}
</script>

<style scoped>
.activity-header {
  margin-bottom: 0;
  border-bottom: 1px solid rgba(0, 0, 0, 0.12);
  padding: 1.5rem 16px;
}
</style>
