<template>
  <div class="box" ref="box">
    <div class="control"></div>
  </div>
</template>

<script>
import * as THREE from "three";
import { OrbitControls } from "three/addons/controls/OrbitControls.js"; //导入轨道控制器
import { GUI } from "three/examples/jsm/libs/lil-gui.module.min.js";

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
      camera.position.set(12, 12, 15);
      camera.lookAt(0, 0, 0);

      // 添加世界坐标辅助器
      const axesHelper = new THREE.AxesHelper(5);
      scene.add(axesHelper);

      // 创建渲染器
      const renderer = new THREE.WebGLRenderer();
      renderer.setSize(box.clientWidth, box.clientHeight);
      box.appendChild(renderer.domElement);

      // 添加轨道控制器
      const controls = new OrbitControls(camera, renderer.domElement);
      controls.enableDamping = true;
      controls.dampingFactor = 0.05;
      controls.autoRotate = true;

      //棋盘格&几何
      const planeSize = 40;
      const loader = new THREE.TextureLoader();
      const texture = loader.load(require("@/assets/texture/checker.png"));
      texture.wrapS = THREE.RepeatWrapping;
      texture.wrapT = THREE.RepeatWrapping;
      texture.magFilter = THREE.NearestFilter;
      const repeats = planeSize / 2;
      texture.repeat.set(repeats, repeats);
      const planeGeo = new THREE.PlaneGeometry(planeSize, planeSize);
      const planeMat = new THREE.MeshPhongMaterial({
        map: texture,
        side: THREE.DoubleSide,
      });
      const planeMesh = new THREE.Mesh(planeGeo, planeMat);
      planeMesh.rotation.x = Math.PI * -0.5;
      scene.add(planeMesh);

      const cubeSize = 4;
      const cubeGeo = new THREE.BoxGeometry(cubeSize, cubeSize, cubeSize);
      const cubeMat = new THREE.MeshPhongMaterial({ color: "#8AC" });
      const boxMesh = new THREE.Mesh(cubeGeo, cubeMat);
      boxMesh.position.set(cubeSize + 1, cubeSize / 2, 0);
      scene.add(boxMesh);
      const sphereRadius = 3;
      const sphereWidthDivisions = 32;
      const sphereHeightDivisions = 16;
      const sphereGeo = new THREE.SphereGeometry(
        sphereRadius,
        sphereWidthDivisions,
        sphereHeightDivisions
      );
      const sphereMat = new THREE.MeshPhongMaterial({ color: "#CA8" });
      const sphereMesh = new THREE.Mesh(sphereGeo, sphereMat);
      sphereMesh.position.set(-sphereRadius - 1, sphereRadius + 2, 0);
      scene.add(sphereMesh);

      /**
       * 光源
       */
      //环境光
      const color = 0xffffff;
      const intensity = 1;
      const ambientLight = new THREE.AmbientLight(color, intensity);
      scene.add(ambientLight);

      function animate() {
        controls.update();
        requestAnimationFrame(animate);
        renderer.render(scene, camera);
      }
      animate();

      window.addEventListener("resize", () => {
        renderer.setSize(box.clientWidth, box.clientHeight);
        renderer.setPixelRatio(window.devicePixelRatio);
        camera.aspect = box.clientWidth / box.clientHeight;
        camera.updateProjectionMatrix();
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
