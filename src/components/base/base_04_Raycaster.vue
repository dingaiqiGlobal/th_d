<template>
  <div class="box" ref="box">
    <div class="control"></div>
  </div>
</template>

<script>
import * as THREE from "three";
import { OrbitControls } from "three/addons/controls/OrbitControls.js";

export default {
  name: "Base",
  data() {
    return {
      scene: null,
      camera: null,
      renderer: null,
      controls: null,
      lightGroup: null,
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
      //几何体
      let geoGroup = this.createGeom();
      this.scene.add(geoGroup);
      //渲染器
      this.renderer = this.createRenderer();
      //射线事件
      this.RayEvent();
      //控制器
      this.controls = this.createControls();
      //窗口变化
      this.changeWindow();
      //循环渲染
      this.render();
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
      camera.position.set(50, 15, 0);
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
      pointLight.position.set(20, 20, 20);

      lightGroup.add(pointLight);
      return lightGroup;
    },
    createGeom() {
      const group = new THREE.Group();
      let groundMaterial = new THREE.MeshPhongMaterial({
        shininess: 80,
        color: 0xffffff,
        specular: 0xffffff,
      });
      let planeGeometry = new THREE.PlaneGeometry(100, 100);
      let ground = new THREE.Mesh(planeGeometry, groundMaterial);
      ground.position.set(0, -5, 0);
      ground.rotation.x = -Math.PI / 2;
      ground.scale.set(1000, 1000, 1000);
      group.add(ground);

      const sphereGeometry1 = new THREE.SphereGeometry(15, 32, 16);
      const sphereMaterial1 = new THREE.MeshBasicMaterial({ color: "#ff0000" });
      const sphere1 = new THREE.Mesh(sphereGeometry1, sphereMaterial1);
      sphere1.position.set(0, 0, 0);
      sphere1.scale.set(0.1, 0.1, 0.1);
      group.add(sphere1);
      const sphere2 = sphere1.clone();
      sphere2.position.set(10, 0, 0);
      sphere2.scale.set(0.1, 0.1, 0.1);
      group.add(sphere2);
      const sphere3 = sphere1.clone();
      sphere3.position.set(20, 0, 0);
      sphere3.scale.set(0.1, 0.1, 0.1);
      group.add(sphere3);
      return group;
    },
    createRenderer() {
      const box = this.$refs.box;
      const renderer = new THREE.WebGLRenderer();
      renderer.setSize(box.clientWidth, box.clientHeight);
      box.appendChild(renderer.domElement);
      return renderer;
    },
    createControls() {
      const controls = new OrbitControls(this.camera, this.renderer.domElement);
      return controls;
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
        //选中一个组的问题？？
        if (intersects.length > 0) {
          intersects[0].object.material.color.set("#62c60a");
        }
      });
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
    render() {
      this.controls.update();
      requestAnimationFrame(this.render);
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
