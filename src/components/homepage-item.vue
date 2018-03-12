<template>
  <q-item
  :class="router.history.current.path == '/' + path ? 'active' : ''"
  @click.native="router.push('/' + path)">
    <q-item-side :icon="icon" />
    <q-item-main :label="name"
      :sublabel="desc" />
  </q-item>
</template>

<script>

import { openURL } from 'quasar';

export default {
  props: [
    'name',
    'path',
    'desc',
    'icon',
  ],
  data() {
    return {
      router: this.$router,
      leftDrawerOpen: this.$q.platform.is.desktop,
      subtitle: 'Let\'s wrangle some Polarises',
      actionsSize: 'wide',
    };
  },
  methods: {
    openURL,
  },
};
</script>

<style lang="stylus">
@import '~variables'

</style>
