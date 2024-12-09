<template>
  <div class="box" ref="box">
    <div class="control"></div>
  </div>
</template>

<script>
import * as THREE from "three";
import { OrbitControls } from "three/addons/controls/OrbitControls.js"; //导入轨道控制器
//import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js"; //导入轨道控制器(也可以用)
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
      console.log(box.clientWidth, box.clientHeight);
      // 创建场景
      const scene = new THREE.Scene();
      // 创建相机
      const camera = new THREE.PerspectiveCamera(
        45, // 视角
        box.clientWidth / box.clientHeight, // 宽高比
        0.1, // 近平面
        1000 // 远平面
      );
      camera.position.z = 5;
      camera.position.y = 2;
      camera.position.x = 2;
      camera.lookAt(0, 0, 0);

      // 添加世界坐标辅助器
      const axesHelper = new THREE.AxesHelper(5);
      scene.add(axesHelper);

      // 创建渲染器
      const renderer = new THREE.WebGLRenderer();
      renderer.setSize(box.clientWidth, box.clientHeight);
      box.appendChild(renderer.domElement);

      // 创建几何体
      const geometry = new THREE.BoxGeometry(1, 1, 1);
      // 创建材质
      const material = new THREE.MeshBasicMaterial({ color: 0x00ff00 });
      const parentMaterial = new THREE.MeshBasicMaterial({ color: 0xff0000 });
      // 设置父元素材质为线框模式
      parentMaterial.wireframe = true;
      // 创建网格
      let parentCube = new THREE.Mesh(geometry, parentMaterial);
      const cube = new THREE.Mesh(geometry, material);
      parentCube.add(cube);
      parentCube.position.set(-3, 0, 0);
      parentCube.rotation.x = Math.PI / 4;
      // parentCube.scale.set(2, 2, 2);
      // cube.position.x = 2;
      cube.position.set(3, 0, 0);
      // 设置立方体的放大
      // cube.scale.set(2, 2, 2);
      // 绕着x轴旋转
      cube.rotation.x = Math.PI / 4;
      scene.add(parentCube); // 将网格添加到场景中

      // 添加轨道控制器
      const controls = new OrbitControls(camera, renderer.domElement);
      controls.enableDamping = true; // 设置带阻尼的惯性
      controls.dampingFactor = 0.05; // 设置阻尼系数
      controls.autoRotate = true; // 设置旋转速度

      // 渲染函数
      function animate() {
        controls.update();
        requestAnimationFrame(animate);
        // 旋转
        cube.rotation.x += 0.01;
        cube.rotation.y += 0.01;
        // 渲染
        renderer.render(scene, camera);
      }
      animate();

      // 监听窗口变化
      window.addEventListener("resize", () => {
        // 重置渲染器宽高比
        renderer.setSize(box.clientWidth, box.clientHeight);
        // 重置相机宽高比
        camera.aspect = box.clientWidth / box.clientHeight;
        // 更新相机投影矩阵
        camera.updateProjectionMatrix();
      });

      let eventObj = {
        Fullscreen: function () {
          // 全屏
          document.body.requestFullscreen();
          console.log("全屏");
        },
        ExitFullscreen: function () {
          document.exitFullscreen();
          console.log("退出全屏");
        },
      };

      // 创建GUI
      const gui = new GUI();
      // 添加按钮
      gui.add(eventObj, "Fullscreen").name("全屏");
      gui.add(eventObj, "ExitFullscreen").name("退出全屏");
      // 控制立方体的位置
      // gui.add(cube.position, "x", -5, 5).name("立方体x轴位置");
      let folder = gui.addFolder("立方体位置");
      folder
        .add(cube.position, "x")
        .min(-10)
        .max(10)
        .step(1)
        .name("立方体x轴位置")
        .onChange((val) => {
          console.log("立方体x轴位置", val);
        });
      folder
        .add(cube.position, "y")
        .min(-10)
        .max(10)
        .step(1)
        .name("立方体y轴位置")
        .onFinishChange((val) => {
          console.log("立方体y轴位置", val);
        });
      folder.add(cube.position, "z").min(-10).max(10).step(1).name("立方体z轴位置");

      gui.add(parentMaterial, "wireframe").name("父元素线框模式");

      let colorParams = {
        cubeColor: "#00ff00",
      };

      gui
        .addColor(colorParams, "cubeColor")
        .name("立方体颜色")
        .onChange((val) => {
          cube.material.color.set(val);
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
