<template>
  <div class="box" ref="box">
  </div>
</template>

<script>
import * as THREE from "three";
import { OrbitControls } from "three/addons/controls/OrbitControls.js";
import Stats from "three/addons/libs/stats.module.js";
import {
  CSS2DRenderer,
  CSS2DObject,
} from "three/examples/jsm/renderers/CSS2DRenderer.js";
import {
  CSS3DRenderer,
  CSS3DObject,
} from "three/examples/jsm/renderers/CSS3DRenderer.js";

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
      css2DRender: null,
      css3DRender: null,
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
      //CSSRender
      this.createCSSRender();
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
      camera.position.set(10, 10, 10);
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
    createCSSRender() {
      const box = this.$refs.box;
      this.css2DRender = this.setCss2DRenderer(box);
      this.css3DRender = this.setCss3DRenderer(box);
      const setCss2dDOM = (box, position) => {
        box.style.pointerEvents = "auto";
        const mesh = new CSS2DObject(box);
        mesh.position.copy(position);
        this.scene.add(mesh);
        return mesh;
      };
      const setCss3dDOM = (box, position) => {
        const mesh = new CSS3DObject(box);
        mesh.position.copy(position);
        this.scene.add(mesh);
        return mesh;
      };
      for (let i = 0; i < 5; i++) {
        setCss2dDOM(this.createDom("2D" + i), { x: 0, y: 0, z: i * 2 }); // 2d dom
        setCss3dDOM(this.createDom("3D" + i), {
          x: 0,
          y: i * 2,
          z: 0,
        }).scale.multiplyScalar(0.02); // 3d dom
      }
    },
    //css2d渲染
    setCss2DRenderer(DOM) {
      const css2DRender = new CSS2DRenderer();
      css2DRender.resize = () => {
        console.log(DOM)
        css2DRender.setSize(DOM.clientWidth, DOM.clientHeight);
        css2DRender.domElement.style.zIndex = 0;
        css2DRender.domElement.style.position = "relative";
        css2DRender.domElement.style.top = -DOM.clientHeight * 2 + "px";
        css2DRender.domElement.style.height = DOM.clientHeight + "px";
        css2DRender.domElement.style.width = DOM.clientWidth + "px";
        css2DRender.domElement.style.pointerEvents = "none";
      };
      css2DRender.resize();
      DOM.appendChild(css2DRender.domElement);
      return css2DRender;
    },
    //css3d渲染
    setCss3DRenderer(DOM) {
      const css3DRender = new CSS3DRenderer();
      css3DRender.resize = () => {
        css3DRender.setSize(DOM.clientWidth, DOM.clientHeight);
        css3DRender.domElement.style.zIndex = 0;
        css3DRender.domElement.style.position = "relative";
        css3DRender.domElement.style.top = -DOM.clientHeight + "px";
        css3DRender.domElement.style.height = DOM.clientHeight + "px";
        css3DRender.domElement.style.width = DOM.clientWidth + "px";
        css3DRender.domElement.style.pointerEvents = "none";
      };
      css3DRender.resize();
      DOM.appendChild(css3DRender.domElement);
      return css3DRender;
    },
    createDom(text) {
      const div = document.createElement("div");
      const img = document.createElement("img");
      img.src = require("@/assets/texture/elephant.png");
      img.style.width = "50px";
      img.style.height = "50px";
      div.appendChild(img);
      div.innerHTML += text;
      div.style.color = "white";
      return div;
    },
    changeWindow() {
      const box = this.$refs.box;
      window.addEventListener("resize", () => {
        this.renderer.setSize(box.clientWidth, box.clientHeight);
        this.renderer.setPixelRatio(window.devicePixelRatio);
        this.camera.aspect = box.clientWidth / box.clientHeight;
        this.camera.updateProjectionMatrix();
        this.css2DRender.resize();
        this.css3DRender.resize();
      });
    },
    animate() {
      this.controls.update();
      this.stats.update();
      requestAnimationFrame(this.animate);
      this.renderer.render(this.scene, this.camera);
      this.css2DRender.render(this.scene, this.camera); // Css2D渲染
      this.css3DRender.render(this.scene, this.camera); // Css3D渲染
    },
  },
};
</script>

<style>
.box {
  height: 100%;
  width: 100%;
}
</style>
