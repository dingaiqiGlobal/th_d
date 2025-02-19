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
      //网格辅助
      const gridHelper = this.createGridHelper();
      this.scene.add(gridHelper);
      //光源
      this.lightGroup = this.createLight();
      this.scene.add(this.lightGroup);
      //物体
      this.createMesh();
      //渲染器
      this.renderer = this.createRenderer();
      //控制器
      this.controls = this.createControls();
      //帧率
      this.createStats();
      //窗口变化
      this.changeWindow();
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
        50,
        this.$refs.box.clientWidth / this.$refs.box.clientHeight,
        0.1,
        1000
      );
      camera.position.set(0, 1, 4);
      camera.lookAt(0, 0, 0);
      return camera;
    },
    createAxesHelper() {
      const axesHelper = new THREE.AxesHelper(5);
      return axesHelper;
    },
    createGridHelper() {
      const gridHelper = new THREE.GridHelper(10, 10);
      return gridHelper;
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
    createMesh() {
      const geomerty = new THREE.PlaneGeometry(1, 1);
      const map = new THREE.TextureLoader().load(
        require("@/assets/texture/flower-5.jpg")
      );
      const material = new THREE.MeshBasicMaterial({
        map,
        color: 0x737373,
        side: THREE.DoubleSide,
      });
      const mesh = new THREE.Mesh(geomerty, material);
      this.scene.add(mesh);
      //layers重点
      const box = new THREE.Mesh(
        new THREE.BoxGeometry(1, 1, 1),
        new THREE.MeshBasicMaterial({ color: 0xffffff })
      );
      box.position.set(1, 1, 0);
      box.layers.set(1); //******
      this.scene.add(box);
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
      controls.enableDamping = true; //启用阻尼
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
    createUI() {
      //camera中layers继承与object3D，Layers 对象为 Object3D 分配 1个到 32 个图层
      const folder = new GUI();
      const onChange = () => this.camera.updateProjectionMatrix(); //相当于更新相机状态
      folder
        .add(this.camera.layers, "mask")
        .name("图层")
        .onChange(onChange)
        .listen();
      folder.add(
        { 切换此图层的状态: () => this.camera.layers.toggle(1) },
        "切换此图层的状态"
      );
      folder.add(this.camera, "fov").min(0).name("视角").onChange(onChange);
      folder
        .add(this.camera, "near")
        .min(0.001)
        .name("近平面")
        .onChange(onChange);
      folder.add(this.camera, "far").min(0).name("远平面").onChange(onChange);
      folder.add(this.camera, "zoom").min(0).name("缩放").onChange(onChange);
      folder.add(this.camera, "filmOffset").name("胶片偏移").onChange(onChange);
      folder.add(this.camera, "filmGauge").name("胶片尺寸").onChange(onChange);
      folder.add(this.camera.position, "x").name("相机位置x").listen();
      folder.add(this.camera.position, "y").name("相机位置y").listen();
      folder.add(this.camera.position, "z").name("相机位置z").listen();
      folder.add({ fn: () => folder.reset() }, "fn").name("重置");
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
