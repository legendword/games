
const routes = [
  {
    path: '/',
    component: () => import('layouts/MainLayout.vue'),
    children: [
      { path: '', component: () => import('pages/Index.vue') },
      { path: 'sp', component: () => import('pages/Singleplayer.vue') },
      { path: 'mp', component: () => import('pages/Multiplayer.vue') },
      { path: 'landlord/:roomId', component: () => import('pages/games/LandLord.vue') },
      { path: 'chess/:roomId', component: () => import('pages/games/Chess.vue') },
      { path: 'wordle+', component: () => import('pages/games/WordlePlus.vue') },
      { path: '2048', component: () => import('pages/games/2048.vue') },
      { path: 'testing', component: () => import('pages/Testing.vue') },
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
