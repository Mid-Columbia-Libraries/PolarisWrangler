<template>
  <div>
      <div class="marc-header bg-primary q-pa-sm">
        {{ parseInt(record.id) + 1 }} of {{ length + 1 }}
      </div>
      <div class="marc-body bg-white text-black">
          <control-field
            v-for="field in record._controlFields"
            :field="field"
          />
          <data-field
            v-for="field in record._dataFields"
            :field="field"
          />
      </div>
  </div>

</template>

<script>
import controlField from './control-field.vue';
import dataField from './data-field.vue';

export default {
  props: [
    'record',
    'length',
  ],
  components: {
    controlField,
    dataField,
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
