<template>
  <div class="box" ref="box">
    <div class="control">
      <div class="image-picker">
        <div
          v-for="item in imgItems"
          :key="item.name"
          class="image-item"
          @click="handleImageClick(item)"
        >
          <img :src="item.src" :alt="item.name" />
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import * as THREE from "three";
import { TrackballControls } from "three/examples/jsm/controls/TrackballControls"; //导入轨迹球控制器
import { ParametricGeometry } from "three/examples/jsm/geometries/ParametricGeometry";

export default {
  name: "Base",
  data() {
    return {
      scene: null,
      camera: null,
      renderer: null,
      light: null,
      controls: null,
      imgItems: [
        {
          name: "white",
          src: require("@/assets/texture/matcap/matcap-porcelain-white.jpg"),
        },
        {
          name: "diamond",
          src: require("@/assets/texture/matcap/matcap-diamond.png"),
        },
        {
          name: "pink",
          src: require("@/assets/texture/matcap/matcap-pink.jpg"),
        },
        { name: "red", src: require("@/assets/texture/matcap/matcap-red.jpg") },
        {
          name: "fire",
          src: require("@/assets/texture/matcap/matcap-fire.jpg"),
        },
        {
          name: "meng",
          src: require("@/assets/texture/matcap/matcap-meng.png"),
        },
        {
          name: "blue",
          src: require("@/assets/texture/matcap/matcap-blue.png"),
        },
        {
          name: "deepblue",
          src: require("@/assets/texture/matcap/matcap-deep-blue.png"),
          bg: "0xcccccc",
        },
        {
          name: "black",
          src: require("@/assets/texture/matcap/matcap-black.jpg"),
          bg: "0xcccccc",
        },
        {
          name: "leopard",
          src: require("@/assets/texture/matcap/matcap-leopard.png"),
          bg: "0xcccccc",
        },
        {
          name: "metal",
          src: require("@/assets/texture/matcap/matcap-metal.png"),
          bg: "0xcccccc",
        },
      ],
      //材质设置
      material: null,
    };
  },
  mounted() {
    this.initScene();
  },
  methods: {
    initScene() {
      let box = this.$refs.box;
      this.scene = new THREE.Scene();
      this.renderer = new THREE.WebGLRenderer();
      this.renderer.setSize(box.clientWidth, box.clientHeight);
      box.appendChild(this.renderer.domElement);
      this.addCamera();
      this.addControls();
      this.addAxesHelper();
      let kleinGeom = this.createKleinGeom();
      this.scene.add(kleinGeom);
      this.animate();
      // 监听窗口变化
      window.addEventListener("resize", () => {
        this.renderer.setSize(box.clientWidth, box.clientHeight);
        this.renderer.setPixelRatio(window.devicePixelRatio);
        this.camera.aspect = box.clientWidth / box.clientHeight;
        this.camera.updateProjectionMatrix();
      });
    },
    addCamera() {
      this.camera = new THREE.PerspectiveCamera(
        45,
        this.$refs.box.clientWidth / this.$refs.box.clientHeight,
        0.1,
        1000
      );
      this.camera.position.set(25, 25, 25);
      this.camera.lookAt(0, 0, 0);
    },
    addAxesHelper() {
      const axesHelper = new THREE.AxesHelper(5);
      this.scene.add(axesHelper);
    },
    addControls() {
      // 轨迹球控制器
      // TrackballControls 与 OrbitControls 相类似。
      // 然而，它不能恒定保持摄像机的up向量
      this.controls = new TrackballControls(
        this.camera,
        this.renderer.domElement
      );
      this.controls.rotateSpeed = 8.0;
      this.controls.zoomSpeed = 1.0;
      this.controls.panSpeed = 1.0;
    },
    animate() {
      this.controls.update();
      requestAnimationFrame(this.animate);
      this.renderer.render(this.scene, this.camera);
    },
    createKleinGeom() {
      // 参数化缓冲几何体（ParametricGeometry）
      // 生成由参数表示其表面的几何体
      let geom = new ParametricGeometry(this.klein, 64, 64);
      this.material = new THREE.MeshMatcapMaterial({
        matcap: new THREE.TextureLoader().load(
          require("@/assets/texture/matcap/matcap-porcelain-white.jpg")
        ),
        side: THREE.DoubleSide,
      });
      return new THREE.Mesh(geom, this.material);
    },

    //克莱因瓶函数
    klein(v, u, target) {
      u *= Math.PI;
      v *= 2 * Math.PI;
      u = u * 2;
      var x, y, z;
      if (u < Math.PI) {
        x =
          3 * Math.cos(u) * (1 + Math.sin(u)) +
          2 * (1 - Math.cos(u) / 2) * Math.cos(u) * Math.cos(v);
        z =
          -8 * Math.sin(u) -
          2 * (1 - Math.cos(u) / 2) * Math.sin(u) * Math.cos(v);
      } else {
        x =
          3 * Math.cos(u) * (1 + Math.sin(u)) +
          2 * (1 - Math.cos(u) / 2) * Math.cos(v + Math.PI);
        z = -8 * Math.sin(u);
      }
      y = -2 * (1 - Math.cos(u) / 2) * Math.sin(v);
      target.set(x, y, z);
    },

    handleImageClick(item) {
      const matcap = new THREE.TextureLoader().load(item.src);
      //更新material属性（重要）
      this.material.matcap = matcap; 
      //背景色
      if (item.bg) {
        this.renderer.setClearColor(new Number(item.bg).valueOf());
      } else {
        this.renderer.setClearColor(0x000000);
      }
    },
  },
};
</script>

<style scoped="less">
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
.image-picker {
  position: fixed;
  .image-item {
    cursor: pointer;
    img {
      width: 13%;
      height: auto;
      display: block;
      border-radius: 50%;
      box-shadow: 0 0 10px rgba(255, 255, 255, 0.6);
    }
  }
}
</style>
