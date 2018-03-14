<template>
  <q-page class="flex flex-center">
    <div class="container column">
      <q-card class="q-ma-md" style="width: 500px">
        <q-card-actions class="bg-positive row justify-between">
          <q-btn
            @click.native="router.push('/')"
            class="bg-positive col"
            text-color="tertiary"
            label="Done Here, Go Home"
            icon="home"
            flat
          />
          <q-btn
            @click.native="load"
            class="bg-white col-3"
            text-color="tertiary"
            label="Import"
            icon="file download"
            flat
          />
          <q-btn
            @click.native="save"
            class="bg-white col-3"
            text-color="tertiary"
            label="Export"
            icon="file upload"
            flat
          />
        </q-card-actions>
      </q-card>
      <q-card class="q-ma-md" style="width: 500px">
        <q-card-title class="bg-white text-tertiary">
          Polaris Settings
        </q-card-title>
        <q-card-separator />
        <q-card-main class="bg-white text-tertiary">
          <q-input
            class="q-mb-sm"
            inverted
            v-model="cfg.polarisUrl"
            float-label="API URL"
            placeholder="catalog.your-library.org"
          />
          <q-input
            class="q-mb-sm"
            inverted
            v-model="cfg.polarisId"
            float-label="Access ID"
            placeholder="Example: my-app"
          />
          <q-input
            inverted
            v-model="cfg.polarisKey"
            float-label="API Key"
            placeholder="Example: SUPERSEC-RETC-0DES-D0NT-PUBL1SH0NWEB"
          />

        </q-card-main>
        <q-card-separator />
        <q-card-actions
          v-bind:class="[polarisStatus ? 'bg-positive' : 'bg-light']"
          class="justify-between"
        >
          <div class="text-black q-pa-sm">
            {{ polarisStatusMsg }}
          </div>
          <q-btn
            @click.native="testPolaris"
            :loading="polarisLoading"
            class="float-right"
            color="primary"
            text-color="tertiary"
            label="Test"
            icon="check"
            flat
          />
        </q-card-actions>
      </q-card>

      <q-card class="q-ma-md" style="width: 500px">
        <q-card-title class="bg-white text-tertiary">
          Novelist Settings
        </q-card-title>
        <q-card-separator />
        <q-card-main class="bg-white text-tertiary">
          <q-input
            class="q-mb-sm"
            inverted
            v-model="cfg.nvProfile"
            float-label="Profile"
            placeholder="Example: s0000000.main.novsel"
          />
          <q-input
            class="q-mb-sm"
            inverted
            v-model="cfg.nvPassword"
            float-label="Password"
            placeholder="your-password"
          />
          <q-input
            class="q-mb-sm"
            inverted
            v-model="cfg.nvDelay"
            float-label="Delay (ms)"
            default="50"
          />
        </q-card-main>
        <q-card-separator />
        <q-card-actions
          v-bind:class="[nvStatus ? 'bg-positive' : 'bg-light']"
          class="justify-between"
        >
          <div class="text-black q-pa-sm">
            {{ nvStatusMsg }}
          </div>
          <q-btn
            @click.native="testNovelist"
            :loading="nvLoading"
            class="float-right"
            color="primary"
            text-color="tertiary"
            label="Test"
            icon="check"
            flat
          />
        </q-card-actions>
      </q-card>

      <q-card class="q-ma-md" style="width: 500px">
        <q-card-title class="bg-white text-tertiary">
          New York Times Settings
        </q-card-title>
        <q-card-separator />
        <q-card-main class="bg-white text-tertiary">
          <q-input
            class="q-mb-sm"
            inverted
            v-model="cfg.nytKey"
            float-label="API Key"
            placeholder="Example: 1892849ef22c454iaf39dd09420935q"
          />
        </q-card-main>
        <q-card-separator />
        <q-card-actions
          v-bind:class="[nytStatus ? 'bg-positive' : 'bg-light']"
          class="justify-between"
        >
          <div class="text-black q-pa-sm">
            {{ nytStatusMsg }}
          </div>
          <q-btn
            @click.native="testNyt"
            :loading="nytLoading"
            class="float-right"
            color="primary"
            text-color="tertiary"
            label="Test"
            icon="check"
            flat
          />
        </q-card-actions>
      </q-card>

    </div>
  </q-page>
</template>

<script>
// AJAX Library
const axios = require('axios');

export default {
  data() {
    return {
      router: this.$router,
      polarisStatusMsg: '',
      polarisStatus: false,
      polarisLoading: false,
      nvStatusMsg: '',
      nvStatus: false,
      nvLoading: false,
      nytStatusMsg: '',
      nytStatus: false,
      nytLoading: false,
      cfg: this.$config.get(),
      save: this.$config.export,
      load: this.$config.import,
    };
  },
  watch: {
    // Watch CFG input for changes
    cfg: {
      handler() {
        // On change, save new config
        this.$config.set(this.cfg);
        // On change, reset test indicators
        this.polarisStatus = false;
        this.nvStatus = false;
        this.nytStatus = false;
        this.polarisStatusMsg = '';
        this.nvStatusMsg = '';
        this.nytStatusMsg = '';
      },
      deep: true,
    },
  },
  methods: {
    testPolaris() {
      // Test Polaris Configuration
      this.polarisLoading = true;
      this.polarisStatusMsg = '';
      this.polarisStatus = false;
      const papi = this.$jsPAPI({
        server: this.$config.get('polarisUrl'),
        accessid: this.$config.get('polarisId'),
        key: this.$config.get('polarisKey'),
      });
      papi.limitFiltersGet()
        .then((r) => {
          if (r.status === 200) {
            this.polarisLoading = false;
            this.polarisStatus = true;
            this.polarisStatusMsg = 'That looks OK.';
          } else {
            this.polarisLoading = false;
            this.polarisStatus = false;
            this.polarisStatusMsg = 'Oops. That didn\'t work.';
          }
        })
        .catch(() => {
          this.polarisLoading = false;
          this.polarisStatus = false;
          this.polarisStatusMsg = 'Oops. That didn\'t work.';
        });
    },
    testNovelist() {
      // Test Novelist Configuration
      this.nvLoading = true;
      this.nvStatusMsg = '';
      this.nvStatus = false;
      const url = 'https://novselect.ebscohost.com/Data/ContentByQuery';
      const attr = {
        profile: this.$config.get('nvProfile'),
        password: this.$config.get('nvPassword'),
        siteToken: null,
        isbn: '9781612130286',
        clientIdentifier: 'test',
      };
      axios.get(url, { params: attr })
        .then((r) => {
          if (r.status === 200) {
            this.nvLoading = false;
            this.nvStatus = true;
            this.nvStatusMsg = 'That looks OK.';
          } else {
            this.nvLoading = false;
            this.nvStatus = false;
            this.nvStatusMsg = 'Oops. That didn\'t work.';
          }
        })
        .catch(() => {
          this.nvLoading = false;
          this.nvStatus = false;
          this.nvStatusMsg = 'Oops. That didn\'t work.';
        });
    },
    testNyt() {
      // Test NYT Configuration
      this.nytLoading = true;
      this.nytStatusMsg = '';
      this.nytStatus = false;

      axios.get(`https://api.nytimes.com/svc/books/v3/lists/names.json?api-key=${this.$config.get('nytKey')}`)
        .then((r) => {
          if (r.status === 200) {
            this.nytLoading = false;
            this.nytStatus = true;
            this.nytStatusMsg = 'That looks OK.';
          } else {
            this.nytLoading = false;
            this.nytStatus = false;
            this.nytStatusMsg = 'Oops. That didn\'t work.';
          }
        })
        .catch(() => {
          this.nytLoading = false;
          this.nytStatus = false;
          this.nytStatusMsg = 'Oops. That didn\'t work.';
        });
    },
  },
  created() {
    // On load, run tests
    this.testPolaris();
    this.testNovelist();
    this.testNyt();
  },
};
</script>

<style lang="stylus">

</style>
