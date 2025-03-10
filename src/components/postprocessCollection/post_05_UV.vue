<template>
  <div class="box" ref="box">
    <div class="control"></div>
  </div>
</template>

<script>
import * as THREE from "three";
import { OrbitControls } from "three/addons/controls/OrbitControls.js";
import Stats from "three/addons/libs/stats.module.js";
import {
  RenderPass,
  EffectPass,
  EffectComposer,
  GodRaysEffect,
} from "postprocessing";
/**
 * https://github.com/pmndrs/postprocessing
 * npm install three postprocessing --save
 *
 * EffectComposer          效果生成器
 * EffectPass              效果过程
 * RenderPass              渲染过程
 * GodRaysEffect           上帝射线效果
 */

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
      //后期处理
      composer: null,
      wall: null,
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
      //平面
      this.createPlane();
      //   //循环渲染
      //   this.animate();
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
      camera.position.set(0, 0, 1);
      camera.lookAt(0, 0, 0);
      return camera;
    },
    createLight() {
      const lightGroup = new THREE.Group();
      let ambientLight = new THREE.AmbientLight(0x999999);
      lightGroup.add(ambientLight);
      //平行光
      const directionaLight = new THREE.DirectionalLight();
      directionaLight.position.set(0, 0, 1);

      lightGroup.add(directionaLight);
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
    createPlane() {
      const image_url = require("@/assets/texture/photo-people.avif");
      const image_ratio = 687 / 1031;
      const image_tex = new THREE.TextureLoader().load(image_url);
      image_tex.repeat.set(1, 1);

      const alpha_url = require("@/assets/texture/photo-window.avif");
      const alpha_tex = new THREE.TextureLoader().load(alpha_url);
      alpha_tex.repeat.set(0.6, 2);
      alpha_tex.offset.x = (1 - alpha_tex.repeat.x) / 2;
      alpha_tex.wrapT = THREE.RepeatWrapping;

      //平面(前)
      const geom = new THREE.PlaneGeometry(image_ratio * 2, 2);
      const mat = new THREE.MeshLambertMaterial({
        alphaMap: alpha_tex,
        alphaTest: 0.15,
        map: image_tex,
      });
      const mesh = new THREE.Mesh(geom, mat);
      this.scene.add(mesh);
      //墙（后）
      this.wall = new THREE.Mesh(
        geom,
        new THREE.MeshBasicMaterial({
          alphaMap: alpha_tex,
          alphaTest: 0.15,
          map: image_tex,
        })
      );
      this.wall.scale.setScalar(1.2);
      this.wall.position.z = -0.1;
      this.scene.add(this.wall);

      //后期
      this.composer = new EffectComposer(this.renderer); //流程1
      const renderPass = new RenderPass(this.scene, this.camera); //流程2
      this.composer.addPass(renderPass); //流程3
      const effect = new GodRaysEffect(this.camera, this.wall, {
        density: 1,
        decay: 0.96,
        weight: 1,
      });
      const effectPass = new EffectPass(this.camera, effect);
      this.composer.addPass(effectPass); //流程4
      //每个可用帧都会调用的函数。 如果传入‘null’,所有正在进行的动画都会停止。
      // 可用来代替requestAnimationFrame的内置函数. 对于WebXR项目，必须使用此函数
      this.renderer.setAnimationLoop((t) => {
        this.composer.render();//流程5
        this.stats.update();
        this.controls.update();
        alpha_tex.offset.y = t * -0.001;
      });
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
