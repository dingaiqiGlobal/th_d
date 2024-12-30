<template>
  <div class="box" ref="box">
    <div class="control"></div>
  </div>
</template>

<script>
import * as THREE from "three";
import { OrbitControls } from "three/addons/controls/OrbitControls.js";
import { GUI } from "three/examples/jsm/libs/lil-gui.module.min.js";
import AxisGridHelper from "./util/AxisGridHelper";

export default {
  name: "Base",
  data() {
    return {};
  },
  mounted() {
    this.initScene();
  },
  methods: {
    initScene() {
      let box = this.$refs.box;
      // 创建场景
      const scene = new THREE.Scene();
      // 创建相机
      const camera = new THREE.PerspectiveCamera(
        45,
        box.clientWidth / box.clientHeight,
        0.1,
        1000
      );
      camera.position.set(0, 30, 0);
      camera.up.set(0, 0, 1);
      camera.lookAt(0, 0, 0);
      //光源
      const ambientLight = new THREE.AmbientLight(0x404040);
      scene.add(ambientLight);
      const pointLight = new THREE.PointLight(0xff0000, 1, 100);
      pointLight.position.set(50, 50, 50);
      scene.add(pointLight);
      const sphereSize = 5;
      const pointLightHelper = new THREE.PointLightHelper(
        pointLight,
        sphereSize
      );
      scene.add(pointLightHelper);

      // 创建渲染器
      const renderer = new THREE.WebGLRenderer();
      renderer.setSize(box.clientWidth, box.clientHeight);
      box.appendChild(renderer.domElement);

      // 轨道控制器
      const controls = new OrbitControls(camera, renderer.domElement);

      const objects = [];
      const radius = 1;
      const widthSegments = 6;
      const heightSegments = 6;
      const sphereGeometry = new THREE.SphereGeometry(
        radius,
        widthSegments,
        heightSegments
      );
      //太阳系=太阳+地球
      const solarSystem = new THREE.Object3D();
      scene.add(solarSystem);
      objects.push(solarSystem);
      const sunMaterial = new THREE.MeshPhongMaterial({ emissive: 0xffff00 });
      const sunMesh = new THREE.Mesh(sphereGeometry, sunMaterial);
      sunMesh.scale.set(5, 5, 5);
      solarSystem.add(sunMesh);
      objects.push(sunMesh);
      const earthMaterial = new THREE.MeshPhongMaterial({
        color: 0x2233ff,
        emissive: 0x112244,
      });
      const earthMesh = new THREE.Mesh(sphereGeometry, earthMaterial);
      earthMesh.position.x = 10;
      solarSystem.add(earthMesh);
      objects.push(earthMesh);
      /**
       * 创建了一个 Object3D 。
       * 像 Mesh 一样，它也是场景图中的一个节点，
       * 但与 Mesh 不同的是，它没有材质（material）和几何体（geometry）。
       * 它只是代表一个局部空间。
       */
      //地球轨道=地球+月亮
      const earthOrbit = new THREE.Object3D();
      earthOrbit.position.x = 10;
      solarSystem.add(earthOrbit);
      objects.push(earthOrbit);
      const moonOrbit = new THREE.Object3D();
      moonOrbit.position.x = 2;
      earthOrbit.add(moonOrbit);
      const moonMaterial = new THREE.MeshPhongMaterial({
        color: 0x888888,
        emissive: 0x222222,
      });
      const moonMesh = new THREE.Mesh(sphereGeometry, moonMaterial);
      moonMesh.scale.set(0.5, 0.5, 0.5);
      moonOrbit.add(moonMesh);
      objects.push(moonMesh);

      // 为每个节点添加一个AxesHelper
      objects.forEach((node) => {
        const axes = new THREE.AxesHelper();
        axes.material.depthTest = false;
        axes.renderOrder = 1;
        node.add(axes);
      });

      //UI
      const gui = new GUI();
      function makeAxisGrid(node, label, units) {
        const helper = new AxisGridHelper(node, units);
        console.log(helper,"11111")
        gui.add(helper, "visible").name(label);
      }

      makeAxisGrid(solarSystem, "solarSystem", 25);
      makeAxisGrid(sunMesh, "sunMesh");
      makeAxisGrid(earthOrbit, "earthOrbit");
      makeAxisGrid(earthMesh, "earthMesh");
      makeAxisGrid(moonOrbit, "moonOrbit");
      makeAxisGrid(moonMesh, "moonMesh");

      // 动画渲染函数
      function animate(time) {
        objects.forEach((obj) => {
          obj.rotation.y = time/3000;
        });
        controls.update();
        requestAnimationFrame(animate);
        renderer.render(scene, camera);
      }
      animate();

      // 监听窗口变化
      window.addEventListener("resize", () => {
        renderer.setSize(box.clientWidth, box.clientHeight); //更新渲染器
        renderer.setPixelRatio(window.devicePixelRatio); //设置渲染器的像素比
        camera.aspect = box.clientWidth / box.clientHeight; //更新摄像头
        camera.updateProjectionMatrix(); //更新摄像机的投影矩阵
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
