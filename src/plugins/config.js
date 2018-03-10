const path = require('path');
const remote = require('electron').remote;
const { dialog } = require('electron').remote;

const fs = remote.require('fs');

const configPath = path.join(remote.app.getPath('userData'), '/.polaris-wrangler.json');

export default ({ Vue }) => {
  // Internal config store
  let config = {
    polarisUrl: '',
    polarisId: '',
    polarisKey: '',
    nvProfile: '',
    nvPassword: '',
    nvDelay: 50,
    nytKey: '',
  };

  // Loads a config file
  function load(loc) {
    // Init config from saved file, or create new config
    fs.readFile(loc, (err, data) => {
      if (err) {
        this.writeConfig(config);
      } else {
        const saved = JSON.parse(data.toString());
        Object.keys(config).forEach((key) => {
          config[key] = typeof (saved[key] !== 'undefined') ? saved[key] : config[key];
        });
      }
    });
  }

  // Writes a config file to disk
  function save(loc) {
    fs.writeFile(loc, JSON.stringify(config), (err) => {
      if (err) throw err;
    });
  }

  // Load config on startup
  load(configPath);

  // Create the public methods
  const pub = {
    get(param = null) {
      if (param) return config[param];
      return config;
    },
    set(params) {
      config = params;
      save(configPath);
    },
    import() {
      dialog.showOpenDialog({
        properties: [
          'openFile',
        ],
        filters: [
          { name: 'Configuration', extensions: ['json'] },
          { name: 'All Files', extensions: ['*'] },
        ],
      }, (filename) => {
        if (filename === undefined) return;
        load(filename[0]);
      });
    },
    export() {
      dialog.showSaveDialog({
        filters: [
          { name: 'Configuration', extensions: ['json'] },
          { name: 'All Files', extensions: ['*'] },
        ],
      }, (filename) => {
        // User cancelled save
        if (filename === undefined) return;
        // Write config to chosen location
        save(filename);
      });
    },
  };

  // Attach public object to Vue
  Vue.prototype.$config = pub;
};
