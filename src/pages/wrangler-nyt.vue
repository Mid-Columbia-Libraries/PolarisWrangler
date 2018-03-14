<template>
  <q-page class="flex flex-center">
    <q-spinner-pie size="64px" v-if="!this.lists" />
    <div class="full-width row" v-else>
      <div class="lists q-pa-md bg-white">
        <h4 class="text-black q-ma-sm">Select Lists to Search:</h4>
        <q-btn class="full-width q-mb-md" color="primary"
          @click="selected.lists = []">
          Clear Selection
        </q-btn>
        <nyt-list
          v-for="list in this.lists.results"
          :list="list"
          :selected.sync="selected"
          :key="list.id"
        />
      </div>
      <div class="col">
        <div class="progress full-width">
          <q-progress
            :percentage="statusPct"
            stripe
            :animate="this.statusPct != 100"
            style="height: 30px"
          />
        </div>
        <div class="status flex text-weight-bold flex-center full-width">
          {{ report }}
        </div>
        <div class="book-covers q-pl-lg q-mt-xl">
          <book-cover v-for="book in lookup" :key="book.id" :book="book" />
        </div>
      </div>
    </div>
  </q-page>
</template>

<script>
import nytList from './../components/nyt/nyt-list.vue';
import bookCover from './../components/nyt/book-cover.vue';

const axios = require('axios');

export default {
  data() {
    return {
      // Whether a search is in progress
      status: false,
      // Status message
      report: '',
      // Progress bar
      statusPct: 0,
      // Current search token used to invalidate stale XHR
      token: '',
      //
      xhrCount: 0,
      // The list of NYT lists
      lists: false,
      // The currently selected lists to lookup
      selected: {
        // Inside an object to avoid directly mutating from child
        lists: [],
      },
      // Keep track of how many list requests were sent
      sent: 0,
      // List of items we need to lookup
      lookup: [],
      // Polaris API controller object
      api: this.$jsPAPI({
        server: this.$config.get('polarisUrl'),
        accessid: this.$config.get('polarisId'),
        key: this.$config.get('polarisKey'),
      }),
    };
  },
  components: {
    nytList,
    bookCover,
  },
  watch: {
    selected: {
      // Watch for changes to input and kick off lookup chain
      handler() {
        // Cancel any ongoing lookup
        this.cancel();
        this.report = '(ง’̀-‘́)ง';
        this.startLookup();
      },
      deep: true,
    },
  },
  methods: {
    cancel() {
      this.report = '';
      this.token = '';
      this.lookup = [];
      this.status = false;
      this.statusPct = 0;
      this.xhrCount = 0;
    },
    // Kicks off lookup chain
    startLookup() {
      // Generate new search validator token
      this.token = `${Date.now()}${(1 + Math.random()).toString(36).substr(7)}`;
      // For each list, send an get titles from NYT
      this.selected.lists.forEach((l) => {
        this.sent += 1;
        axios.get('https://api.nytimes.com/svc/books/v3/lists.json',
          { params: {
            'api-key': this.$config.get('nytKey'),
            list: l,
          } })
          // Send results to combiner
          .then((r) => { this.combine(r, this.token); });
      });
    },
    // Combine data from multiple lists before parsing
    combine(r, token) {
      if (token !== this.token) return;
      // For
      r.data.results.forEach(this.checkDupes);
      // If no more outstanding RQs, go ahead and parse data
      this.sent -= 1;
      this.statusPct = 50;
      if (this.sent === 0) this.checkPAC(token);
    },
    // Parses dataset to look for items missing
    checkPAC(token) {
      if (token !== this.token) return;
      this.lookup.forEach((book, i) => {
        this.xhrCount += 1;
        const querystring = `TI=${book.ti} AND AU=${book.au}`;
        this.api.bibSearch(querystring)
          .then((r) => { this.parsePAC(r, i, token); });
      });
    },
    // Parse a pac search result
    parsePAC(r, i, token) {
      if (token !== this.token) return;
      r.data.BibSearchRows.forEach((row) => {
        this.lookup[i].formats[row.PrimaryTypeOfMaterial] = row.SystemItemsTotal;
      });
      this.lookup[i].status = true;
      this.xhrCount -= 1;
      if (this.xhrCount === 0) {
        this.statusPct = 100;
        console.log(this.lookup);
        this.report = '';
      }
    },
    // Check if we have seen this book already (from another list)
    checkDupes(row) {
      // Init book data
      const book = row.book_details[0];
      // Add stuff from book info
      book.au = this.clean(book.author);
      book.ti = this.clean(book.title);
      book.rank = row.rank;
      book.published_date = row.published_date;
      book.status = false;
      console.log(book);
      book.img = this.$getSyndeticsImage(2, book.primary_isbn13);
      book.formats = [];
      // Init list of lists this book is on
      book.list = [];
      const list = {
        listname: row.list_name,
        rank: row.rank,
        weeks: row.weeks_on_list,
      };
      book.list.push(list);

      // Check if this book is already in the results
      let dupe = false;
      this.lookup.some((b, i) => {
        // If we already have it, append list it reoccurs in
        if (b.au === book.au && b.ti === book.ti) {
          dupe = true;
          this.lookup[i].list.push(list);
          return true;
        }
        return false;
      });
      // If it wasn't found, push it
      if (!dupe) this.lookup.push(book);
    },

    // Removes punctuation, used for author/title strings
    clean(str) {
      if (!str) return '';
      str = str.toUpperCase();
      str = str.replace(/AUTHOR/g, '');
      str = str.replace(/EDITOR/g, '');
      str = str.replace(/[^A-Z ]/g, '');
      return str;
    },
  },
  created() {
    axios.get(`https://api.nytimes.com/svc/books/v3/lists/names.json?api-key=${this.$config.get('nytKey')}`)
      .then((r) => {
        this.lists = r.data;
      });
  },
};
</script>

<style lang="stylus">
@import '~variables'
  .status
    position: relative
    margin-top: -24px
    margin-bottom: 24px
    z-index: 100
</style>
