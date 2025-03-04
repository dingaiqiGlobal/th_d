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
import { GLTFLoader } from "three/addons/loaders/GLTFLoader.js";
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
      model: null,
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
      let pointLight = new THREE.PointLight(0xffffff, 1, 0);
      pointLight.position.set(-10, 6, 10);
      lightGroup.add(pointLight);
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
      const gui = new GUI();
      const loader = new GLTFLoader();
      loader.load("data/model/computer.glb", (gltf) => {
        const model = this.scene.add(gltf.scene);
        const {
          frontView,
          rightView,
          topView,
          bottomView,
          backView,
          center,
        } = this.getObjectViews(model);
        const setView = (view) => {
          this.gsapAnimation(this.controls.object.position, view);
          this.gsapAnimation(this.controls.target, center); //回到视图中心
        };
        gui.add({ 前视图: () => setView(frontView) }, "前视图");
        gui.add({ 右视图: () => setView(rightView) }, "右视图");
        gui.add({ 上视图: () => setView(topView) }, "上视图");
        gui.add({ 下视图: () => setView(bottomView) }, "下视图");
        gui.add({ 后视图: () => setView(backView) }, "后视图");
      });
    },
    getObjectViews(object, fov = 50) {
      //fov视野
      const box = new THREE.Box3().setFromObject(object);
      const { max, min } = box;
      const center = new THREE.Vector3();
      box.getCenter(center); //模型的获取中心
      const radius = new THREE.Vector3().subVectors(max, min).length() / 2; //半径（subVectors向量设置为a - b）
      const dir = object.getWorldDirection(new THREE.Vector3()); // 物体方向
      const distance = radius / Math.tan((Math.PI * fov) / 360); // 根据半径和相机视角 计算出距离
      const vector = dir.multiplyScalar(distance); // 方向距离向量（将该向量与所传入的标量s进行相乘）
      //applyAxisAngle应用轴角度
      const frontView = vector.clone().add(center);
      const leftView = vector
        .clone()
        .applyAxisAngle(new THREE.Vector3(0, 1, 0), -Math.PI / 2)
        .add(center);
      const rightView = vector
        .clone()
        .applyAxisAngle(new THREE.Vector3(0, 1, 0), Math.PI / 2)
        .add(center);
      const topView = vector
        .clone()
        .applyAxisAngle(new THREE.Vector3(1, 0, 0), -Math.PI / 2)
        .add(center);
      const bottomView = vector
        .clone()
        .applyAxisAngle(new THREE.Vector3(1, 0, 0), Math.PI / 2)
        .add(center);
      const backView = vector
        .clone()
        .applyAxisAngle(new THREE.Vector3(0, 1, 0), Math.PI)
        .add(center);
      return {
        frontView,
        leftView,
        rightView,
        topView,
        bottomView,
        backView,
        center,
      };
    },
    gsapAnimation(position, position_) {
      return gsap.to(position, {
        ...position_,
        duration: 1,
        ease: "none",
        repeat: 0,
        yoyo: false,
        yoyoEase: true,
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
