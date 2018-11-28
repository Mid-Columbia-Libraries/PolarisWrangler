const remote = require('electron').remote;
const { dialog } = require('electron').remote;
const marc = require('marc4js');

const fs = remote.require('fs');
// const path = require('path');
// const local = remote.app.getPath('userData');

export default ({ Vue }) => {
  // Loads a marc file
  function read(loc, callback) {
    // try reading file
    fs.readFile(loc, (err, data) => {
      if (err) {
        // return error code
        callback(err);
      }

      // return marc text string
      /**
       *
       * NEED TO PATCH MARC4JS TO ALLOW WEBPACK IMPORTS
       * - CHANGE DYNAMIC IMPORTER IN parse.js to a static importer
       *
       */
      marc.parse(data, null, (e, records) => {
        if (e) {
          callback(e);
        }
        Object.keys(records).forEach((k) => {
          records[k].id = k;
        });
        callback(records);
      });

      return true;
    });
  }

  // Writes a config file to disk
  function write(loc) {
    fs.writeFile(loc, 'test', (err) => {
      if (err) throw err;
    });
  }

  // Create the public methods
  const pub = {
    write() {
      dialog.showSaveDialog({
        filters: [
          { name: 'MARC', extensions: ['mrc'] },
          { name: 'All Files', extensions: ['*'] },
        ],
      }, (filename) => {
        // User cancelled save
        if (filename === undefined) return;
        // Write config to chosen location
        write(filename);
      });
    },
    read(callback) {
      dialog.showOpenDialog({
        properties: [
          'openFile',
        ],
        filters: [
          { name: 'MARC', extensions: ['mrc'] },
          { name: 'All Files', extensions: ['*'] },
        ],
      }, (filename) => {
        if (filename === undefined) return false;
        read(filename[0], callback);
        return true;
      });
    },
    marc,
  };

  // Attach public object to Vue
  Vue.prototype.$marc = pub;
};
