<template>
  <div class="box" ref="box">
    <div class="control">
    </div>
  </div>
</template>

<script>
import * as THREE from "three";
import { OrbitControls } from "three/addons/controls/OrbitControls.js"; //导入轨道控制器

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
      camera.position.set(2, 2, 5);
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

      //创建几何体
      /**
       * 不是所有的几何体类型都支持多种材质。
       * BoxGeometry-6种
       * ConeGeometry-2种
       * CylinderGeometry-3种
       */
      /**
       * 等待多个纹理加载
       * 要等到所有纹理都加载完毕，
       * 可以使用 LoadingManager 。
       * 创建一个并将其传递给 TextureLoader，
       * 然后将其onLoad属性设置为回调
       */
      const loadManager = new THREE.LoadingManager();
      const loader = new THREE.TextureLoader(loadManager);
      const geometry = new THREE.BoxGeometry(1, 1, 1);
      const materials = [
        new THREE.MeshBasicMaterial({
          map: loader.load(require("@/assets/texture/flower-1.jpg")),
        }),
        new THREE.MeshBasicMaterial({
          map: loader.load(require("@/assets/texture/flower-2.jpg")),
        }),
        new THREE.MeshBasicMaterial({
          map: loader.load(require("@/assets/texture/flower-3.jpg")),
        }),
        new THREE.MeshBasicMaterial({
          map: loader.load(require("@/assets/texture/flower-4.jpg")),
        }),
        new THREE.MeshBasicMaterial({
          map: loader.load(require("@/assets/texture/flower-5.jpg")),
        }),
        new THREE.MeshBasicMaterial({
          map: loader.load(require("@/assets/texture/flower-6.jpg")),
        }),
      ];
      loadManager.onLoad = () => {
        const cube = new THREE.Mesh(geometry, materials);
        scene.add(cube);
      };

      // 动画渲染函数
      function animate() {
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
