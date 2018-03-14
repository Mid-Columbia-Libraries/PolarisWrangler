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
      <div class="format-row q-pa-xs">
        <div>Book</div>
        <div v-if="typeof(book.formats[1]) !== 'undefined' && book.formats[1] > 0">
          {{ book.formats[1] }}
        </div>
        <div v-else>x</div>
      </div>
      <div class="format-row q-pa-xs">
        <div>Large</div>
        <div v-if="typeof(book.formats[27]) !== 'undefined' && book.formats[27] > 0">
          {{ book.formats[27] }}
        </div>
        <div v-else>x</div>
      </div>
      <div class="format-row q-pa-xs">
        <div>eBook</div>
        <div v-if="typeof(book.formats[36]) !== 'undefined' && book.formats[36] > 0">
          {{ book.formats[36] }}
        </div>
        <div v-else>x</div>
      </div>
      <div class="format-row q-pa-xs">
        <div>Audio</div>
        <div v-if="typeof(book.formats[41]) !== 'undefined' && book.formats[41] > 0">
          {{ book.formats[41] }}
        </div>
        <div class="x" v-else>x</div>
      </div>
      <div class="format-row q-pa-xs">
        <div>eAudio</div>
        <div v-if="typeof(book.formats[52]) !== 'undefined' && book.formats[52] > 0">
          {{ book.formats[52] }}
        </div>
        <div v-else>x</div>
      </div>
      <div class="col-1" />
    </q-card-actions>
  </q-card>
</template>

<script>
export default {
  props: ['book'],
  data() {
    return {
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
