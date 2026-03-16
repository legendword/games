const mobileRoutes = [
    {
      path: '/',
      component: () => import('layouts/MobileLayout.vue'),
      children: [
        { path: '', component: () => import('pages/MobileIndex.vue'), meta: { showTabs: true } },
        { path: 'create', component: () => import('pages/MobileCreate.vue'), meta: { showTabs: true } },
        { path: 'landlord/:roomId', component: () => import('src/pages/games/LandLord.vue') }, //to be deleted
        { path: 'wordle+', component: () => import('src/pages/games/WordlePlus.vue') }
      ]
    },
  
    {
      path: '*',
      component: () => import('pages/Error404.vue')
    }
  ]
  
  export default mobileRoutes
  