<template>
  <q-page class="flex items-start column full-width ">
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
      <q-select
        class="col-1 q-ml-sm"
        v-model="batch"
        inverted
        radio
        :options="batchOptions"
        default="KW"
      />
      <q-input
        class="col-3 q-ml-sm"
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
        @click.native="wrangle"
        v-if="!status"
        class="bg-positive col-2 q-ml-sm"
        text-color="tertiary"
        label="Wrangle"
        icon="healing"
        flat
      />
      <q-btn
        @click.native="abort"
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
        :percentage="statusPct"
        stripe
        animate
        style="height: 30px"
      />
    </div>
    <div class="status flex text-weight-bold flex-center full-width">
      {{ report }}
    </div>
    <div class="searchresults flex flex-center full-width q-pa-sm">
      <q-table
        class="bg-white text-dark full-width"
        color="black"
        title="Results"
        :loading="status"
        :data="found"
        :columns="columns"
        :pagination.sync="paginationControl"
        row-key="name"
      >
        <q-td slot="body-cell-title" slot-scope="props" :props="props">
          <div small color="secondary">{{ props.value }}</div>
        </q-td>
        <q-td slot="body-cell-author" slot-scope="props" :props="props">
          <div small color="secondary">{{ props.value }}</div>
        </q-td>
        <q-td slot="body-cell-num" slot-scope="props" :props="props">
          <div small color="secondary">{{ props.value }}</div>
        </q-td>
        <q-td slot="body-cell-print" slot-scope="props" :props="props">
          <div small color="secondary">{{ props.value }}</div>
        </q-td>
      </q-table>
    </div>
  </q-page>
</template>

<script>
import seriesRow from './../components/series/series-row.vue';

// AJAX Library
const axios = require('axios');

export default {
  components: {
    seriesRow,
  },
  data() {
    return {
      report: 'You haven\'t done anything yet. Good job.',
      status: false,
      statusPct: 0,
      key: 'KW',
      term: 'tolkien',
      show: 'ms',
      batch: 100,
      store: [],
      dispatchCount: 0,
      pending: false,
      found: [
        {
          title: 'Lord of the Rings',
          author: 'Tolkien',
        },
      ],
      done: {},
      paginationControl: {
        rowsPerPage: 0,
      },
      columns: [
        {
          name: 'title',
          label: 'Series',
          field: 'title',
          required: true,
        },
        {
          name: 'author',
          label: 'Author',
          field: 'author',
        },
        {
          name: 'num',
          label: '#',
          field: 'num',
        },
        {
          name: 'print',
          label: 'Print',
          field: 'p',
        },
        {
          name: 'ebook',
          label: 'eBook',
          field: 'e',
        },
        {
          name: 'audio',
          label: 'Audio',
          field: 'a',
        },
        {
          name: 'unknown',
          label: 'Unknown',
          field: 'u',
        },
        {
          name: 'frankenstein',
          label: 'Frankenstein',
          field: 'f',
        },
      ],
      api: this.$jsPAPI({
        server: this.$config.get('polarisUrl'),
        accessid: this.$config.get('polarisId'),
        key: this.$config.get('polarisKey'),
      }),
      batchOptions: [
        {
          label: 'Fast',
          value: 1000,
        },
        {
          label: 'Medium',
          value: 100,
        },
        {
          label: 'Slow',
          value: 10,
        },
      ],
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
  methods: {
    // React when Wrangle button is clicked
    wrangle() {
      // Report displays the current state of operations for the user
      this.report = 'Starting search...';
      this.status = true;
      this.store = [];
      this.done = {};
      this.found = [];
      this.pending = true;
      // Bind context and make initial call to recursive lookup
      this.getPacResults.bind(this)(1);
    },
    // React when abort button is clicked
    abort() {
      this.cancel('Search aborted.');
    },
    // Stop execution with a status message
    cancel(msg) {
      this.status = false;
      this.statusPct = 0;
      this.report = msg;
    },
    // Update progress bar and report msg
    progress(pct, msg) {
      this.statusPct = pct;
      this.report = msg;
    },
    // Signal that process completed successfully
    finish() {
      this.status = false;
      this.statusPct = 0;
      this.report = 'Good job. You did it.';
    },
    // Begins chain, gets initial pac results
    getPacResults(offset = 1) {
      // If process was aborted, stop execution
      if (!this.status) return;
      // Perform the search
      this.api.bibSearchKW(this.term, this.key, offset, this.batch)
        // Wait for response from Polaris
        .then((r) => {
          // User aborted
          if (!this.status) return;
          // If error code -1, something went wrong at Polaris
          if (r.data.PAPIErrorCode < 0) {
            this.cancel(`Polaris says: ${r.data.ErrorMessage}`);
            return;
          }
          // If error code = 0, no results found
          if (r.data.PAPIErrorCode === 0) {
            this.cancel('No results found for that query.');
            return;
          }
          // If current results less than total, add to data array and recurse
          const cur = ((offset - 1) * this.batch) + r.data.PAPIErrorCode;
          if (cur < r.data.TotalRecordsFound) {
            this.progress(
              (cur / r.data.TotalRecordsFound) * 50,
              `Retrieved ${cur} of ${r.data.TotalRecordsFound}...`,
            );
            // Append store with new results
            this.store = this.store.concat(r.data.BibSearchRows);
            // Increment and recurse...
            offset += 1;
            this.getPacResults(offset);
            return;
          }
          // Else, we are done, append final results & send to nvHandler()
          this.store = this.store.concat(r.data.BibSearchRows);
          this.progress(50, `Retrieved ${r.data.TotalRecordsFound} records, processing...`);

          this.nvHandler();
        })
        .catch(() => {
          this.cancel('Oops. There was a network problem connecting to Polaris.');
        });
    },
    // Checks if item is a new ISBN and dispatches NV request
    nvHandler(i = 0) {
      // If process was aborted, stop execution
      if (!this.status) return;
      // Clean up ISBN
      const isbn = this.trimISBN(this.store[i].ISBN);
      // If item returned a valid ISBN, send to NoveList
      if (isbn && typeof (this.done[isbn]) === 'undefined') { this.getNvItem(i, isbn); }
      // Otherwise continue to next item
      else if (i < (this.store.length - 1)) { this.nvHandler(i += 1); }
      else {
        this.pending = false;
      }
    },
    // Gets the item from NV and parses it
    getNvItem(i, isbn) {
      // Set AJAX params for NoveList Call
      const url = 'https://novselect.ebscohost.com/Data/ContentByQuery';
      const attr = {
        profile: this.$config.get('nvProfile'),
        password: this.$config.get('nvPassword'),
        siteToken: null,
        isbn,
        clientIdentifier: 'test',
      };
      // Perform AJAX call to NoveList
      axios.get(url, { params: attr })
        .then((r) => {
          // Extract data from results
          this.extractResults(r);
          // Increment and check if we need to continue
          i += 1;
          if (i < (this.store.length)) {
            // Update progress bar
            this.progress(
              ((i / this.store.length) * 50) + 50,
              `Processed ${i} of ${this.store.length}...`,
            );
            this.nvHandler(i);
          } else {
            this.pending = false;
          }
        })
        .catch(() => {
          this.cancel('Oops. There was a network problem connecting to NoveList');
        });
    },
    extractResults(r) {
      // If process was aborted, stop execution
      if (!this.status) return;
      const series = r.data.FeatureContent.SeriesInfo;
      const item = r.data.TitleInfo;
      // If this is part of a series, process it
      if (series && series.series_titles.length > 0) {
        // Check if we have seen this series before
        const ti = series.full_title.toUpperCase();
        const au = item.author;

        let key = false;
        for (let k = 0; k < this.found.length; k += 1) {
          if (this.found[k].title === ti && this.found[k].author === au) {
            key = k;
            break;
          }
        }

        // If this is a new series, process it
        if (!key) {
          const titles = {};
          // Loop through titles in series
          Object.values(series.series_titles).forEach((title) => {
            // Loop through manifestations of the title
            titles[title.full_title] = {};
            Object.values(title.manifestations).forEach((manifestation) => {
              // Add ISBN to done list so we don't have to check it again later
              this.done[manifestation.ISBN] = true;
              // Decide what format this manifestation is
              let format;
              if (manifestation.MediaFormat === 'Hardback') format = 'p';
              else if (manifestation.MediaFormat === 'Paperback') format = 'p';
              else if (manifestation.MediaFormat === 'Ebook') format = 'e';
              else if (manifestation.MediaFormat === 'Audiobook') format = 'a';
              else format = 'u';
              // Create format array if needed
              if (!titles[title.full_title][format]) titles[title.full_title][format] = {};
              // Add manifestation ISBN to array for this title
              titles[title.full_title][format][manifestation.ISBN] = false;
            });
          });

          // Push the parsed array to the finished data array
          const index = this.found.push({
            title: ti,
            author: au,
            num: Object.keys(titles).length,
            titles,
            p: {},
            e: {},
            a: {},
            u: {},
            f: {},
          });
          // Now we dispatch lookups to polaris with a callback to update index
          // For each title in the series
          Object.keys(titles).forEach((title) => {
            // For each format...
            Object.keys(titles[title]).forEach((format) => {
              let isbns;
              // For each ISBN associated with the format
              Object.keys(titles[title][format]).forEach((isbn) => {
                if (!isbns) isbns = `ISBN=${isbn}`;
                else isbns = `${isbns} OR ISBN=${isbn}`;
              });
              const query = `search/bibs/boolean?q=${isbns}`;
              this.dispatchCount += 1;
              this.api.call(query)
                .then(r2 => this.confirmByISBN(r2, index - 1, title, format));
            });
          });
        } else {
          // console.log(`duplicate found at key: ${key}`);
        }
      }
    },
    confirmByISBN(r, index, title, format) {
      if (!this.status) return;
      // Set found # for the format
      this.found[index].titles[title][format] = r.data.TotalRecordsFound;
      ['p', 'e', 'a', 'u'].forEach((type) => {
        let count = 0;
        Object.keys(this.found[index].titles).forEach((key) => {
          if (this.found[index].titles[key][type] > 0) count += 1;
        });
        this.found[index][type] = `${count} / ${this.found[index].num}`;
      });
      let count = 0;
      Object.keys(this.found[index].titles).forEach((key) => {
        if (this.found[index].titles[key].p > 0) count += 1;
        else if (this.found[index].titles[key].e > 0) count += 1;
        else if (this.found[index].titles[key].a > 0) count += 1;
        else if (this.found[index].titles[key].u > 0) count += 1;
        this.found[index].f = `${count} / ${this.found[index].num}`;
      });
      this.dispatchCount -= 1;
      if (!this.pending && this.dispatchCount < 1) this.finish();
    },

    trimISBN(str) {
      if (!str) return false;
      str = str.split(' ');
      str = str[0];
      str = str.replace(/[^0-9]/g, '');
      return str;
    },
    strip(str) {
      if (!str) return '';
      str = str.toUpperCase();
      str = str.replace(/AUTHOR/g, '');
      str = str.replace(/EDITOR/g, '');
      str = str.replace(/[^A-Z]/g, '');
      return str;
    },
  },
};
</script>

<style lang="stylus">
@import '~variables'
  .status
    margin-top: -24px
    margin-bottom: 24px
    z-index: 100
</style>
