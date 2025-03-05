<template>
  <div class="box" ref="box">
    <div class="control"></div>
  </div>
</template>

<script>
import * as THREE from "three";
import { OrbitControls } from "three/addons/controls/OrbitControls.js";
import Stats from "three/addons/libs/stats.module.js";
import { GLTFLoader } from "three/addons/loaders/GLTFLoader.js";
import { DRACOLoader } from "three/examples/jsm/loaders/DRACOLoader.js";

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
      curve: null,
      modle: null,
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
      //曲线
      this.createCurve();
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
        75,
        this.$refs.box.clientWidth / this.$refs.box.clientHeight,
        0.1,
        1000
      );
      camera.position.set(30, 30, 30);
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
    createCurve() {
      this.curve = new THREE.CatmullRomCurve3([
        new THREE.Vector3(0, 0, 0),
        new THREE.Vector3(20, 15, 0),
        new THREE.Vector3(15, 0, 20),
        new THREE.Vector3(5, 15, -5),
        new THREE.Vector3(10, 0, -10),
      ]);
      const geometry = new THREE.BufferGeometry().setFromPoints(
        this.curve.getPoints(500)
      );
      const material = new THREE.LineBasicMaterial({ color: 0xffffff });
      const curveMesh = new THREE.Line(geometry, material);
      this.scene.add(curveMesh);
    },
    createModel() {
      const loader = new GLTFLoader();
      loader.setDRACOLoader(
        new DRACOLoader().setDecoderPath(
          `https://z2586300277.github.io/3d-file-server/` + "js/three/draco/"
        )
      );
      loader.load("data/model/car.glb", (gltf) => {
        this.model = gltf.scene;
        this.scene.add(this.model);
        let t = 0;
        this.model.render = () => {
          t += 0.0004;
          const point = this.curve.getPointAt(t % 1); // 获取当前点
          this.model.position.set(point.x, point.y, point.z); // 设置位置
          this.model.lookAt(this.curve.getPointAt((t + 0.01) % 1)); // 朝向下一个点
        };
      });
    },
    animate() {
      this.controls.update();
      this.stats.update();
      requestAnimationFrame(this.animate);
      this.renderer.render(this.scene, this.camera);
      this.model?.render();//this.model存在且不是null或undefined，调用this.model对象上的render()方法
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
