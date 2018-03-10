<template>
  <q-page class="flex items-start column">
    <div class="searchbar full-width row q-pa-md">
      <div class="col-1" />
      <q-select
        class="col-2"
        v-model="key"
        inverted
        radio
        :options="keyOptions"
        default="KW"
      />
      <q-input
        class="col-4 q-ml-sm"
        v-model="term"
        inverted
        placeholder="Enter a search term"
        autofocus
        clearable
      />
      <q-select
        class="col-2 q-ml-sm"
        v-model="show"
        inverted
        radio
        :options="showOptions"
        default="KW"
      />
      <q-btn
        v-if="!status"
        class="bg-positive col-2 q-ml-sm"
        text-color="tertiary"
        label="Wrangle"
        icon="healing"
        flat
      />
      <q-btn
        v-if="status"
        class="bg-negative col-2 q-ml-sm"
        text-color="tertiary"
        label="Abort!"
        icon="report"
        flat
      />
      <div class="col-1" />
    </div>
    <div class="progress full-width">
      <q-progress
        :percentage="progress"
        stripe
        animate
        style="height: 12px"
      />
    </div>
    <div class="flex flex-center  searchresults full-width">
test
    </div>
  </q-page>
</template>

<script>
export default {
  data() {
    return {
      status: false,
      progress: 0,
      key: 'KW',
      term: '',
      show: 'ms',
      showOptions: [
        {
          label: 'Show All',
          value: 'all',
        },
        {
          label: 'Only Missing',
          value: 'ms',
        },
      ],
      keyOptions: [
        {
          label: 'Keyword',
          value: 'KW',
        },
        {
          label: 'Series',
          value: 'SE',
        },
        {
          label: 'Author',
          value: 'AU',
        },
        {
          label: 'Title',
          value: 'TI',
        },
      ],
    };
  },
};
</script>

<style lang="stylus">
@import '~variables'

</style>
