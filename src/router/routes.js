
export default [
  {
    path: '/',
    component: () => import('layouts/default'),
    children: [
      { path: '', component: () => import('pages/index') },
    ],
  },

  {
    path: '/config',
    component: () => import('layouts/default'),
    children: [
      { path: '', component: () => import('pages/config') },
    ],
  },

  {
    path: '/series-wrangler',
    component: () => import('layouts/default'),
    children: [
      { path: '', component: () => import('pages/wrangler-series') },
    ],
  },

  {
    path: '/first-wrangler',
    component: () => import('layouts/default'),
    children: [
      { path: '', component: () => import('pages/wrangler-first') },
    ],
  },

  {
    path: '/nyt-wrangler',
    component: () => import('layouts/default'),
    children: [
      { path: '', component: () => import('pages/wrangler-nyt') },
    ],
  },

  {
    path: '/api-wrangler',
    component: () => import('layouts/default'),
    children: [
      { path: '', component: () => import('pages/wrangler-api') },
    ],
  },

  {
    path: '/oclc-wrangler',
    component: () => import('layouts/default'),
    children: [
      { path: '', component: () => import('pages/wrangler-oclc') },
    ],
  },

  { // Always leave this as last one
    path: '*',
    component: () => import('pages/404'),
  },
];
