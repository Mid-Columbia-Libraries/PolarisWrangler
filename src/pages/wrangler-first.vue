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
        @keyup.enter="wrangle"
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
        class="bg-white text-dark full-width primary-results"
        color="black"
        dense
        :loading="status"
        :data="found"
        :columns="columns"
        :pagination.sync="paginationControl"
        row-key="name"
      >
        <q-tr class="series-row" @click.native="showModal(props.row)"
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
            <span class="q-body-1" v-else-if="props.cols[i].type === 'missing'">
              <span v-if="col.value > 0">-{{ col.value }}</span>
              <span v-else><q-icon name="check" /></span>
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
          dense
          class="full-width"
          color="black"
          :data="details.table"
          :columns="detailsColumns"
          :pagination.sync="detailsPaginationControl"
          row-key="name"
        >
          <q-td slot="body-cell-Title" slot-scope="props" :props="props">
            <q-btn flat @click.native="shell.openExternal(
              `https://${$config.get('polarisUrl')}/polaris/search/searchresults.aspx?ctx=1.1033.0.0.6&type=Advanced&term=${props.row.author}&relation=ALL&by=AU&term2=${props.row.title}&by2=TI`
            )">
              {{ props.row.title }}
            </q-btn>
          </q-td>
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

// AJAX Library
const axios = require('axios');
const { shell } = require('electron');

export default {
  data() {
    return {
      shell,
      // Status message
      report: 'You haven\'t done anything yet. Good job.',
      // Whether a search is in progress or not
      status: false,
      // Percent bar
      statusPct: 0,
      // Current search token used to invalidate stale XHR
      token: '',
      // Currently entered search term
      term: 'tolkien',
      // Currently selected 'Collections' option
      collection: '*',
      // List of options for 'Collections' selector
      collections: [
        {
          label: 'All',
          value: '*',
        },
      ],
      // Currently selected 'Show' option
      show: 'all',
      // List of options for 'Show' selector
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
      // Currently selected 'Key' option
      key: 'KW',
      // List of optins for 'Key' selector
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
      // # requests to batch at once
      batch: 1000,
      // Confirmation method
      method: 'hybrid',
      // Keep track of pending AJAX requests
      dispatchCount: 0,
      // Signals whether initial lookups have completed
      pending: false,
      // Storage for details popup window data
      details: {},
      // Controls details modal open/close
      detailsOpen: false,
      // Valid format types list
      types: {
        1: {
          name: 'Book',
          enable: true,
        },
        33: {
          name: 'Film',
          enable: false,
        },
        36: {
          name: 'eBook',
          enable: true,
        },
        41: {
          name: 'eAudio',
          enable: true,
        },
        52: {
          name: 'AudioCD',
          enable: true,
        },
        999: {
          name: 'Unknown',
          enable: false,
        },
      },
      // List search results returned from initial polaris search
      store: [],
      // Master storage for confirmed results
      found: [],
      // List of ISBNs already checked
      done: {},
      // Pagination controller for main table
      detailsPaginationControl: {
        rowsPerPage: 10,
      },
      // Table Column config for detail modal
      detailsColumns: [
        {
          name: 'Title',
          label: 'Title',
          field: 'title',
        },
      ],
      // Pagination controller for main table
      paginationControl: {
        rowsPerPage: 50,
      },
      // Table Columns config for main display table
      columns: [
        {
          name: 'title',
          label: 'Series',
          field: 'title',
          required: true,
          sortable: true,
        },
        {
          name: 'author',
          label: 'Author',
          field: 'author',
          sortable: true,
        },
        {
          name: 'num',
          label: '#',
          field: 'num',
          sortable: true,
        },
        {
          name: 'frankenstein',
          label: 'Frankenstein',
          field: 'f',
          type: 'fraction',
          sortable: true,
        },
        {
          name: 'frankenstein_missing',
          label: '-',
          field: 'fm',
          type: 'missing',
          sortable: true,
        },
      ],
      // Polaris API controller object
      api: this.$jsPAPI({
        server: this.$config.get('polarisUrl'),
        accessid: this.$config.get('polarisId'),
        key: this.$config.get('polarisKey'),
      }),
    };
  },
  created() {
    // Add enabled ToMs to selection & table controllers
    Object.keys(this.types).forEach((k) => {
      if (this.types[k].enable === true) {
        this.detailsColumns.push({
          name: this.types[k].name,
          label: this.types[k].name,
          field: k,
        });
        this.columns.push({
          name: this.types[k].name,
          label: this.types[k].name,
          field: k,
          type: 'fraction',
          sortable: true,
        },
        {
          name: `${this.types[k].name}_missing`,
          label: '-',
          field: `${k}m`,
          type: 'missing',
          sortable: true,
        });
        this.showOptions.push({
          label: `Incomplete: ${this.types[k].name}`,
          value: k,
        });
      }
    });
    // Add collections from PAC to selection
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
    // Dump output to log
    log(r) {
      console.log(r);
    },
    // Shows a modal of the results for the selected row
    showModal(row) {
      this.details = row;
      this.details.table = [];
      Object.keys(row.titles).forEach((r) => {
        this.details.table.push({
          title: r,
          author: row.author,
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
      this.token = `${Date.now()}${(1 + Math.random()).toString(36).substr(7)}`;
      this.status = true;
      this.store = [];
      this.done = {};
      this.found = [];
      this.pending = true;
      // Bind context and make initial call to recursive lookup
      this.getPacResults.bind(this)(1, this.token);
    },

    // React when abort button is clicked
    abort() {
      this.cancel('Search aborted.');
    },

    // Stop execution with a status message
    cancel(msg) {
      this.token = '';
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
      this.token = '';
      this.statusPct = 0;
      this.report = 'Good job. You did it.';
    },

    // Begins chain, gets initial pac results
    getPacResults(offset = 1, token) {
      // If process was aborted, stop execution
      if (token !== this.token) return;

      // Perform the search
      const querystring = `${this.key}=${this.term} AND (COL=${this.collection})`;
      this.api.bibSearch(querystring, offset, this.batch)
        // Wait for response from Polaris
        .then((r) => { this.handleBibSearch(r, offset, token); })
        .catch(() => { this.cancel('Oops. There was a network problem connecting to Polaris.'); });
    },

    handleBibSearch(r, offset, token) {
      // User aborted
      if (token !== this.token) return;
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
        this.getPacResults(offset, token);
        return;
      }
      // Else, we are done, append final results & send to nvHandler()
      this.store = this.store.concat(r.data.BibSearchRows);
      this.progress(50, `Retrieved ${r.data.TotalRecordsFound} records, processing...`);

      this.nvHandler(0, token);
    },

    // Checks if item is a new ISBN and dispatches NV request
    nvHandler(i, token) {
      // If process was aborted, stop execution
      if (token !== this.token) return;
      // Clean up ISBN
      const isbn = this.trimISBN(this.store[i].ISBN);
      // If item returned a valid ISBN && is a new ISBN, send to NoveList
      if (isbn && typeof (this.done[isbn]) === 'undefined') {
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
          .then((r) => { this.handleNvItem(r, i, isbn, token); })
          .catch(() => { this.cancel('Oops. There was a network problem connecting to NoveList'); });
      }
      // Otherwise continue to next item
      else if (i < (this.store.length)) {
        i += 1;
        this.nvHandler(i, token);
      }
      else {
        this.pending = false;
      }
    },

    // Handle callback from NV lookup
    handleNvItem(r, i, isbn, token) {
      if (token !== this.token) return;
      // Dispatch handler to verify results with PAC
      this.extractResults(r, token);
      // Increment and check if we need to continue
      i += 1;
      if (i < (this.store.length)) {
        // Update progress bar
        this.progress(
          ((i / this.store.length) * 50) + 50,
          `Processed ${i} of ${this.store.length - 1}...`,
        );
        this.nvHandler(i, token);
      } else {
        this.pending = false;
      }
    },

    // Handle the callback from the NV lookup
    extractResults(r, token) {
      // If process was aborted, stop execution
      if (token !== this.token) return;
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
          // Push an initialized array for the finished object
          const push = {
            title: ti,
            author: au,
            num: Object.keys(titles).length,
            titles,
            found: {
              f: 0,
            },
          };
          // Set found # of each type to 0
          Object.keys(this.types).forEach((t) => {
            push.found[t] = 0;
          });
          // Store index of pushed object
          const index = this.found.push(push);
          // Loop through titles in series
          Object.values(series.series_titles).forEach((title) => {
            if (this.method === 'hybrid') {
              const itemTi = this.clean(title.main_title);
              // Generate query to send to pac
              const query = `search/bibs/boolean?q=((AU=${au}) AND (TI=${itemTi})) OR ISBN=${title.primary_isbn}&bibsperpage=1000`;
              // Dispatch verification to PAC
              this.dispatchCount += 1;
              this.api.call(query)
                .then(r2 => this.confirmByHybrid(r2, index - 1, itemTi, token));
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

    // Handle the callback from the PAC verification step
    confirmByHybrid(r, index, title, token) {
      // Cancel if user aborted
      if (token !== this.token) return;
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
        this.found[index][`${t}m`] = 0;
      });
      this.found[index].f = 0;
      // For each title in the series
      Object.keys(this.found[index].titles).forEach((t) => {
        let frank = false;
        // For each ToM of the title
        Object.keys(this.found[index].titles[t]).forEach((i) => {
          // If title has at least 1 item of this ToM, update count for ToM
          if (this.types[i].enable === true) {
            if (this.found[index].titles[t][i] > 0) {
              this.found[index][i] += 1;
              frank = true;
            }
          }
          // If not in specified types, add to unknown list
          if (typeof (this.types[i]) === 'undefined') this.found[index][999] += 1;
        });
        if (frank) this.found[index].f += 1;
      });
      Object.keys(this.types).forEach((k) => {
        this.found[index][`${k}m`] = this.found[index].num - this.found[index][k];
      });
      this.found[index].fm = this.found[index].num - this.found[index].f;
      this.dispatchCount -= 1;
      if (!this.pending && this.dispatchCount === 0) this.finish();
    },

    // Removes whitespace and extra details PAC liked to add to ISBNs
    trimISBN(str) {
      if (!str) return false;
      str = str.split(' ');
      str = str[0];
      str = str.replace(/[^0-9]/g, '');
      return str;
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
};
</script>

<style lang="stylus">
@import '~variables'
  .status
    margin-top: -24px
    margin-bottom: 24px
    z-index: 100
  .series-row
    cursor: pointer
  .modal
    .q-table-dense .q-table th,
    .q-table-dense .q-table td
      padding: 4px 20px
  .primary-results.q-table-dense .q-table th,
  .primary-results.q-table-dense .q-table td
    padding: 4px 0
  .primary-results.q-table-dense .q-table th:last-child,
  .primary-results.q-table-dense .q-table td:last-child
    padding-right: 10px
</style>
