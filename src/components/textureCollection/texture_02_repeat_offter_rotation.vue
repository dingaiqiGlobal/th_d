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
    return {
      texture: null,
      /**
       * 默认情况下，three.js中的纹理是不重复的。
       * 要设置纹理是否重复，有2个属性，
       * wrapS 用于水平包裹，
       * wrapT 用于垂直包裹。
       * 它们可以被设置为一下其中一个
       */
      wrapModes: {
        ClampToEdgeWrapping: THREE.ClampToEdgeWrapping, //每条边上的最后一个像素无限重复
        RepeatWrapping: THREE.RepeatWrapping, //纹理重复
        MirroredRepeatWrapping: THREE.MirroredRepeatWrapping, //在每次重复时将进行镜像
      },
    };
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
      controls.enableDamping = true;
      controls.dampingFactor = 0.05;
      controls.autoRotate = true;

      //几何
      const geometry = new THREE.BoxGeometry(1, 1, 1);
      const loader = new THREE.TextureLoader();
      this.texture = loader.load(require("@/assets/texture/flower-1.jpg"));
      const material = new THREE.MeshBasicMaterial({
        map: this.texture,
      });
      const cube = new THREE.Mesh(geometry, material);
      scene.add(cube);

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

      //UI
      const gui = new GUI();
      gui
        .add(
          this.stringToNumberHelper(this.texture, "wrapS"),
          "value",
          this.wrapModes
        )
        .name("texture.wrapS")
        .onChange(this.updateTexture);
      gui
        .add(
          this.stringToNumberHelper(this.texture, "wrapT"),
          "value",
          this.wrapModes
        )
        .name("texture.wrapT")
        .onChange(this.updateTexture);
      gui.add(this.texture.repeat, "x", 0, 5, 0.01).name("texture.repeat.x");
      gui.add(this.texture.repeat, "y", 0, 5, 0.01).name("texture.repeat.y");
      gui.add(this.texture.offset, "x", -2, 2, 0.01).name("texture.offset.x");
      gui.add(this.texture.offset, "y", -2, 2, 0.01).name("texture.offset.y");
      gui.add(this.texture.center, "x", -0.5, 1.5, 0.01).name("texture.center.x");
      gui.add(this.texture.center, "y", -0.5, 1.5, 0.01).name("texture.center.y");
      gui
        .add(this.degRadHelper(this.texture, "rotation"), "value", -360, 360)
        .name("texture.rotation");
    },
    updateTexture() {
      this.texture.needsUpdate = true;
    },
    stringToNumberHelper(obj, prop) {
      return {
        get value() {
          return this._getObj()[this._getProp()];
        },
        set value(v) {
          this._getObj()[this._getProp()] = parseFloat(v);
        },
        // 私有方法，用于闭包中访问外部变量
        _getObj: function () {
          return obj;
        },
        _getProp: function () {
          return prop;
        },
      };
    },
    degRadHelper(obj, prop) {
      return {
        get value() {
          return THREE.MathUtils.radToDeg(obj[prop]);
        },
        set value(v) {
          obj[prop] = THREE.MathUtils.degToRad(v);
        },
      };
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
