import Vue from 'vue'
import VueRouter from 'vue-router'

import routes from './routes'
import mobileRoutes from './mobileRoutes'
import { Platform } from 'quasar'

Vue.use(VueRouter)

/*
 * If not building with SSR mode, you can
 * directly export the Router instantiation;
 *
 * The function below can be async too; either use
 * async/await or return a Promise which resolves
 * with the Router instance.
 */

export default function (/* { store, ssrContext } */) {
  console.log(Platform.is)
  const Router = new VueRouter({
    scrollBehavior: () => ({ x: 0, y: 0 }),
    routes: routes, // ! temporarily disabled mobileRoutes until the mobile pages are updated to v2.0 layout
    // routes: Platform.is.mobile ? mobileRoutes : routes, //todo: change to Platform.is.capacitor later

    // Leave these as they are and change in quasar.conf.js instead!
    // quasar.conf.js -> build -> vueRouterMode
    // quasar.conf.js -> build -> publicPath
    mode: process.env.VUE_ROUTER_MODE,
    base: process.env.VUE_ROUTER_BASE
  })

  return Router
}
