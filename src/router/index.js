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
    path: "/base_04_Raycaster",
    name: "base_04_Raycaster",
    component: () => import("../components/base/base_04_Raycaster.vue"),
  },
  {
    path: "/base_05_group_traverse",
    name: "base_05_group_traverse",
    component: () => import("../components/base/base_05_group_traverse.vue"),
  },
  {
    path: "/scene_01_fog",
    name: "scene_01_fog",
    component: () => import("../components/sceneCollection/scene_01_fog.vue"),
  },
  {
    path: "/camera_01_base",
    name: "camera_01_base",
    component: () =>
      import("../components/cameraCollection/camera_01_base.vue"),
  },
  {
    path: "/geo_01_BufferGeometry",
    name: "geo_01_BufferGeometry",
    component: () =>
      import("../components/geometryCollection/geo_01_BufferGeometry.vue"),
  },
  {
    path: "/geo_02_Geojson",
    name: "/geo_02_Geojson",
    component: () =>
      import("../components/geometryCollection/geo_02_Geojson.vue"),
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
  {
    path: "/texture_03_panorama",
    name: "texture_03_panorama",
    component: () =>
      import("../components/textureCollection/texture_03_panorama.vue"),
  },
  {
    path: "/texture_04_uv_animation",
    name: "texture_04_uv_animation",
    component: () =>
      import("../components/textureCollection/texture_04_uv_animation.vue"),
  },
  {
    path: "/material_01_Klein",
    name: "material_01_Klein",
    component: () =>
      import("../components/materialCollection/material_01_Klein.vue"),
  },
  {
    path: "/light_01_base",
    name: "light_01_base",
    component: () => import("../components/lightCollection/light_01_base.vue"),
  },
  {
    path: "/light_02_model",
    name: "light_02_model",
    component: () => import("../components/lightCollection/light_02_model.vue"),
  },
  {
    path: "/model_gltfLoader",
    name: "model_gltfLoader",
    component: () =>
      import("../components/modelCollection/model_gltfLoader.vue"),
  },
  {
    path: "/model_gltfLoadingManager",
    name: "model_gltfLoadingManager",
    component: () =>
      import("../components/modelCollection/model_gltfLoadingManager.vue"),
  },
  {
    path: "/model_gltfAnimation",
    name: "model_gltfAnimation",
    component: () =>
      import("../components/modelCollection/model_gltfAnimation.vue"),
  },
  {
    path: "/shader_01_ocean",
    name: "shader_01_ocean",
    component: () =>
      import("../components/shaderCollection/shader_01_ocean.vue"),
  },
  {
    path: "/effect_01_outlinePass",
    name: "effect_01_outlinePass",
    component: () =>
      import("../components/effectCollection/effect_01_outlinePass.vue"),
  },
];

const router = new VueRouter({
  routes,
});

export default router;
