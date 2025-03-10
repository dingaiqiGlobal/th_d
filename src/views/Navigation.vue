<!-- 下面导航栏  -->
<template>
  <div class="nav-wrap" ref="scrollContainer" @mousewheel="MouseWheel">
    <div class="column-wrap" v-for="(item, index) in list" :key="index">
      <router-link :to="item.path">
        {{ item.text }}
        <img :src="item.img" alt="" />
      </router-link>
    </div>
  </div>
</template>

<script>
export default {
  components: {},

  data() {
    return {
      list: [
        {
          id: 1,
          img: "/images/nav/threeJS_base.jpg",
          text: "threeJS基础",
          path: "/",
        },
        {
          id: 1,
          img: "/images/nav/base/base_01_Scene_Camera_Renderer.jpg",
          text: "Scene_Camera_Renderer",
          path: "/base_01_Scene_Camera_Renderer",
        },
        {
          id: 1,
          img: "/images/nav/base/base_02_Mesh_Move.jpg",
          text: "Mesh_Move",
          path: "/base_02_Mesh_Move",
        },
        {
          id: 1,
          img: "/images/nav/base/base_03_Relative.jpg",
          text: "组概念",
          path: "/base_03_Relative",
        },
        {
          id: 1,
          img: "/images/nav/base/base_04_Raycaster.jpg",
          text: "raycaster拾取模型",
          path: "/base_04_Raycaster",
        },
        {
          id: 1,
          img: "/images/nav/base/base_05_group_traverse.jpg",
          text: "组遍历",
          path: "/base_05_group_traverse",
        },
        {
          id: 1,
          img: "/images/nav/base/base_07_viewHelper.jpg",
          text: "辅助工具",
          path: "/base_07_viewHelper",
        },
        {
          id: 1,
          img: "/images/nav/base/base_08_skybox.jpg",
          text: "天空盒",
          path: "/base_08_skybox",
        },
        {
          id: 1,
          img: "/images/nav/sceneCollection/scene_01_fog.jpg",
          text: "场景-雾化",
          path: "/scene_01_fog",
        },
        {
          id: 1,
          img: "/images/nav/cameraCollection/camera_01_base.jpg",
          text: "相机-基础",
          path: "/camera_01_base",
        },
        {
          id: 1,
          img: "/images/nav/controlsCollection/controls_01_modelView.jpg",
          text: "控制-模型视图",
          path: "/controls_01_modelView",
        },
        {
          id: 1,
          img: "/images/nav/controlsCollection/controls_02_transformControls.jpg",
          text: "控制-转换",
          path: "/controls_02_transformControls",
        },
        {
          id: 1,
          img: "/images/nav/controlsCollection/controls_03_transformControls_Box.jpg",
          text: "控制-转换box",
          path: "/controls_03_transformControls_Box",
        },
        {
          id: 1,
          img: "/images/nav/geometryCollection/geo_01_BufferGeometry.jpg",
          text: "geo_BufferGeometry",
          path: "/geo_01_BufferGeometry",
        },
        {
          id: 1,
          img: "/images/nav/geometryCollection/geo_02_Geojson.jpg",
          text: "geo_02_Geojson",
          path: "/geo_02_Geojson",
        },
        {
          id: 1,
          img: "/images/nav/geometryCollection/geo_03_billboard.jpg",
          text: "geo_03_billboard",
          path: "/geo_03_billboard",
        },
        {
          id: 1,
          img: "/images/nav/geometryCollection/geo_04_sprite.jpg",
          text: "geo_04_sprite",
          path: "/geo_04_sprite",
        },
        {
          id: 1,
          img: "/images/nav/geometryCollection/geo_05_cssRender.jpg",
          text: "geo_05_cssRender",
          path: "/geo_05_cssRender",
        },
        {
          id: 1,
          img: "/images/nav/mapCollection/map_01_3dtiles.jpg",
          text: "map_01_3dtiles",
          path: "/map_01_3dtiles",
        },
        {
          id: 1,
          img: "/images/nav/textureCollection/texture_01_SixSides.jpg",
          text: "贴图-六面",
          path: "/texture_01_SixSides",
        },
        {
          id: 1,
          img: "/images/nav/textureCollection/texture_02_repeat_offter_rotation.jpg",
          text: "贴图-重复偏移缩放",
          path: "/texture_02_repeat_offter_rotation",
        },
        {
          id: 1,
          img: "/images/nav/textureCollection/texture_03_panorama.jpg",
          text: "贴图-全景图",
          path: "/texture_03_panorama",
        },
        {
          id: 1,
          img: "/images/nav/textureCollection/texture_04_uv_animation.jpg",
          text: "贴图-uv动画",
          path: "/texture_04_uv_animation",
        },
        {
          id: 1,
          img: "/images/nav/materialCollection/material_01_Klein.jpg",
          text: "材质-克莱因瓶",
          path: "/material_01_Klein",
        },
        {
          id: 1,
          img: "/images/nav/materialCollection/material_02_WebGLRenderTarget.jpg",
          text: "材质-WebGLTarget",
          path: "/material_02_WebGLRenderTarget",
        },
        {
          id: 1,
          img: "/images/nav/lightCollection/light_01_base.jpg",
          text: "灯光-基础",
          path: "/light_01_base",
        },
        {
          id: 1,
          img: "/images/nav/lightCollection/light_02_model.jpg",
          text: "灯光-模型",
          path: "/light_02_model",
        },
        {
          id: 1,
          img: "/images/nav/modelCollection/model_gltfLoader.jpg",
          text: "模型-gltfLoader",
          path: "/model_gltfLoader",
        },
        {
          id: 1,
          img: "/images/nav/modelCollection/model_gltfLoadingManager.jpg",
          text: "模型-gltf加载进度",
          path: "/model_gltfLoadingManager",
        },
        {
          id: 1,
          img: "/images/nav/modelCollection/model_gltfAnimation.jpg",
          text: "模型-gltf动画",
          path: "/model_gltfAnimation",
        },
        {
          id: 1,
          img: "/images/nav/animateCollection/animate_01_gsap.jpg",
          text: "动画-gsap",
          path: "/animate_01_gsap",
        },
        {
          id: 1,
          img: "/images/nav/animateCollection/animate_02_gsap_mesh.jpg",
          text: "动画-gsap-mesh",
          path: "/animate_02_gsap_mesh",
        },
        {
          id: 1,
          img: "/images/nav/animateCollection/animate_03_curve.jpg",
          text: "动画-曲线",
          path: "/animate_03_curve",
        },
        {
          id: 1,
          img: "/images/nav/animateCollection/animate_04_camera.jpg",
          text: "动画-相机动画",
          path: "/animate_04_camera",
        },
        {
          id: 1,
          img: "/images/nav/animateCollection/animate_05_mesh.jpg",
          text: "动画-mesh动画",
          path: "/animate_05_mesh",
        },
        {
          id: 1,
          img: "/images/nav/shaderCollection/shader_01_ocean.jpg",
          text: "shader-海洋",
          path: "/shader_01_ocean",
        },
        {
          id: 1,
          img: "/images/nav/postprocessCollection/post_01_outlinePass.jpg",
          text: "后处理-轮廓",
          path: "/post_01_outlinePass",
        },
        {
          id: 1,
          img: "/images/nav/postprocessCollection/post_02_glow.jpg",
          text: "后处理-辉光",
          path: "/post_02_glow",
        },
        {
          id: 1,
          img: "/images/nav/postprocessCollection/post_03_shader_mask.jpg",
          text: "后处理-遮罩通道",
          path: "/post_03_shader_mask",
        },
        {
          id: 1,
          img: "/images/nav/postprocessCollection/post_04_ghost.jpg",
          text: "后处理-残影",
          path: "/post_04_ghost",
        },
        {
          id: 1,
          img: "/images/nav/postprocessCollection/post_05_UV.jpg",
          text: "后处理-UV图像变换",
          path: "/post_05_UV",
        },
        {
          id: 1,
          img: "/images/nav/postprocessCollection/post_06_saturation.jpg",
          text: "后处理-饱和度",
          path: "/post_06_saturation",
        },
      ],
    };
  },

  computed: {},

  mounted() {},

  methods: {
    //鼠标滚轮上下滑动时div左右滑动
    MouseWheel(e) {
      let eventDelta = -e.wheelDelta || -e.deltaY * 40;
      let $scrollWrapper = this.$refs.scrollContainer;
      // console.log($scrollWrapper.scrollLeft)
      // 0到scrollLeft为滚动区域隐藏部分
      $scrollWrapper.scrollLeft = $scrollWrapper.scrollLeft + eventDelta / 4;
    },
  },
};
</script>
<style lang="less" scoped>
.nav-wrap {
  text-align: left;
  overflow: auto;
  white-space: nowrap;

  .column-wrap {
    font-size: 16px;
    display: inline-block;
    text-align: center;
    width: 170px;
    height: 130px;
    margin-top: 4px;
    margin-left: 10px;
    border: 1px solid #759dc0;
    padding: 2px 4px 4px 4px;
    background-color: #bcd8f4;
    background-image: linear-gradient(
      #ffffff 0px,
      rgba(255, 255, 255, 0) 3px,
      rgba(255, 255, 255, 0.75) 100%
    );
    box-sizing: content-box;
    border-radius: 4px;
    cursor: pointer;

    &:hover {
      background-color: #86bdf2;
    }

    img {
      width: 150px;
      margin: 5px auto;
      height: 100px;
      display: block;
    }
  }

  /*包含以下四种的链接*/
  a {
    color: #000;
  }

  /*正常的未被访问过的链接*/
  a:link {
    text-decoration: none;
  }

  /*已经访问过的链接*/
  a:visited {
    text-decoration: none;
  }

  /*鼠标划过(停留)的链接*/
  a:hover {
    text-decoration: none;
  }

  /* 正在点击的链接*/
  a:active {
    text-decoration: none;
  }
}
</style>
