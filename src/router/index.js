import Vue from 'vue'
import VueRouter from 'vue-router'

Vue.use(VueRouter)

const routes = [
  {
    path: '/',
    name: 'threeJS_base',
    component: () => import("../components/threeJS_base.vue")
  }
]

const router = new VueRouter({
  routes
})

export default router
