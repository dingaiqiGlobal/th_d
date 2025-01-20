<template>
  <div class="box" ref="box">
    <div class="control">
      <circle-progress
        v-if="isShow"
        ref="$circle"
        class="progress"
        key="duration-model"
        :isAnimation="false"
        :isRound="true"
        :width="width"
        :radius="radius"
        :progress="progress"
        :barColor="barColor"
        :timeFunction="timeFunction"
        :backgroundColor="backgroundColor"
      >
      </circle-progress>
    </div>
  </div>
</template>

<script>
import * as THREE from "three";
import { OrbitControls } from "three/addons/controls/OrbitControls.js";
import Stats from "three/addons/libs/stats.module.js";
import { GLTFLoader } from "three/addons/loaders/GLTFLoader.js";

import CircleProgress from "./circle-progress";

export default {
  name: "Base",
  components: {
    CircleProgress,
  },
  data() {
    return {
      scene: null,
      camera: null,
      renderer: null,
      controls: null,
      lightGroup: null,
      stats: null,
      //UI
      isDurationModel: true, // 是否打开持续缓动模式
      isShow: true,
      width: 100, //圆的大小
      radius: 10, //进度条厚度
      progress: 0, //进度条百分比
      barColor: "#ffae00", //进度条颜色
      backgroundColor: "#ffffff", //背景颜色
      timeFunction: "cubic-bezier(0.99, 0.01, 0.22, 0.94)", //动画缓动函数
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
      this.render();
    },
    createScene() {
      const scene = new THREE.Scene();
      return scene;
    },
    createCamera() {
      let camera = new THREE.PerspectiveCamera(
        45,
        this.$refs.box.clientWidth / this.$refs.box.clientHeight,
        0.1,
        1000
      );
      camera.position.set(125, 125, 125);
      camera.lookAt(0, 0, 0);
      return camera;
    },
    createAxesHelper() {
      const axesHelper = new THREE.AxesHelper(5);
      return axesHelper;
    },
    createLight() {
      const lightGroup = new THREE.Group();
      let ambientLight = new THREE.AmbientLight(0x999999);
      lightGroup.add(ambientLight);

      let pointLight = new THREE.PointLight(0xffffff, 1, 0);
      pointLight.position.set(-10, 6, 10);

      lightGroup.add(pointLight);
      return lightGroup;
    },
    createModel() {
      const loader = new GLTFLoader();
      loader.load(
        "http://192.168.201.162:8088/model/WDK_DSDS.glb",
        (gltf) => {
          this.scene.add(gltf.scene);
          //   gltf.animations; // Array<THREE.AnimationClip>
          //   gltf.scene; // THREE.Group
          //   gltf.scenes; // Array<THREE.Group>
          //   gltf.cameras; // Array<THREE.Camera>
          //   gltf.asset; // Object

          //递归遍历方法
          gltf.scene.traverse(function (obj) {
            if (obj.isMesh) {//判断是否是网格模型
              console.log("模型节点:", obj,obj.name);
            }
          });
        },
        (progressEvent) => {
          this.onModelProgress(progressEvent);
        },
        (error) => {
          console.log(error);
        }
      );
    },
    onModelProgress(progressEvent) {
      /**
       * 1.loaded: 表示已加载的字节数。
       * 2.total: 表示需要加载的总字节数。
       * 3.lengthComputable: 一个布尔值，指示是否能够确定要加载的总字节数。
       * 注意：lengthComputable 为false 表示无法获取到 当前文件的总字节（total）大小
       * 可能原因有以下几种：
       * 1.文件资源在项目本地文件夹public(vue项目)***
       * 2.服务器未提供 Content-Length: 服务器在响应头中未提供正确的 Content-Length 字段，或者提供的值无效。在这种情况下，浏览器无法确定要加载的总字节数，因此 lengthComputable 被设置为 false
       * 3.流式传输: 一些加载场景中，数据是通过流式传输的方式加载的，因此无法预先知道要加载的总字节数。例如，通过 WebSocket 或 SSE (Server-Sent Events) 加载数据时，通常无法确定总字节数
       */
      const { loaded, total, lengthComputable } = progressEvent;
      if (lengthComputable) {
        this.progress = (loaded / total) * 100;
        if (this.progress == 100) {
          this.isShow = false; //隐藏
        }
        // console.log(this.progress + "% loaded");
      } else {
        console.log("已加载" + loaded + "字节");
      }
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

    render() {
      this.stats.update();
      requestAnimationFrame(this.render);
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
  position: absolute;
  z-index: 10;
  left: 20px;
  top: 50px;
}
</style>
