export const contentNodeMixin = {
  props: {
    contentNode: { type: Object, required: true },
    layoutMode: { type: Boolean, required: true },
    draggable: { type: Boolean, default: false },
    disabled: { type: Boolean, default: false },
  },
  computed: {
    camp() {
      return this.contentNode.root().owner().camp()
    },
  },
}
