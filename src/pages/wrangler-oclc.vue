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
      {{ record }}
    </div>
  </q-page>
</template>

<script>

export default {
  data() {
    return {
      record: '',
      marc: this.$marc,
    };
  },
  computed: {
  },
  components: {
  },
  watch: {
  },
  methods: {
    read() {
      this.record = this.marc.read(this.importRecord);
      console.log(this.record);
    },
    write() {
      this.marc.write();
    },
    importRecord(data) {
      this.record = data.toString();
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
