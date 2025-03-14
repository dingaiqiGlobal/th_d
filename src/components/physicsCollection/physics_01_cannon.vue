<template>
  <div class="box" ref="box">
    <div class="control"></div>
  </div>
</template>

<script>
/**
 * npm i cannon-es --save
 *
 */
import * as THREE from "three";
import { OrbitControls } from "three/addons/controls/OrbitControls.js";
import Stats from "three/addons/libs/stats.module.js";
import * as CANNON from "cannon-es";

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
      //物理引擎
      world: null,
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
        75,
        this.$refs.box.clientWidth / this.$refs.box.clientHeight,
        0.1,
        1000
      );
      camera.position.set(0, 10, 10);
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
      this.world = new CANNON.World({ gravity: new CANNON.Vec3(0, -9.82, 0) });
      // 渲染时间略有不同的时间显示物理模拟的状态
      this.world.PhysicsRender = (deltaTime) => {
        this.world.step(1 / 60, deltaTime, 3);
        this.world.bodies.forEach((body) => body.render?.());
      };
      // 创建一个立方体
      const cubeGeometry = new THREE.BoxGeometry(1, 1, 1);
      const cubeMaterial = new THREE.MeshStandardMaterial({ color: "#08fff6" });
      const cubeMesh = new THREE.Mesh(cubeGeometry, cubeMaterial);
      cubeMesh.position.set(0, 5, 0);
      this.createPhysicsBody(this.world, cubeMesh, 1);
      this.scene.add(cubeMesh);
      // 创建一个平面
      const planeGeometry = new THREE.PlaneGeometry(10, 10);
      const planeMaterial = new THREE.MeshStandardMaterial({
        color: 0xffffff,
        side: THREE.DoubleSide,
      });
      const planeMesh = new THREE.Mesh(planeGeometry, planeMaterial);
      planeMesh.rotation.x = Math.PI / 2;
      this.createPhysicsBody(this.world, planeMesh, 0);
      this.scene.add(planeMesh);
    },
    createPhysicsBody(PhysicsWorld, model, mass) {
      const box = new THREE.Box3().setFromObject(model);
      const { max, min } = box;
      const center = new THREE.Vector3();
      box.getCenter(center);
      const body = new CANNON.Body({
        mass: mass,
        shape: new CANNON.Box(
          new CANNON.Vec3(
            (max.x - min.x) / 2,
            (max.y - min.y) / 2,
            (max.z - min.z) / 2
          )
        ),
        position: center,
      });
      body.position.copy(model.position);
      PhysicsWorld.addBody(body);
      body.render = () => model.position.copy(body.position);
    },
    animate() {
      requestAnimationFrame(this.animate);
      this.controls.update();
      this.stats.update();
      this.renderer.render(this.scene, this.camera);
      this.world.PhysicsRender(); //物理渲染
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
