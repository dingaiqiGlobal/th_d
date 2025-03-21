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
    path: "/base_07_viewHelper",
    name: "base_07_viewHelper",
    component: () => import("../components/base/base_07_viewHelper.vue"),
  },
  {
    path: "/base_08_skybox",
    name: "base_08_skybox",
    component: () => import("../components/base/base_08_skybox.vue"),
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
    path: "/controls_01_modelView",
    name: "controls_01_modelView",
    component: () =>
      import("../components/controlsCollection/controls_01_modelView.vue"),
  },
  {
    path: "/controls_02_transformControls",
    name: "controls_02_transformControls",
    component: () =>
      import(
        "../components/controlsCollection/controls_02_transformControls.vue"
      ),
  },
  {
    path: "/controls_03_transformControls_Box",
    name: "controls_03_transformControls_Box",
    component: () =>
      import(
        "../components/controlsCollection/controls_03_transformControls_Box.vue"
      ),
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
    path: "/geo_03_billboard",
    name: "/geo_03_billboard",
    component: () =>
      import("../components/geometryCollection/geo_03_billboard.vue"),
  },
  {
    path: "/geo_04_sprite",
    name: "/geo_04_sprite",
    component: () =>
      import("../components/geometryCollection/geo_04_sprite.vue"),
  },
  {
    path: "/geo_05_cssRender",
    name: "/geo_05_cssRender",
    component: () =>
      import("../components/geometryCollection/geo_05_cssRender.vue"),
  },
  {
    path: "/map_01_3dtiles",
    name: "/map_01_3dtiles",
    component: () => import("../components/mapCollection/map_01_3dtiles.vue"),
  },
  {
    path: "/map_02_3dmap",
    name: "/map_02_3dmap",
    component: () => import("../components/mapCollection/map_02_3dmap.vue"),
  },
  {
    path: "/map_03_3dmap2",
    name: "/map_03_3dmap2",
    component: () => import("../components/mapCollection/map_03_3dmap2.vue"),
  },
  {
    path: "/map_04_geoBound",
    name: "/map_04_geoBound",
    component: () => import("../components/mapCollection/map_04_geoBound.vue"),
  },
  {
    path: "/map_05_heatmap",
    name: "/map_05_heatmap",
    component: () => import("../components/mapCollection/map_05_heatmap.vue"),
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
    path: "/material_02_WebGLRenderTarget",
    name: "material_02_WebGLRenderTarget",
    component: () =>
      import(
        "../components/materialCollection/material_02_WebGLRenderTarget.vue"
      ),
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
    path: "/animate_01_gsap",
    name: "animate_01_gsap",
    component: () => import("../components/animateCollection/animate_01_gsap"),
  },
  {
    path: "/animate_02_gsap_mesh",
    name: "animate_02_gsap_mesh",
    component: () =>
      import("../components/animateCollection/animate_02_gsap_mesh"),
  },
  {
    path: "/animate_03_curve",
    name: "animate_03_curve",
    component: () => import("../components/animateCollection/animate_03_curve"),
  },
  {
    path: "/animate_04_camera",
    name: "animate_04_camera",
    component: () =>
      import("../components/animateCollection/animate_04_camera"),
  },
  {
    path: "/animate_05_mesh",
    name: "animate_05_mesh",
    component: () => import("../components/animateCollection/animate_05_mesh"),
  },
  {
    path: "/animate_06_clippingPlanes",
    name: "animate_06_clippingPlanes",
    component: () =>
      import("../components/animateCollection/animate_06_clippingPlanes"),
  },
  {
    path: "/animate_07_viewThreeClick",
    name: "animate_07_viewThreeClick",
    component: () =>
      import("../components/animateCollection/animate_07_viewThreeClick"),
  },
  {
    path: "/animate_08_viewThreeKey",
    name: "animate_08_viewThreeKey",
    component: () =>
      import("../components/animateCollection/animate_08_viewThreeKey"),
  },
  {
    path: "/animate_09_viewFirst",
    name: "animate_09_viewFirst",
    component: () =>
      import("../components/animateCollection/animate_09_viewFirst"),
  },
  {
    path: "/shader_01_ocean",
    name: "shader_01_ocean",
    component: () =>
      import("../components/shaderCollection/shader_01_ocean.vue"),
  },
  {
    path: "/shader_02_cityLight",
    name: "shader_02_cityLight",
    component: () =>
      import("../components/shaderCollection/shader_02_cityLight.vue"),
  },
  {
    path: "/particles_01_MeshSurfaceSampler",
    name: "particles_01_MeshSurfaceSampler",
    component: () =>
      import(
        "../components/particlesCollection/particles_01_MeshSurfaceSampler.vue"
      ),
  },
  {
    path: "/particles_02_snow",
    name: "particles_02_snow",
    component: () =>
      import("../components/particlesCollection/particles_02_snow.vue"),
  },
  {
    path: "/particles_03_bubble",
    name: "particles_03_bubble",
    component: () =>
      import("../components/particlesCollection/particles_03_bubble.vue"),
  },
  {
    path: "/particles_04_snow2",
    name: "particles_04_snow2",
    component: () =>
      import("../components/particlesCollection/particles_04_snow2.vue"),
  },
  {
    path: "/particles_05_wave",
    name: "particles_05_wave",
    component: () =>
      import("../components/particlesCollection/particles_05_wave.vue"),
  },
  {
    path: "/particles_06_fireworks",
    name: "particles_06_fireworks",
    component: () =>
      import("../components/particlesCollection/particles_06_fireworks.vue"),
  },
  {
    path: "/post_01_outlinePass",
    name: "post_01_outlinePass",
    component: () =>
      import("../components/postprocessCollection/post_01_outlinePass.vue"),
  },
  {
    path: "/post_02_glow",
    name: "post_02_glow",
    component: () =>
      import("../components/postprocessCollection/post_02_glow.vue"),
  },
  {
    path: "/post_03_shader_mask",
    name: "post_03_shader_mask",
    component: () =>
      import("../components/postprocessCollection/post_03_shader_mask.vue"),
  },
  {
    path: "/post_04_ghost",
    name: "post_04_ghost",
    component: () =>
      import("../components/postprocessCollection/post_04_ghost.vue"),
  },
  {
    path: "/post_05_UV",
    name: "post_05_UV",
    component: () =>
      import("../components/postprocessCollection/post_05_UV.vue"),
  },
  {
    path: "/post_06_saturation",
    name: "post_06_saturation",
    component: () =>
      import("../components/postprocessCollection/post_06_saturation.vue"),
  },
  {
    path: "/physics_01_cannon",
    name: "physics_01_cannon",
    component: () =>
      import("../components/physicsCollection/physics_01_cannon.vue"),
  },
  {
    path: "/physics_02_ammo",
    name: "physics_02_ammo",
    component: () =>
      import("../components/physicsCollection/physics_02_ammo.vue"),
  },
];

const router = new VueRouter({
  routes,
});

export default router;
