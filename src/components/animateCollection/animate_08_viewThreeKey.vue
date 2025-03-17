<template>
  <div class="box" ref="box">
    <div class="control"></div>
  </div>
</template>

<script>
import * as THREE from "three";
import { OrbitControls } from "three/addons/controls/OrbitControls.js";
import Stats from "three/addons/libs/stats.module.js";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";

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
      group: null, //模型
      // 相机参数
      cameraOffset: new THREE.Vector3(0, 5, -5),
      smoothFactor: 0.1,
      moveSpeed: 0.06,
      turnSpeed: 0.03,
      keys: { w: false, s: false, a: false, d: false },
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
      const gridHelper = new THREE.GridHelper(100, 40);
      this.scene.add(axesHelper, gridHelper);
      //光源
      this.lightGroup = this.createLight();
      this.scene.add(this.lightGroup);
      //渲染器
      this.renderer = this.createRenderer();
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
        75,
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
      let ambientLight = new THREE.AmbientLight(0xffffff, 4);
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
      new GLTFLoader().load("data/model/Fox.glb", (gltf) => {
        this.group = gltf.scene;
        this.scene.add(this.group);
        this.group.scale.multiplyScalar(0.03);
        /**
         * 模型动画
         * 与07做对比这个不往group添加属性
         */
        const mixer = new THREE.AnimationMixer(this.group); // 动画混合器
        const clock = new THREE.Clock(); // 时钟
        this.group.mixerUpdate = () => mixer.update(clock.getDelta()); // 动画帧
        const action = mixer.clipAction(gltf.animations[1]); //走动画
        action.play(); //开始
      });
    },
    updateModelAnimate() {
      // 事件监听
      document.addEventListener(
        "keydown",
        (e) => ("keydown", (this.keys[e.key.toLowerCase()] = true))
      );
      document.addEventListener(
        "keyup",
        (e) => (this.keys[e.key.toLowerCase()] = false)
      );
      if (!this.group) return;
      if (this.keys.a) this.group.rotation.y += this.turnSpeed;
      if (this.keys.d) this.group.rotation.y -= this.turnSpeed;
      if (this.keys.w || this.keys.s) {
        const dir = new THREE.Vector3();
        this.group.getWorldDirection(dir);
        this.group.position.add(
          dir.multiplyScalar(this.keys.w ? this.moveSpeed : -this.moveSpeed)
        );
      }
      this.group.mixerUpdate();
      //相机跟随(相机跟随)
      //Vector3  方法applyQuaternion、lerp
      const targetPos = this.group.position
        .clone()
        .add(this.cameraOffset.clone().applyQuaternion(this.group.quaternion));
      this.camera.position.lerp(targetPos, this.smoothFactor);
      this.camera.lookAt(
        this.group.position.clone().add(new THREE.Vector3(0, 1, 0))
      );
    },

    animate() {
      //(相机跟随就不用控制器)
      this.updateModelAnimate();
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
