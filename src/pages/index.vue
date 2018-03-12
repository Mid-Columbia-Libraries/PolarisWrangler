<template>
  <q-page class="flex flex-center">
    <q-list
      no-border
      link
      inset-delimiter
    >
      <homepage-item
        v-for="page in this.$pages"
        v-if="page.name != 'separator' && page.name != 'Home'"
        class="bg-white text-tertiary q-ma-sm q-pa-lg"
        :name="page.name"
        :icon="page.icon"
        :desc="page.desc"
        :path="page.path"
        :key="page.id"
      />
    </q-list>
  </q-page>
</template>

<script>
import homepageItem from './../components/homepage-item.vue';

export default {
  components: {
    homepageItem,
  },
  data() {
    return {

    };
  },

};
</script>

<style lang="stylus">
@import '~variables'

</style>
