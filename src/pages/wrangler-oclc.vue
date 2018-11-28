<template>
  <q-page class="flex justify-start items-center column full-width">
    <div class="q-pa-md">
      <q-card class="q-ma-md" style="width: 500px">
        <q-card-actions class="bg-positive row justify-between">
          <q-btn
            @click.native="read"
            class="bg-white col-3"
            text-color="tertiary"
            label="Import"
            icon="file download"
            flat
          />
          <q-btn
            @click.native="write"
            class="bg-white col-3"
            text-color="tertiary"
            label="Export"
            icon="file upload"
            flat
          />
        </q-card-actions>
      </q-card>
    </div>
    <div class="row flex flex-center full-width q-pa-sm">
      <q-carousel
        id="marc-record-carousel"
        class="text-white"
        :arrows=true
        :quick-nav=true
      >
        <q-carousel-slide
          v-bind:key="record._leader._baseAddressOfData"
          v-for="record in records"
        >
          <marc-record
            :record="record"
            :length="Object.keys(record).length"
          />
        </q-carousel-slide>
      </q-carousel>
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
    };
  },
  components: {
    marcRecord,
  },
  computed: {
  },
  watch: {
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
  },
  created() {

  },
};
</script>

<style lang="stylus">
@import '~variables'

#marc-record-carousel {
  width: 90%;
  min-height: 400px;
}
</style>
