<template>
  <q-page class="flex justify-start items-center column full-width">
    <div class="q-pa-md">
      <q-card class="q-ma-sm" style="width: 800px">
        <q-card-actions class="bg-positive row">
          <q-btn
            @click.native="read"
            class="bg-white col-3"
            text-color="tertiary"
            label="Open MARC"
            icon="file download"
            flat
          />
          <div class="col"/>
          <q-btn
            @click.native="write"
            class="bg-white col-3"
            text-color="tertiary"
            label="Export MARC"
            icon="file upload"
            flat
          />
        </q-card-actions>
      </q-card>
    </div>
    <div class="row flex flex-center full-width q-pa-sm">
      <span class="current-record-before bg-light text-black q-pa-sm">
        Record #
        </span>
      <q-input
        v-model="currentRecord"
        class="current-record bg-white col-1"
        type="number"
        :decimals=0
        :before="[
          {
            icon: 'navigate before',
            handler: this.prev,
          }
        ]"
        :after="[
          {
            icon: 'navigate next',
            handler: this.next,
          }
        ]"

      />
      <span class="current-record-after bg-light text-black q-pa-sm">
        of {{ Object.keys(records).length }}
      </span>
    </div>
    <div class="row flex flex-center full-width q-pa-sm">
        <marc-record
          class="marc-record"
          :record="records[index]"
          :length="Object.keys(records).length - 1"
        />
    </div>
  </q-page>
</template>

<script>

import marcRecord from './../components/marc/marc-record.vue';

export default {
  data() {
    return {
      records: '',
      marcDisplay: '',
      marc: this.$marc,
      page: 0,
      currentRecord: 1,
    };
  },
  computed: {
    index() {
      return this.currentRecord - 1;
    },
  },
  components: {
    marcRecord,
  },
  watch: {
    currentRecord: function (n, o) {
      console.log(n);
      if (!Number.isInteger(n)) {
        this.currentRecord = o;
        return;
      }
      if (n < 1) {
        this.currentRecord = 1;
        return;
      }
      if (n > Object.keys(this.records).length) {
        this.currentRecord = Object.keys(this.records).length;
      }
    },
  },
  methods: {
    read() {
      this.marc.read(this.importRecord);
    },
    write() {
      this.marc.write();
    },
    importRecord(data) {
      this.records = data;
      console.log(data);
    },
    prev() {
      if (this.currentRecord > 1) {
        this.currentRecord = this.currentRecord - 1;
      }
    },
    next() {
      if (this.currentRecord < Object.keys(this.records).length) {
        this.currentRecord = this.currentRecord + 1;
      }
    },
  },
  created() {

  },
};
</script>

<style lang="stylus">
@import '~variables'

.marc-record {
  width: 100%;
  min-height: 400px;
}
.current-record input {
  text-align: center;
}
.current-record-before {
  border-radius: 3px 0 0 3px;
}
.current-record-after {
  border-radius: 0 3px 3px 0;
}
</style>
