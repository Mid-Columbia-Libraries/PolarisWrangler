<template>
  <div>
      {{ field.tag }} {{ field.data}}
  </div>

</template>

<script>

export default {
  props: [
    'field',
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
