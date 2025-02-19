<template>
  <div class="box" ref="box">
    <div class="control"></div>
  </div>
</template>

<script>
import { GUI } from "three/examples/jsm/libs/lil-gui.module.min.js";
import * as THREE from "three";
import { OrbitControls } from "three/addons/controls/OrbitControls.js";
import Stats from "three/addons/libs/stats.module.js";
import { GLTFLoader } from "three/addons/loaders/GLTFLoader.js";

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
      //物体
      model: null,
      mesh: null,
      plane: null,
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
      this.light = this.createLight();
      this.scene.add(this.light);
      //模型&&物体
      this.createMeshModel();
      //渲染器
      this.renderer = this.createRenderer();
      //UI
      this.createUI();
      //控制器
      this.controls = this.createControls();
      //帧率
      this.createStats();
      //窗口变化
      this.changeWindow();
      //循环渲染
      this.animate();
    },
    createScene() {
      const scene = new THREE.Scene();
      return scene;
    },
    createCamera() {
      let camera = new THREE.PerspectiveCamera(
        50,
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
      //平行光
      const directionalLight = new THREE.DirectionalLight(0xffffff, 1);
      directionalLight.position.set(0, 400, 0);
      directionalLight.castShadow = true;
      return directionalLight;
    },
    createRenderer() {
      const renderer = new THREE.WebGLRenderer();
      renderer.shadowMap.needsUpdate = true; //允许在场景中使用阴影贴图
      renderer.shadowMap.enabled = true; //下次render调用时刷新
      const box = this.$refs.box;
      renderer.setSize(box.clientWidth, box.clientHeight);
      box.appendChild(renderer.domElement);
      return renderer;
    },
    createControls() {
      const controls = new OrbitControls(this.camera, this.renderer.domElement);
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
    createMeshModel() {
      //模型
      const loader = new GLTFLoader();
      loader.load("/data/model/Fox.glb", (gltf) => {
        this.model = gltf.scene;
        this.model.scale.set(0.01, 0.01, 0.01);
        this.scene.add(this.model);
        //递归投射阴影
        this.model.traverse((object) => {
          if (object.isMesh) object.castShadow = true;
        });
      });
      //物体
      this.mesh = new THREE.Mesh(
        new THREE.BoxGeometry(1, 1, 1),
        new THREE.MeshStandardMaterial({ color: 0xffffff })
      );
      this.mesh.castShadow = true;
      this.mesh.position.set(3, 1, 1);
      this.scene.add(this.mesh);
      //平面
      this.plane = new THREE.Mesh(
        new THREE.PlaneGeometry(100, 100),
        new THREE.MeshStandardMaterial({ color: 0xffffff })
      );
      this.plane.position.y -= 0.5;
      this.plane.rotation.x = -Math.PI / 2;
      this.plane.receiveShadow = true;
      this.scene.add(this.plane);
    },
    createUI() {
      //UI
      const folder = new GUI();
      const shadowMapList = {
        Basic: THREE.BasicShadowMap,
        PCF: THREE.PCFShadowMap,
        PCFSoft: THREE.PCFSoftShadowMap,
        VSM: THREE.VSMShadowMap,
      };
      folder
        .add(this.renderer.shadowMap, "enabled")
        .name("shadowEnabled")
        .onChange(() => {
          this.scene.traverse((object) => {
            if (object.material) object.material.needsUpdate = true;
          });
        });
      folder
        .add(this.renderer.shadowMap, "type", shadowMapList)
        .name("shadowType")
        .onChange(() => {
          this.scene.traverse((object) => {
            if (object.material) object.material.needsUpdate = true;
          });
        });
      folder.add(this.plane, "receiveShadow").name("planeShadow");
        folder.add(this.mesh, "castShadow").name("boxShadow");
        folder.add(this.light, "castShadow").name("lightShadow");
    },

    animate() {
      this.controls.update();
      this.stats.update();
      requestAnimationFrame(this.animate);
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
