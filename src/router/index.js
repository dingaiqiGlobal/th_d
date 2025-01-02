import Vue from "vue";
import VueRouter from "vue-router";

Vue.use(VueRouter);

const routes = [
  {
    path: "/",
    name: "threeJS_base",
    component: () => import("../components/threeJS_base.vue"),
  },
  {
    path: "/base_01_Scene_Camera_Renderer",
    name: "base_01_Scene_Camera_Renderer",
    component: () =>
      import("../components/base/base_01_Scene_Camera_Renderer.vue"),
  },
  {
    path: "/base_02_Mesh_Move",
    name: "base_02_Mesh_Move",
    component: () => import("../components/base/base_02_Mesh_Move.vue"),
  },
  {
    path: "/base_03_Relative",
    name: "base_03_Relative",
    component: () => import("../components/base/base_03_Relative.vue"),
  },
  {
    path: "/texture_01_SixSides",
    name: "texture_01_SixSides",
    component: () =>
      import("../components/textureCollection/texture_01_SixSides.vue"),
  },
  {
    path: "/texture_02_repeat_offter_rotation",
    name: "texture_02_repeat_offter_rotation",
    component: () =>
      import(
        "../components/textureCollection/texture_02_repeat_offter_rotation.vue"
      ),
  },
];

const router = new VueRouter({
  routes,
});

export default router;
