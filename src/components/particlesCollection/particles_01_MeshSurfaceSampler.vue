<template>
  <div class="box" ref="box">
    <div class="control"></div>
  </div>
</template>

<script>
import * as THREE from "three";
import { OrbitControls } from "three/addons/controls/OrbitControls.js";
import Stats from "three/addons/libs/stats.module.js";

import { OBJLoader } from "three/examples/jsm/loaders/OBJLoader.js";
import { MeshSurfaceSampler } from "three/examples/jsm/math/MeshSurfaceSampler.js"; //网格表面取样器

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

      sampler: null, //取样器
      vertices: [], //顶点
      colors: [],
      sparklesGeometry:null,//闪烁几何体
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
      camera.position.set(0, 80, 200);
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
      controls.autoRotate = true;
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
      //闪烁几何体
      this.sparklesGeometry = new THREE.BufferGeometry();
      const sparklesMaterial = new THREE.PointsMaterial({
        size: 6,
        alphaTest: 0.5,
        map: new THREE.TextureLoader().load(
          require("@/assets/particles/snow.png")
        ),
        vertexColors: true,
      });
      const points = new THREE.Points(this.sparklesGeometry, sparklesMaterial);
      this.scene.add(points);

      //模型
      let mesh = null;
      new OBJLoader().load("data/model/elephant.obj", (obj) => {
        mesh = obj.children[0];
        mesh.material = new THREE.MeshBasicMaterial({
          wireframe: true,
          color: 0xa58fb5,
          transparent: true,
          opacity: 0.2,
        });
        this.scene.add(obj);
        this.sampler = new MeshSurfaceSampler(mesh).build();//处理输入几何并准备返回样本
        this.renderer.setAnimationLoop(this.animate());
      });
    },
    animate() {
        //动态添加
      if (this.vertices.length < 10000) {
        const tempPosition = new THREE.Vector3()
        this.sampler.sample(tempPosition);//在输入几何体的表面上选择一个随机点，返回该点的位置以及可选的法向量和颜色
        this.vertices.push(tempPosition.x, tempPosition.y, tempPosition.z);
        this.sparklesGeometry.setAttribute(
          "position",
          new THREE.Float32BufferAttribute(this.vertices, 3)
        );
        const color = new THREE.Color(0xa58fb5);
        this.colors.push(color.r, color.g, color.b);
        this.sparklesGeometry.setAttribute(
          "color",
          new THREE.Float32BufferAttribute(this.colors, 3)
        );
      }

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
