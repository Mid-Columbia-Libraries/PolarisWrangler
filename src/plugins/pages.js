export default ({ Vue }) => {
  Vue.prototype.$pages = {

    Home: {
      name: 'Home',
      icon: 'home',
      desc: 'Back to where it all started.',
      path: '',
    },
    SeriesWrangler: {
      name: 'Series Wrangler',
      icon: 'more',
      desc: 'Find series missing items.',
      path: 'series-wrangler',
    },
    NytWrangler: {
      name: 'NYT Wrangler',
      icon: 'star',
      desc: 'Find missing bestsellers.',
      path: 'nyt-wrangler',
    },
    ApiWrangler: {
      name: 'API Wrangler',
      icon: 'code',
      desc: 'Test queries to the API.',
      path: 'api-wrangler',
    },
    OclcWrangler: {
      name: 'OCLC Wrangler',
      icon: 'assignment',
      desc: 'Generate new MARC records based on OCLC components.',
      path: 'oclc-wrangler',
    },
    Separator1: {
      name: 'separator',
    },
    Config: {
      name: 'Config',
      icon: 'settings',
      desc: 'Configure... things.',
      path: 'config',
    },
  };
};
