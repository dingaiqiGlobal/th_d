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
  BlendFunction,
  SelectiveBloomEffect,
  EffectComposer,
  EffectPass,
  RenderPass,
} from "postprocessing";

/**
 * https://github.com/pmndrs/postprocessing
 * npm install three postprocessing --save
 *
 *
 * BlendFunction           混合函数（设置材质的混合模式）
 * SelectiveBloomEffect    选择性发光
 * EffectComposer          效果生成器
 * EffectPass              效果过程
 * RenderPass              渲染过程
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
      bloomEffect: null,
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
      const gridHelper = new THREE.GridHelper(100, 20);
      this.scene.add(axesHelper, gridHelper);
      //光源
      this.lightGroup = this.createLight();
      this.scene.add(this.lightGroup);
      //渲染器
      this.renderer = this.createRenderer();
      //后期处理
      this.createComposer();
      //物体
      this.createMesh();
      //射线事件
      this.RayEvent();
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
      camera.position.set(0, 5, 5);
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
    //后期处理
    createComposer() {
      this.composer = new EffectComposer(this.renderer);
      this.bloomEffect = new SelectiveBloomEffect(this.scene, this.camera, {
        blendFunction: BlendFunction.ADD,
        mipmapBlur: true,
        luminanceThreshold: 0.4,
        luminanceSmoothing: 0.2,
        intensity: 3.0,
      });
      this.composer.addPass(new RenderPass(this.scene, this.camera));
      this.composer.addPass(new EffectPass(this.camera, this.bloomEffect));
    },
    createMesh() {
      const boxGeometry = new THREE.BoxGeometry(1, 1, 1);
      const boxMaterial = new THREE.MeshBasicMaterial({ color: 0xa0dee2 });
      const boxMaterial2 = new THREE.MeshBasicMaterial({ color: "yellow" });
      const box1 = new THREE.Mesh(boxGeometry, boxMaterial);
      const box2 = new THREE.Mesh(boxGeometry, boxMaterial2);
      box1.position.set(-1.5, 0, 0);
      this.scene.add(box1, box2);
      this.bloomEffect.selection.set([box1], true);
    },
    RayEvent() {
      const box = this.$refs.box;
      const height = box.clientHeight;
      const width = box.clientWidth;
      this.renderer.domElement.addEventListener("click", (event) => {
        const px = event.offsetX;
        const py = event.offsetY;
        const x = (px / width) * 2 - 1;
        const y = -(py / height) * 2 + 1;
        const raycaster = new THREE.Raycaster();
        raycaster.setFromCamera(new THREE.Vector2(x, y), this.camera);
        const intersects = raycaster.intersectObjects(this.scene.children);
        if (intersects.length > 0) {
          const object = intersects[0].object;
          this.bloomEffect.selection.toggle(object);
        }
      });
    },
    animate() {
      this.controls.update();
      this.stats.update();
      requestAnimationFrame(this.animate);
      this.renderer.render(this.scene, this.camera);
      this.composer.render(); //实时后期处理
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
