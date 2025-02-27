<template>
  <div class="box" ref="box">
    <div class="control"></div>
  </div>
</template>

<script>
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
      list: [],
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
      //几何
      this.createMesh();
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
      camera.position.set(25, 25, 25);
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
    createMesh() {
      const R = () => Math.random() * 10 - 5;
      for (let i = 0; i < 10; i++) {
        const mesh = new THREE.Mesh(
          new THREE.BoxGeometry(0.3, 0.3, 0.3),
          new THREE.MeshBasicMaterial({ color: Math.random() * 0xffffff })
        );
        mesh.position.set(R(), R(), R());
        this.scene.add(mesh);
        const div = this.createDom();
        mesh.div = div; //添加到对象为属性
        this.list.push(mesh);
      }
    },
    createDom() {
      const div = document.createElement("div");
      div.style.position = "absolute";
      const img = document.createElement("img");
      img.src = require("@/assets/texture/matcap/matcap-porcelain-white.jpg");
      img.style.width = "50px";
      img.style.height = "50px";
      div.appendChild(img);
      document.body.appendChild(div);
      return div;
    },
    updateCSS2DVisibility() {
      const box = this.$refs.box;
      this.list.forEach((mesh) => {
        //世界坐标转屏幕坐标
        const worldPosition = mesh.getWorldPosition(new THREE.Vector3());
        worldPosition.project(this.camera);
        const width = box.clientWidth;
        const height = box.clientHeight;
        const screenX = ((worldPosition.x + 1) / 2) * width;
        const screenY = ((-worldPosition.y + 1) / 2) * height;
        mesh.div.style.left = screenX + "px";
        mesh.div.style.top = screenY + "px";
      });
    },

    animate() {
      requestAnimationFrame(this.animate);
      this.updateCSS2DVisibility();
      this.controls.update();
      this.stats.update();
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
