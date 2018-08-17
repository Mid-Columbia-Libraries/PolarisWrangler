<template>
  <q-page class="flex items-start column full-width">
    <div class="searchbar justify-center full-width row q-pa-sm">
      <q-input
        class="full-width"
        v-model="query"
        inverted
        placeholder="Enter a query"
        autofocus
        clearable
      />
    </div>
    <div class="full-width row justify-center q-pl-sm q-pr-sm q-pb-sm">
      <q-select
        class="col-2 q-ml-sm"
        v-model="authlvl"
        :options="authOptions"
        inverted
      />
      <q-checkbox class="col-2 round-borders text-dark bg-white q-ml-sm q-pa-sm"
        v-model="useCredentials" label="Use Credentials" />
      <q-input
        class="col-2 q-ml-sm"
        v-model="user"
        inverted
        placeholder="User"
        clearable
        :disabled="!useCredentials"
      />
      <q-input
        class="col-2 q-ml-sm"
        v-model="pass"
        inverted
        placeholder="Password"
        clearable
        :disabled="!useCredentials"
      />
      <q-input
        class="col-2 q-ml-sm"
        v-model="domain"
        inverted
        placeholder="Domain"
        clearable
        :disabled="!useCredentials"
      />
      <q-select
        class="col-1 q-ml-sm"
        v-model="params.accept"
        :options="responseOptions"
        inverted
      />
      <q-btn
        @click.native="wrangle"
        v-if="!status"
        class="col-2 bg-positive q-ml-sm"
        text-color="tertiary"
        label="Wrangle"
        icon="healing"
        flat
      />
      <q-btn
        @click.native="abort"
        v-if="status"
        class="col-2 bg-negative q-ml-sm"
        text-color="tertiary"
        label="Abort!"
        icon="report"
        flat
      />
    </div>
    <div class="output bg-tertiary full-width q-pa-md">
      <vue-json-pretty :data="output.data" />
    </div>
    <div class="config bg-tertiary full-width q-mt-md q-pa-md">
      <vue-json-pretty :data="output.config" />
    </div>
  </q-page>
</template>

<script>
import VueJsonPretty from 'vue-json-pretty';
// import { stringify } from 'querystring';

export default {
  data() {
    return {
      // The query string user input
      query: '',
      // API call paramss generated from input
      params: {
        accept: 'application/json',
      },
      // Whether to use Patron or Protected authlvl
      authlvl: 'protected',
      useCredentials: false,
      user: '',
      pass: '',
      domain: '',
      status: false,
      authOptions: [
        {
          label: 'No API Key',
          value: 'patron',
        },
        {
          label: 'Use API Key',
          value: 'protected',
        },
      ],
      responseOptions: [
        {
          label: 'JSON',
          value: 'application/json',
        },
        {
          label: 'XML',
          value: 'application/xml',
        },
      ],
      api: this.$jsPAPI({
        server: this.$config.get('polarisUrl'),
        accessid: this.$config.get('polarisId'),
        key: this.$config.get('polarisKey'),
        authlvl: this.authlvl,
      }),
      output: {
        data: {},
        config: {},
      },
    };
  },
  computed: {
  },
  components: {
    VueJsonPretty,
  },
  watch: {
    useToken() {
      if (this.useToken) this.authlvl = 'protected';
    },
    authlvl() {
      this.api = this.$jsPAPI({
        server: this.$config.get('polarisUrl'),
        accessid: this.$config.get('polarisId'),
        key: this.$config.get('polarisKey'),
        authlvl: this.authlvl,
      });
    },
  },
  methods: {
    getCfg(input) {
      const cfg = input.config;
      delete cfg.adapter;
      delete cfg.transformRequest;
      delete cfg.transformResponse;
      return cfg;
    },
    wrangle() {
      this.status = true;
      this.output.data = {};
      this.output.config = {};
      if (this.useCredentials) {
        this.api.authenticateStaff(this.user, this.pass, this.domain).then((r) => {
          console.log(r);
        });
      } else {
        const pass = Object.assign({}, this.params);
        this.api.call(this.query, pass)
          .then((r) => {
            this.status = false;
            this.output.config = this.getCfg(r);
            delete r.config;
            this.output.data = r;
            this.status = false;
          })
          .catch((e) => {
            this.output.config = this.getCfg(e);
            this.status = false;
          });
      }
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
  .config span
    font-family: 'Monaco', 'Menlo', 'Consolas', 'Bitstream Vera Sans Mono', monospace
</style>
