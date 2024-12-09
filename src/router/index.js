import Vue from 'vue'
import VueRouter from 'vue-router'

Vue.use(VueRouter)

const routes = [
  {
    path: '/',
    name: 'threeJS_base',
    component: () => import("../components/threeJS_base.vue")
  },
  {
    path: '/base_01_Scene_Camera_Renderer',
    name: 'base_01_Scene_Camera_Renderer',
    component: () => import("../components/base/base_01_Scene_Camera_Renderer.vue")
  }
]

const router = new VueRouter({
  routes
})

export default router
