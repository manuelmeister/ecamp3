<template>
  <v-container fluid>
    <content-card max-width="800" :title="$tc('views.campCreate.title')" toolbar>
      <ValidationObserver v-slot="{ handleSubmit }">
        <v-form ref="form" @submit.prevent="handleSubmit(createCamp)">
          <v-card-text>
            <server-error :server-error="serverError" />
            <e-text-field
              v-model="camp.name"
              :name="$tc('entity.camp.fields.name')"
              vee-rules="required"
              required
              autofocus />
            <e-text-field
              v-model="camp.title"
              :name="$tc('entity.camp.fields.title')"
              vee-rules="required"
              required />
            <e-text-field
              v-model="camp.motto"
              :name="$tc('entity.camp.fields.motto')"
              vee-rules="required"
              required />
            <e-select
              v-model="camp.campPrototypeId"
              :name="$tc('entity.camp.prototype')"
              :items="campTemplates">
              <template #item="data">
                <v-list-item v-bind="data.attrs" v-on="data.on">
                  <v-list-item-content>
                    {{ data.item.text }}
                  </v-list-item-content>
                </v-list-item>
              </template>
            </e-select>
            <create-camp-periods :add-period="addPeriod" :periods="camp.periods"
                                 :delete-period="deletePeriod" :period-deletable="periodDeletable" />
          </v-card-text>
          <v-divider />
          <v-card-text class="text-right">
            <button-cancel />
            <button-add type="submit">
              {{ $tc('views.campCreate.create') }}
            </button-add>
          </v-card-text>
        </v-form>
      </ValidationObserver>
    </content-card>
  </v-container>
</template>

<script>
import ButtonAdd from '@/components/buttons/ButtonAdd'
import ButtonCancel from '@/components/buttons/ButtonCancel'
import ContentCard from '@/components/layout/ContentCard'
import ETextField from '@/components/form/base/ETextField'
import ESelect from '@/components/form/base/ESelect'
import { campRoute } from '@/router'
import ServerError from '@/components/form/ServerError'
import { ValidationObserver } from 'vee-validate'
import CreateCampPeriods from '@/components/camp/CreateCampPeriods'

export default {
  name: 'Camps',
  components: {
    CreateCampPeriods,
    ButtonAdd,
    ButtonCancel,
    ContentCard,
    ETextField,
    ESelect,
    ValidationObserver,
    ServerError
  },
  data () {
    return {
      camp: {
        name: '',
        title: '',
        motto: '',
        campTemplateId: null,
        periods: [
          {
            key: 0,
            start: '',
            end: '',
            description: this.$tc('entity.period.defaultDescription')
          }
        ]
      },
      serverError: null,
      periodKey: 0
    }
  },
  computed: {
    campTemplates () {
      return this.api.get().camps({ isPrototype: 1 }).items.map(ct => ({
        value: ct.id,
        text: this.$tc(ct.name),
        object: ct
      }))
    },
    periodDeletable () {
      return this.camp.periods.length > 1
    },
    campsUrl () {
      return this.api.get().camps()._meta.self
    }
  },
  created () {
  },
  methods: {
    createCamp: function () {
      this.api.post(this.campsUrl, this.camp).then(c => {
        this.$router.push(campRoute(c, 'admin'))
        this.api.reload(this.campsUrl)
      }, (error) => {
        this.serverError = error
      })
    },
    addPeriod: function () {
      this.camp.periods.push({
        key: ++this.periodKey,
        start: '',
        end: '',
        description: ''
      })
    },
    deletePeriod: function (idx) {
      this.camp.periods.splice(idx, 1)
    }
  }
}
</script>

<style scoped>

</style>
