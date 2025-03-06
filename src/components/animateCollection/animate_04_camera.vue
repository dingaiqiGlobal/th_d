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
import gsap from "gsap";

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
      //渲染器
      this.renderer = this.createRenderer();
      //控制器
      this.controls = this.createControls();
      //帧率
      this.createStats();
      //窗口变化W
      this.changeWindow();
      //天空盒
      this.createSkybox();
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
        50,
        this.$refs.box.clientWidth / this.$refs.box.clientHeight,
        0.1,
        1000
      );
      camera.position.set(20, 40, 60);
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

      let pointLight = new THREE.PointLight(0xffffff, 1, 0);
      pointLight.position.set(-10, 6, 10);

      lightGroup.add(pointLight);
      return lightGroup;
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
      controls.dampingFactor = 0.05;
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
    createSkybox() {
      const urls = [0, 1, 2, 3, 4, 5].map(
        (k) => `images/icon/skybox/${k + 1}.png`
      );
      const textureCube = new THREE.CubeTextureLoader().load(urls);
      this.scene.background = textureCube;
      new GLTFLoader().load("data/model/daodan.glb", (gltf) => {
        gltf.scene.traverse((child) => {
          if (child.isMesh) {
            child.material.envMap = textureCube; //环境贴图
          }
        });
        this.scene.add(gltf.scene);
      });
    },
    createUI() {
      const gui = new GUI();
      let shakeAnimation; //抖动动画
      const t = { type: "camera" };

      gui.add(t, "type", ["camera", "controlsTarget"]).name("类型");
      gui
        .add(
          {
            fn: () => {
              let c =
                t.type === "camera"
                  ? this.camera.position
                  : this.controls.target;
              const shakeIntensity = 6;
              const shakeDuration = 0.3;
              const shake = () => {
                const originalPosition = c.clone();
                shakeAnimation = gsap.timeline({ repeat: -1, yoyo: true });
                shakeAnimation.to(c, {
                  x:
                    originalPosition.x + (Math.random() - 0.5) * shakeIntensity,
                  y:
                    originalPosition.y + (Math.random() - 0.5) * shakeIntensity,
                  z:
                    originalPosition.z + (Math.random() - 0.5) * shakeIntensity,
                  duration: shakeDuration,
                  ease: "power1.inOut",
                });
              };
              shake();
            },
          },
          "fn"
        )
        .name("目标抖动");
      gui
        .add(
          {
            fn: () => {
              // 停止镜头抖动
              if (shakeAnimation) {
                shakeAnimation.kill();
                shakeAnimation = null;
              }
            },
          },
          "fn"
        )
        .name("停止抖动");
      gui
        .add(
          {
            fn: () => {
              const c = this.camera.position;
              const t = this.controls.target;
              const jumpHeight = 50;
              const jumpDuration = 0.5;
              const jump = () => {
                // 同时为相机位置和目标点添加跳跃动画
                [c, t].forEach((obj) => {
                  gsap.to(obj, {
                    y: obj.y + jumpHeight,
                    duration: jumpDuration,
                    ease: "power2.out",
                    yoyo: true,
                    repeat: 1,
                    onComplete: () => {},
                  });
                });
              };

              jump();
            },
          },
          "fn"
        )
        .name("整体跳跃");
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
