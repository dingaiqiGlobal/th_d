<template>
  <div class="box" ref="box">
    <div class="control"></div>
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
      // 创建透视相机
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

      //创建几何体并添加到场景中
      const geometry = new THREE.BoxGeometry(1, 1, 1);
      const material = new THREE.MeshBasicMaterial({ color: "#42adff" });
      const cube = new THREE.Mesh(geometry, material);
      cube.position.set(3, 0, 0); //位置
      cube.scale.set(1, 1, 1); //缩放
      cube.rotation.set(-Math.PI / 4, 0, 0, "XZY"); //旋转
      scene.add(cube);

      /**
       * 方式1
       * 基础
       */
      //   function animate() {
      //     cube.position.x += 0.01;
      //     cube.rotation.x += 0.01;
      //     if (cube.position.x > 5) {
      //       cube.position.x = 0;
      //     }
      //     renderer.render(scene, camera);
      //     requestAnimationFrame(animate);
      //   }
      //   animate();

      /**
       * 方式2
       * 解决确保不同帧率的画面运行速度一致
       */
      //   function animate(time) {
      //     let t = (time / 1000) % 5; //1m/s的匀速运动
      //     cube.position.x = t * 1;
      //     cube.rotation.x += 0.01;
      //     if (cube.position.x > 5) {
      //       cube.position.x = 0;
      //     }
      //     renderer.render(scene, camera);
      //     requestAnimationFrame(animate);
      //   }
      //   animate();
      /**
       * 方式3
       * Clock跟踪时间处理动画
       */
        const clock = new THREE.Clock(); //用clock对象用于跟踪时间
        function animate() {
          let time = clock.getElapsedTime();
          // console.log("时钟运行总时长：", time);
          // let deltaTime = clock.getDelta();
          // console.log("2帧之间的时间间隔：", deltaTime);
          let t=time % 5;
          cube.position.x = t * 1;
          cube.rotation.x += 0.01;
          if (cube.position.x > 5) {
            cube.position.x = 0;
          }
          renderer.render(scene, camera);
          requestAnimationFrame(animate);
        }
        animate();

      /**
       * 方式4
       * GSAP模块-未写
       */

      // 监听窗口变化
      window.addEventListener("resize", () => {
        renderer.setSize(box.clientWidth, box.clientHeight);//更新渲染器
        renderer.setPixelRatio(window.devicePixelRatio);//设置渲染器的像素比
        camera.aspect = box.clientWidth / box.clientHeight;//更新摄像头
        camera.updateProjectionMatrix();//更新摄像机的投影矩阵
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
