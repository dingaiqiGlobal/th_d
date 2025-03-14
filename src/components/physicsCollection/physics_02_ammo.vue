<template>
  <div class="box" ref="box">
    <div class="control"></div>
  </div>
</template>

<script>
/**
 * Ammo.js（c++编写）的API与Cannon.js有所不同，但概念相似。
 * 在实际项目中，可能需要处理更多的细节，如碰撞回调、约束、关节等。Ammo.js提供了一个更强大的物理模拟引擎，
 * 
 *  在vue项目中需要配置  https://blog.csdn.net/zxm719382456/article/details/144102433
 * 
 */
 
import * as THREE from "three";
import { OrbitControls } from "three/addons/controls/OrbitControls.js";
import Stats from "three/addons/libs/stats.module.js";

import { AmmoPhysics } from "three/addons/physics/AmmoPhysics.js"; 

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
      //Mesh
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
        60,
        this.$refs.box.clientWidth / this.$refs.box.clientHeight,
        0.1,
        1000
      );
      camera.position.set(15, 15, 15);
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
    async createMesh() {
      // 安装
      const physics = await AmmoPhysics();
      console.log(AmmoPhysics)
      //盒子（屏幕）
      const floor = new THREE.Mesh(
        new THREE.BoxGeometry(60, 5, 60),
        new THREE.MeshLambertMaterial({ color: 0x444444 })
      );
      floor.position.y -= 20;
      floor.userData.physics = { mass: 0 };
      this.scene.add(floor);

      for (let i = 0; i < 100; i++) {
        const geometry =
          Math.random() > 0.5
            ? new THREE.IcosahedronGeometry()
            : new THREE.SphereGeometry();

        const material = new THREE.MeshLambertMaterial({
          color: 0xffffff * Math.random(),
        });
        const mesh = new THREE.Mesh(geometry, material);
        mesh.position.set(
          Math.random() - 0.5,
          Math.random() * 2,
          Math.random() - 0.5
        );
        mesh.userData.physics = { mass: 1 };
        this.scene.add(mesh);
      }
      //physics.addScene(this.scene); // 启动物理引擎
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
