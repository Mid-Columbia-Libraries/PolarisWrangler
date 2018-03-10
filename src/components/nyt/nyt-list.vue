<template>
  <q-field class="text-tertiary q-pa-xs">
    <q-checkbox
      v-model="selected.lists"
      :val="this.list.list_name_encoded"
      :label="this.list.display_name"
    />
  </q-field>
</template>

<script>
export default {
  props: [
    'list',
    'selected',
  ],
  data() {
    return {
    };
  },
};
</script>

<style lang="stylus">
@import '~variables'

</style>
