
const routes = [
  {
    path: '/',
    component: () => import('layouts/MainLayout.vue'),
    children: [
      { path: '', component: () => import('pages/Index.vue') },
      { path: 'sp', component: () => import('pages/Singleplayer.vue') },
      { path: 'mp', component: () => import('pages/Multiplayer.vue') },
      { path: 'landlord/:roomId', component: () => import('pages/games/LandLord.vue') },
      { path: 'wordle+', component: () => import('pages/games/WordlePlus.vue') }
    ]
  },

  // Always leave this as last one,
  // but you can also remove it
  {
    path: '*',
    component: () => import('pages/Error404.vue')
  }
]

export default routes
