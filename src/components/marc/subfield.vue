<template>
  <span>
      <span class="subfield-code bg-light-blue-3 q-pa-xs">{{ subfield.code }}</span>
      <span class="subfield-data q-pa-xs">{{ subfield.data }}</span>
  </span>

</template>

<script>

export default {
  props: [
    'subfield',
  ],
  data() {
    return {
    };
  },
};
</script>

<style lang="stylus">
@import '~variables'


</style>
