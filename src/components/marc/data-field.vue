<template>
  <div class="data-field q-pa-xs q-mb-xs">
      <span class="marc-tag bg-light q-pa-xs">{{ field.tag }}</span>
      <subfield
        v-for="subfield in field.subfields"
        :subfield="subfield"
      />
  </div>

</template>

<script>
import subfield from './subfield.vue';

export default {
  props: [
    'field',
  ],
  components: {
    subfield,
  },
  data() {
    return {
    };
  },
};
</script>

<style lang="stylus">
@import '~variables'

.marc-tag {
  border-right: 1px solid #333;
}

</style>
