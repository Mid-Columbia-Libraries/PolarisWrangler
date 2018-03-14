<template>
  <q-page class="flex flex-center">
    <q-spinner-pie size="64px" v-if="!this.lists" />
    <div class="full-width row" v-else>
      <div class="lists q-pa-md bg-white">
        <h5 class="text-black q-ma-sm">Select Lists to Search:</h5>
        <nyt-list
          v-for="list in this.lists.results"
          :list="list"
          :selected.sync="selected"
          :key="list.id"
        />
      </div>
      <div class="col">
        Results
      </div>
    </div>
  </q-page>
</template>

<script>
import nytList from './../components/nyt/nyt-list.vue';

const axios = require('axios');

export default {
  data() {
    return {
      lists: false,
      selected: {
        lists: [],
      },
    };
  },
  components: {
    nytList,
  },
  watch: {
    selected: {
      handler() {
      },
      deep: true,
    },
  },
  methods: {

  },
  created() {
    axios.get(`https://api.nytimes.com/svc/books/v3/lists/names.json?api-key=${this.$config.get('nytKey')}`)
      .then((r) => {
        this.lists = r.data;
      });
  },
};
</script>

<style lang="stylus">
@import '~variables'

</style>
