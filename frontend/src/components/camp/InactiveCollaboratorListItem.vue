<template>
  <v-list-item class="px-0" two-line>
    <v-list-item-avatar>
      <v-img src="https://i.pravatar.cc/300" />
    </v-list-item-avatar>
    <v-list-item-content>
      <v-list-item-title v-if="collaborator.user">
        {{ collaborator.user().displayName }}
      </v-list-item-title>
      <v-list-item-subtitle v-else>
        {{ collaborator.inviteEmail }}
      </v-list-item-subtitle>
    </v-list-item-content>
    <v-list-item-action class="ml-5">
      <icon-button color="normal"
                   icon="mdi-refresh"
                   @click="api.patch(collaborator, {status: 'invited'})">
        {{ $tc('components.camp.inactiveCampCollaboratorListItem.inviteAgain') }}
      </icon-button>
    </v-list-item-action>
    <v-list-item-action>
      <dialog-entity-delete :entity="collaborator">
        <template #activator="{ on }">
          <button-delete v-on="on" />
        </template>
        {{ $tc('components.camp.inactiveCampCollaboratorListItem.delete') }} <br>
        <ul>
          <li>
            <span v-if="collaborator.user">
              {{ collaborator.user().displayName }}
            </span>
            <span v-else>
              {{ collaborator.inviteEmail }}
            </span>
          </li>
        </ul>
      </dialog-entity-delete>
    </v-list-item-action>
  </v-list-item>
</template>

<script>

import IconButton from '@/components/buttons/IconButton'
import ButtonDelete from '@/components/buttons/ButtonDelete'
import DialogEntityDelete from '@/components/dialog/DialogEntityDelete'

export default {
  name: 'InactiveCollaboratorListItem',
  components: { IconButton, ButtonDelete, DialogEntityDelete },
  props: {
    collaborator: { type: Object, required: true }
  }
}
</script>

<style scoped>
</style>
