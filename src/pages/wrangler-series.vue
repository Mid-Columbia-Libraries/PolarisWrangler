<template>
  <q-page class="flex items-start column full-width ">
    <div class="searchbar full-width row q-pa-md">
      <q-select
        class="col-2"
        v-model="collection"
        inverted
        radio
        :options="collections"
        default="KW"
      />
      <q-select
        class="col-2 q-ml-sm"
        v-model="key"
        inverted
        radio
        :options="keyOptions"
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
        class="bg-white text-dark full-width q-pr-lg"
        color="black"
        dense
        :loading="status"
        :data="found"
        :columns="columns"
        :pagination.sync="paginationControl"
        row-key="name"
      >
        <q-tr @click.native="showModal(props.row)"
          v-if="
            // Don't show series with only 1 item
            props.row.num > 1
            // Apply show filter
            && (
              show === 'all'
              || props.row[show] / props.row.num !== 1
            )
          " slot="body" slot-scope="props" :props="props">
          <q-td v-for="(col, i) in props.cols" :key="col.name" :props="props">
            <span class="q-body-1" v-if="props.cols[i].type === 'fraction'">
              {{ col.value }}/{{ props.row.num }}
            </span>
            <span class="q-body-1" v-else>
              {{ col.value }}
            </span>
          </q-td>
        </q-tr>
      </q-table>
    </div>
    <q-modal column v-model="detailsOpen">
      <h4 row class="q-ma-sm">{{ details.title }}</h4>
      <div row class="q-ma-sm">
        <q-table
          class="full-width"
          color="black"
          :data="details.table"
          :columns="detailsColumns"
          :pagination.sync="paginationControl"
          row-key="name"
        >
        </q-table>
      </div>
      <q-btn
        row
        class="full-width q-mt-sm"
        color="primary"
        @click="detailsOpen = false"
        label="Close"
      />
    </q-modal>
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
      show: 'all',
      batch: 100,
      store: [],
      method: 'hybrid',
      dispatchCount: 0,
      pending: false,
      details: {},
      detailsOpen: false,
      types: {
        0: 'Unknown',
        1: 'Books',
        33: 'Film',
        36: 'eBook',
        41: 'eAudio',
        52: 'AudioCd',
      },
      detailsColumns: [
        {
          name: 'Title',
          label: 'Title',
          field: 'title',
        },
      ],
      found: [
        {
          title: 'Lord of the Rings',
          author: 'Tolkien',
        },
      ],
      done: {},
      paginationControl: {
        rowsPerPage: 100,
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
          name: 'frankenstein',
          label: 'Frankenstein',
          field: 'f',
          type: 'fraction',
        },
      ],
      api: this.$jsPAPI({
        server: this.$config.get('polarisUrl'),
        accessid: this.$config.get('polarisId'),
        key: this.$config.get('polarisKey'),
      }),
      collection: '*',
      collections: [
        {
          label: 'All',
          value: '*',
        },
      ],
      showOptions: [
        {
          label: 'Show All',
          value: 'all',
        },
        {
          label: 'Incomplete: Frankenstein',
          value: 'f',
        },
      ],
      keyOptions: [
        {
          label: 'Keyword',
          value: 'KW',
        },
        {
          label: 'Record Set',
          value: 'BRS',
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
  created() {
    Object.keys(this.types).forEach((k) => {
      this.detailsColumns.push({
        name: this.types[k],
        label: this.types[k],
        field: k,
      });
      this.columns.push({
        name: this.types[k],
        label: this.types[k],
        field: k,
        type: 'fraction',
      });
      this.showOptions.push({
        label: `Incomplete: ${this.types[k]}`,
        value: k,
      });
    });
    this.api.collectionsGet()
      .then((r) => {
        const col = r.data.CollectionsRows;
        col.forEach((key) => {
          this.collections.push({
            label: key.Name,
            value: key.ID,
          });
        });
      });
  },
  methods: {
    log(r) {
      console.log(r);
    },
    showModal(row) {
      this.details = row;
      this.details.table = [];
      Object.keys(row.titles).forEach((r) => {
        this.details.table.push({
          title: r,
          1: row.titles[r][1],
          33: row.titles[r][33],
          36: row.titles[r][36],
          41: row.titles[r][41],
          52: row.titles[r][52],
        });
      });
      this.detailsOpen = true;
    },
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
      const querystring = `${this.key}=${this.term} AND (COL=${this.collection})`;
      this.api.bibSearch(querystring, offset, this.batch)
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
      else if (i < (this.store.length)) {
        i += 1;
        this.nvHandler(i);
      }
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
              `Processed ${i} of ${this.store.length - 1}...`,
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
      if (series && series.series_titles.length > 1) {
        // Check if we have seen this series before
        const ti = this.clean(series.full_title);
        const au = this.clean(item.author);

        let key = false;
        for (let k = 0; k < this.found.length; k += 1) {
          if (this.found[k].title === ti && this.found[k].author === au) {
            key = k;
            break;
          }
        }

        // If this is a new series, process it
        if (key === false) {
          const titles = {};
          // Push the parsed array to the finished data array
          const push = {
            title: ti,
            author: au,
            num: Object.keys(titles).length,
            titles,
            found: {
              f: 0,
            },
          };
          Object.keys(this.types).forEach((t) => {
            push.found[t] = 0;
          });
          const index = this.found.push(push);
          // Loop through titles in series
          Object.values(series.series_titles).forEach((title) => {
            if (this.method === 'hybrid') {
              const itemTi = this.clean(title.main_title);
              const query = `search/bibs/boolean?q=((AU=${au}) AND (TI=${itemTi})) OR ISBN=${title.primary_isbn}&bibsperpage=1000`;
              this.dispatchCount += 1;
              this.api.call(query)
                .then(r2 => this.confirmByHybrid(r2, index - 1, itemTi));
            }
            // Loop through manifestations of the title
            Object.values(title.manifestations).forEach((manifestation) => {
              // Add ISBN to done list so we don't have to check it again later
              this.done[manifestation.ISBN] = true;
            });
          });
        } else {
          // console.log(`duplicate found at key: ${key}`);
        }
      }
    },
    confirmByHybrid(r, index, title) {
      // Cancel if user aborted
      if (!this.status) return;
      // Init titles obj
      if (!this.found[index].titles[title]) this.found[index].titles[title] = {};
      // If some data found
      if (r.data.PAPIErrorCode > 0) {
        const rows = r.data.BibSearchRows;
        // For each returned row
        Object.keys(rows).forEach((k) => {
          // get the ToM
          const tom = rows[k].PrimaryTypeOfMaterial;
          // Init if not already an integer
          if (isNaN(parseInt(this.found[index].titles[title][tom], 10))) {
            this.found[index].titles[title][tom] = 0;
          }

          // Set ToM results # for the item to the SystemItemsTotal
          this.found[index].titles[title][tom] += rows[k].SystemItemsTotal;
          // Polaris API sometimes returns 0 for items that do have copies in overdrive
          // set '?' if this is the case
          if (this.found[index].titles[title][tom] === 0) this.found[index].titles[title][tom] = '?';
        });
      }
      // Update the num of each ToM
      this.found[index].num = Object.keys(this.found[index].titles).length;
      // Reset counts for the title
      Object.keys(this.types).forEach((t) => {
        this.found[index][t] = 0;
      });
      this.found[index].f = 0;
      // For each title in the series
      Object.keys(this.found[index].titles).forEach((t) => {
        let frank = false;
        // For each ToM of the title
        Object.keys(this.found[index].titles[t]).forEach((i) => {
          // If title has at least 1 item of this ToM, update count for ToM
          if (this.found[index].titles[t][i] > 0) {
            this.found[index][i] += 1;
            frank = true;
          }
          // If not in specified types, add to unknown list
          if (typeof (this.types[i]) === 'undefined') this.found[index][0] += 1;
        });
        if (frank) this.found[index].f += 1;
      });
      this.dispatchCount -= 1;
      if (!this.pending && this.dispatchCount === 0) this.finish();
    },
    trimISBN(str) {
      if (!str) return false;
      str = str.split(' ');
      str = str[0];
      str = str.replace(/[^0-9]/g, '');
      return str;
    },
    clean(str) {
      if (!str) return '';
      str = str.toUpperCase();
      str = str.replace(/AUTHOR/g, '');
      str = str.replace(/EDITOR/g, '');
      str = str.replace(/[^A-Z ]/g, '');
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
