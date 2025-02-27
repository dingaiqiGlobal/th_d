<template>
  <div class="box" ref="box">
    <div class="control"></div>
  </div>
</template>

<script>
import { GUI } from "three/examples/jsm/libs/lil-gui.module.min.js";
import * as THREE from "three";
import { OrbitControls } from "three/addons/controls/OrbitControls.js";
import Stats from "three/addons/libs/stats.module.js";

import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";
import { DRACOLoader } from "three/examples/jsm/loaders/DRACOLoader.js";
import gsap from "gsap";

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
      group: null,
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
      //渲染器
      this.renderer = this.createRenderer();
      //控制器
      this.controls = this.createControls();
      //帧率
      this.createStats();
      //窗口变化
      this.changeWindow();
      //模型
      this.createModel();
      //UI
      this.createUI();
      //循环渲染
      this.animate();
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
      camera.position.set(5, 5, 5);
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
      const directionalLight = new THREE.DirectionalLight(0xffffff, 2);
      directionalLight.position.set(-5, 5, -5);
      lightGroup.add(directionalLight);
      return lightGroup;
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
      controls.dampingFactor = 0.05;
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
    createModel() {
      const loader = new GLTFLoader();
      //一个用于加载经过Draco压缩的图形库
      loader.setDRACOLoader(
        new DRACOLoader().setDecoderPath(
          `https://z2586300277.github.io/3d-file-server/` + "js/three/draco/"
        )
      );
      loader.load(`data/model/car.glb`, (gltf) => {
        this.group = gltf.scene;
        //获取模型盒子
        const box = new THREE.Box3().setFromObject(this.group);
        const center = new THREE.Vector3();
        box.getCenter(center);
        this.group.center = center;
        this.group.traverse((child) => {
          if (child.isMesh) {
            //物体局部空间中位置的向量（转为世界坐标）
            child.localToWorld(child.position);
            //给每个模型添加开始位置
            child.startPoisition = child.position.clone();
          }
        });
        this.scene.add(this.group);
      });
    },
    createUI() {
      const gui = new GUI();
      gui.add(
        {
          拆解动画: () => {
            this.split(this.group);
          },
        },
        "拆解动画"
      );
      gui.add(
        {
          还原动画: () => {
            this.revert(this.group);
          },
        },
        "还原动画"
      );
    },
    split(model) {
      const distance = () => (Math.random() > 0.5 ? 1.5 : -1.5);
      model.traverse((child) => {
        if (child.startPoisition) {
          const v1 = distance();
          const v2 = distance();
          const v3 = distance();
          gsap.to(child.position, {
            x: child.startPoisition.x + v1,
            y: child.startPoisition.y + v2,
            z: child.startPoisition.z + v3,
            duration: 1,
            ease: "power2.inOut",
          });
        }
      });
    },
    revert(model) {
      model.traverse((child) => {
        if (child.startPoisition) {
          gsap.to(child.position, {
            x: child.startPoisition.x,
            y: child.startPoisition.y,
            z: child.startPoisition.z,
            duration: 1,
            ease: "power2.inOut",
          });
        }
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
  position: absolute;
  z-index: 10;
  left: 10px;
  top: 10px;
}
</style>
