<template>
  <q-card class="bg-white text-dark q-mr-sm q-mb-sm" inline style="width: 250px;">
    <q-card-media>
      <img :src="book.img" />
    </q-card-media>
    <q-card-title class="q-mb-none">
      {{ book.title }}
      <p slot="subtitle" class="q-ma-none text-faded">{{ book.author }}</p>
    </q-card-title>
    <q-card-main>
      <div v-for="list in book.list" :key="list.id"
        class="q-mb-xs bg-light items-center row seller-lists">
        <div class="col-8">
          <div class="q-pa-xs">{{ list.listname }}</div>
        </div>
        <div class="col-2 row text-center q-pr-xs"
          style="margin-left: -3px; border-left: 3px solid #fff">
          <div class="bg-light q-pa-xs">
            <div class="full-width">Rank</div>
            <div class="full-width">{{ list.rank }}</div>
          </div>
        </div>
        <div class="col-2 row text-center q-pr-xs"
          style="margin-left: -3px; border-left: 3px solid #fff">
          <div class="bg-light q-pa-xs">
            <div class="full-width">Weeks</div>
            <div class="full-width">{{ list.weeks }}</div>
          </div>
        </div>
      </div>
    </q-card-main>
    <q-card-separator />
    <q-card-actions class="row text-center">
      <div v-for="(type, i) in types" :key="type.name" class="col-2 format-row q-pa-xs">
        <div>{{ type.name }}</div>
        <div v-if="book.formats[i]">
          {{ book.formats[i] }}
        </div>
        <div class="x" v-else>
          x
        </div>
      </div>
    </q-card-actions>
  </q-card>
</template>

<script>
export default {
  props: ['book'],
  data() {
    return {
      types: {
        1: {
          name: 'BK',
          enable: true,
        },
        33: {
          name: 'LT',
          enable: true,
        },
        36: {
          name: 'EB',
          enable: true,
        },
        41: {
          name: 'EA',
          enable: true,
        },
        52: {
          name: 'CD',
          enable: true,
        },
      },
    };
  },
};
</script>

<style lang="stylus">
@import '~variables'
  .format-row
    width: 20%
    .x
      background-color: $red-2
  .q-card-media
    width: 100%
    padding-top: 140% /* Aspect Ratio of Image */
    position: relative
    > img
      position: absolute
      top: 0
      left: 0
      bottom: 0
      right: 0
</style>
