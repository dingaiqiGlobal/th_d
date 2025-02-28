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
import { TransformControls } from "three/examples/jsm/controls/TransformControls.js";

export default {
  name: "Base",
  data() {
    return {
      scene: null,
      camera: null,
      renderer: null,
      controls: null,
      stats: null,
      light: null,
      model: null,
      plane: null,
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
      //光源
      this.light = this.createLight();
      this.scene.add(this.light);
      //渲染器
      this.renderer = this.createRenderer();
      //控制器
      this.controls = this.createControls();
      //帧率
      this.createStats();
      //窗口变化
      this.changeWindow();
      //模型&&物体
      this.createMeshModel();
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
      camera.position.set(0, 3, 6);
      camera.lookAt(0, 0, 0);
      return camera;
    },
    createLight() {
      const directionalLight = new THREE.DirectionalLight(0xffffff, 1);
      directionalLight.position.set(1, 2, 0);
      directionalLight.castShadow = true;
      return directionalLight;
    },
    createRenderer() {
      const box = this.$refs.box;
      const renderer = new THREE.WebGLRenderer();
      renderer.shadowMap.needsUpdate = true; //允许在场景中使用阴影贴图
      renderer.shadowMap.enabled = true; //下次render调用时刷新
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
    createMeshModel() {
      //模型
      const loader = new GLTFLoader();
      loader.load("/data/model/Fox.glb", (gltf) => {
        this.model = gltf.scene;
        this.model.scale.set(0.01, 0.01, 0.01);
        this.scene.add(this.model);
        //递归投射阴影
        this.model.traverse((object) => {
          if (object.isMesh) object.castShadow = true;
        });
      });
    },
    createUI() {
      const folder = new GUI();
      //转换控制器
      const transformControls = new TransformControls(
        this.camera,
        this.renderer.domElement
      );
      folder
        .add(transformControls, "mode", ["translate", "rotate", "scale"])
        .name("模式");

      folder.add(
        { 控制模型: () => transformControls.attach(this.model) },
        "控制模型"
      );
      //转换辅助
      const transformControlsRoot = transformControls.getHelper();
      this.scene.add(transformControlsRoot);
      //改变时暂时关闭轨道控制器
      transformControls.addEventListener("dragging-changed", (e) => {
        this.controls.enabled = !e.value;
      });
      //添加box辅助
      const box3 = new THREE.Box3();
      const box3Helper = new THREE.Box3Helper(box3, 0xffff00);
      this.scene.add(box3Helper);
      transformControls.addEventListener(
        "change",
        () => (box3Helper.box = box3.setFromObject(transformControls.object))
      );
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
