<template>
  <q-page class="flex items-start column full-width ">
    <div class="searchbar full-width row q-pa-md">
      <div class="col-1" />
      <q-input
        class="col-7 q-ml-sm"
        v-model="query"
        inverted
        placeholder="Enter a query"
        autofocus
        clearable
      />
      <q-select
        class="col-1 q-ml-sm"
        v-model="auth"
        :options="selectOptions"
        inverted
      />
      <q-btn
        @click.native="wrangle"
        v-if="!status"
        class="bg-positive col-2 q-ml-sm"
        text-color="tertiary"
        label="Wrangle"
        icon="healing"
        flat
      />
      <q-btn
        @click.native="abort"
        v-if="status"
        class="bg-negative col-2 q-ml-sm"
        text-color="tertiary"
        label="Abort!"
        icon="report"
        flat
      />
      <div class="col-1" />
    </div>
    <div class="output bg-tertiary full-width q-pa-md">
      <vue-json-pretty :data="data" />
    </div>
  </q-page>
</template>

<script>
import VueJsonPretty from 'vue-json-pretty';

export default {
  data() {
    return {
      query: '',
      auth: false,
      status: false,
      selectOptions: [
        {
          label: 'Public',
          value: false,
        },
        {
          label: 'Protected',
          value: true,
        },
      ],
      api: this.$jsPAPI({
        server: this.$config.get('polarisUrl'),
        accessid: this.$config.get('polarisId'),
        key: this.$config.get('polarisKey'),
      }),
      data: {},
    };
  },
  computed: {
  },
  components: {
    VueJsonPretty,
  },
  watch: {
  },
  methods: {
    wrangle() {
      this.status = true;
      this.api.call(this.query)
        .then((r) => {
          this.status = false;
          this.data = r;
        })
        .catch((e) => {
          this.status = false;
          this.data = e;
        });
    },
    abort() {

    },
  },
  created() {
  },
};
</script>

<style lang="stylus">
@import '~variables'
  .status
    margin-top: -24px
    margin-bottom: 24px
    z-index: 100
  .output span
    font-family: 'Monaco', 'Menlo', 'Consolas', 'Bitstream Vera Sans Mono', monospace
</style>
