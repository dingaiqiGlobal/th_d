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
      //UI折叠
      fogFolder: null,
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
      //模型
      this.createModel();
      //渲染器
      this.renderer = this.createRenderer();
      //控制器
      this.controls = this.createControls();
      //帧率
      this.createStats();
      //窗口变化
      this.changeWindow();
      //UI
      this.createUI();
      //循环渲染
      this.animate();
    },
    createScene() {
      const scene = new THREE.Scene();
      return scene;
    },
    createCamera() {
      let camera = new THREE.PerspectiveCamera(
        60,
        this.$refs.box.clientWidth / this.$refs.box.clientHeight,
        0.1,
        1000
      );
      camera.position.set(0, 20, 60);
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
      const directionalLight = new THREE.DirectionalLight(0xffffff, 1);
      directionalLight.position.set(0, 100, 0);
      lightGroup.add(directionalLight);
      return lightGroup;
    },
    createModel() {
      new GLTFLoader().load("/data/model/Fox.glb", (gltf) => {
        gltf.scene.position.set(0, 0, -500);
        this.scene.add(gltf.scene);
      });
      new GLTFLoader().load("/data/model/foorGround.glb", (gltf) => {
        const model = gltf.scene;
        model.position.z += 60;
        model.position.x -= 200;
        model.scale.set(10, 10, 10);
        this.scene.add(model);
      });
    },
    createRenderer() {
      const box = this.$refs.box;
      const renderer = new THREE.WebGLRenderer();
      renderer.antialias = true; //抗锯齿
      renderer.setSize(box.clientWidth, box.clientHeight);
      box.appendChild(renderer.domElement);
      return renderer;
    },
    createControls() {
      const controls = new OrbitControls(this.camera, this.renderer.domElement);
      controls.enableDamping = true;
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
    createUI() {
      const folder = new GUI();
      const fogOption = {
        type: this.scene.fog instanceof THREE.FogExp2 ? "exp2" : "linear",
        enable: !!this.scene.fog, //等价于  enable:this.scene.fog || false
      };
      folder
        .add(fogOption, "type", ["linear", "exp2"])
        .name("雾类型")
        .onChange((type) => {
          this.scene.fog = getFog(type, this.scene.fog?.color);
          setFogFolder(type);
        });
      folder
        .add(fogOption, "enable")
        .name("启用雾")
        .onChange((boole) => {
          if (boole) {
            this.scene.fog = getFog(fogOption.type);
          } else {
            this.scene.fog = null;
          }
          setFogFolder(fogOption.type);
        });

      let _this = this;
      function getFog(type, color) {
        _this.renderer.setClearColor(color || 0xffffff); //设置场景颜色透明度
        if (type === "linear") {
          return new THREE.Fog(color || 0xffffff, 10, 800);
        } else {
          return new THREE.FogExp2(color || 0xffffff, 0.005);
        }
      }
      function setFogFolder(type) {
        if (_this.fogFolder) {
          _this.fogFolder.destroy?.(); //调用销毁
          _this.fogFolder = null;
        }
        if (!_this.scene.fog) return;

        _this.fogFolder = folder.addFolder(type + "雾"); //标签
        _this.fogFolder
          .addColor(_this.scene.fog, "color")
          .name("颜色")
          .onChange((v) => _this.renderer.setClearColor(v));
        if (type === "linear") {
          _this.fogFolder.add(_this.scene.fog, "near").name("近点");
          _this.fogFolder.add(_this.scene.fog, "far").name("远点");
        } else {
          _this.fogFolder
            .add(_this.scene.fog, "density")
            .name("密度")
            .min(0)
            .max(0.1)
            .step(0.00001);
        }
      }
    },

    //通过选择类型，具体展现详细配置

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
