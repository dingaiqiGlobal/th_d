<template>
  <div class="box" ref="box">
    <div class="control" ref="control"></div>
  </div>
</template>

<script>
import * as THREE from "three";
import { OrbitControls } from "three/addons/controls/OrbitControls.js";
import Stats from "three/addons/libs/stats.module.js";

import { GLTFLoader } from "three/addons/loaders/GLTFLoader.js";
import { DRACOLoader } from "three/addons/loaders/DRACOLoader.js";

export default {
  name: "Base",
  data() {
    return {
      scene: null,
      camera: null,
      renderer: null,
      controls: null,
      lightGroup: null,
      stats: null,
      loadingDiv: null,
    };
  },
  mounted() {
    this.init();
  },
  methods: {
    init() {
      //场景
      this.scene = this.createScene();
      //摄像机
      this.camera = this.createCamera();
      this.scene.add(this.camera);
      //坐标辅助
      const axesHelper = this.createAxesHelper();
      this.scene.add(axesHelper);
      //光源
      this.lightGroup = this.createLight();
      this.scene.add(this.lightGroup);
      //模型
      this.createModel();
      //渲染器
      this.renderer = this.createRenderer();
      //控制器
      this.controls = this.createControls();
      //帧率
      this.createStats();
      //窗口变化
      this.changeWindow();
      //循环渲染
      this.animate();
    },
    createScene() {
      const scene = new THREE.Scene();
      return scene;
    },
    createCamera() {
      let camera = new THREE.PerspectiveCamera(
        75,
        this.$refs.box.clientWidth / this.$refs.box.clientHeight,
        0.1,
        1000
      );
      camera.position.set(0, 400, 400);
      camera.lookAt(0, 0, 0);
      return camera;
    },
    createAxesHelper() {
      const axesHelper = new THREE.AxesHelper(5);
      return axesHelper;
    },
    createLight() {
      const lightGroup = new THREE.Group();
      let ambientLight = new THREE.AmbientLight(0xffffff, 3);
      lightGroup.add(ambientLight);

      let pointLight = new THREE.PointLight(0xffffff, 1, 0);
      pointLight.position.set(-10, 6, 10);

      lightGroup.add(pointLight);
      return lightGroup;
    },
    createModel() {
      /**
       * 加载管理器
       */
      this.loadingDiv = this.$refs.control;
      const manager = new THREE.LoadingManager();
      manager.onStart = (url, itemsLoaded, itemsTotal) => {
        this.loadingDiv.innerText = "开始加载";
      };
      manager.onLoad = () => {
        this.loadingDiv.innerHTML = "加载完成";
        // this.loadingDiv.style.display = "none";
      };
      manager.onProgress = (url, itemsLoaded, itemsTotal) => {
        this.loadingDiv.innerText =
          "导入" + ((itemsLoaded / itemsTotal) * 100).toFixed(2) + "%";
      };
      manager.onError = (url) => {};

      const loader = new GLTFLoader(manager);
      //一个用于加载经过Draco压缩的图形库
      loader.setDRACOLoader(
        new DRACOLoader().setDecoderPath(
          `https://z2586300277.github.io/3d-file-server/` + "js/three/draco/"
        )
      );
      loader.load(
        //地址得获取时间，要不拿不到total
        //"data/model/LittlestTokyo.glb?time=" + new Date().getTime(),
        `https://z2586300277.github.io/3d-file-server/` +
          "/files/model/LittlestTokyo.glb?time=" +
          new Date().getTime(),
        (gltf) => {
          this.scene.add(gltf.scene);
        },
        (ProgressEvent) => {
          console.log(ProgressEvent);
          //进展事件
          this.loadingDiv.innerText =
            "下载" +
            ((ProgressEvent.loaded / ProgressEvent.total) * 100).toFixed(2) +
            "%";
        },
        (error) => {
          console.log(error);
        }
      );
    },
    createRenderer() {
      const box = this.$refs.box;
      const renderer = new THREE.WebGLRenderer();
      renderer.antialias = true; //抗锯齿
      renderer.setSize(box.clientWidth, box.clientHeight);
      box.appendChild(renderer.domElement);
      return renderer;
    },
    createControls() {
      const controls = new OrbitControls(this.camera, this.renderer.domElement);
      controls.enableDamping = true;
      return controls;
    },
    createStats() {
      this.stats = new Stats();
      document.body.appendChild(this.stats.domElement);
    },
    changeWindow() {
      const box = this.$refs.box;
      window.addEventListener("resize", () => {
        this.renderer.setSize(box.clientWidth, box.clientHeight);
        this.renderer.setPixelRatio(window.devicePixelRatio);
        this.camera.aspect = box.clientWidth / box.clientHeight;
        this.camera.updateProjectionMatrix();
      });
    },

    animate() {
      this.controls.update();
      this.stats.update();
      requestAnimationFrame(this.animate);
      this.renderer.render(this.scene, this.camera);
    },
  },
};
</script>

<style>
.box {
  height: 100%;
  width: 100%;
}
.control {
  pointer-events: none;
  position: fixed;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  color: white;
  font-size: 20px;
  background-color: rgba(0, 0, 0, 0.5);
  padding: 20px 40px;
  border-radius: 5px;
}
</style>
