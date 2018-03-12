
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

  { // Always leave this as last one
    path: '*',
    component: () => import('pages/404'),
  },
];
