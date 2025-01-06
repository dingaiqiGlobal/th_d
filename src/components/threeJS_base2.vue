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
      // controls.enableDamping = true;
      // controls.dampingFactor = 0.05;
      // controls.autoRotate = true;

      // 动画渲染函数
      function animate() {
        controls.update();
        requestAnimationFrame(animate);
        renderer.render(scene, camera);
      }
      animate();

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
