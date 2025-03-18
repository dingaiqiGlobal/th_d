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
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";
import { FBXLoader } from "three/examples/jsm/loaders/FBXLoader.js";

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
      group: null, //模型
      /**
       * 游戏状态
       */
      state: {
        // 输入控制
        keys: {
          w: false,
          a: false,
          s: false,
          d: false,
          space: false,
          shift: false,
        },
        // 视角控制
        view: {
          yaw: 0, //偏航
          pitch: 0, //俯仰角
          mouseSensitivity: 0.002, //鼠标灵敏度
          pitchLimit: Math.PI / 3, //俯仰限制
        },
        // 物理参数
        physics: {
          velocity: new THREE.Vector3(), //高速
          speed: 0.1, //移动速度
          sprintMultiplier: 1.8, //冲刺倍率
          jumpForce: 0.2, //跳跃高度
          gravity: 0.01, //重力
          airborne: false, //升空
        },
        // 相机参数
        camera: {
          height: 0.7,
        },
      },
    };
  },
  mounted() {
    this.init();
  },
  methods: {
    init() {
      //场景
      this.scene = this.createScene();
      //天空盒
      this.createSkybox();
      //摄像机
      this.camera = this.createCamera();
      this.scene.add(this.camera);
      //坐标辅助
      const axesHelper = this.createAxesHelper();
      this.scene.add(axesHelper);
      const gridHelper = new THREE.GridHelper(100, 40);
      this.scene.add(gridHelper);
      //光源
      this.lightGroup = this.createLight();
      this.scene.add(this.lightGroup);
      //渲染器
      this.renderer = this.createRenderer();
      //帧率
      this.createStats();
      //窗口变化
      this.changeWindow();
      //城市模型
      this.createCity();
      //模型
      this.createModel();
      //UI
      this.createUI();
      //事件
      this.addDocumentEvent();
      //循环渲染
      this.animate();
    },
    createScene() {
      const scene = new THREE.Scene();
      return scene;
    },
    createSkybox() {
      //立方体纹理加载器（CubeTextureLoader）
      const urls = [0, 1, 2, 3, 4, 5].map(
        (k) => `images/icon/skybox/${k + 1}.png`
      );
      const textureCube = new THREE.CubeTextureLoader().load(urls);
      this.scene.background = textureCube;
    },
    createCamera() {
      let camera = new THREE.PerspectiveCamera(
        75,
        this.$refs.box.clientWidth / this.$refs.box.clientHeight,
        0.1,
        1000
      );
      camera.position.set(25, 25, 25);
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
    createCity() {
      new FBXLoader().load("data/model/city.FBX", (object3d) => {
        object3d.scale.multiplyScalar(0.01);
        object3d.position.set(0, -1, 0);
        this.scene.add(object3d);
      });
    },
    createModel() {
      new GLTFLoader().load("data/model/Fox.glb", (gltf) => {
        this.group = gltf.scene;
        this.scene.add(this.group);
        this.group.scale.multiplyScalar(0.01);
        this.group.rotation.y = Math.PI; // 修正朝向
        // 设置动画
        const mixer = new THREE.AnimationMixer(this.group);
        const action = mixer.clipAction(gltf.animations[1]);
        const clock = new THREE.Clock();
        this.group.mixerUpdate = () => mixer.update(clock.getDelta());
        action.play();
      });
    },
    addDocumentEvent() {
      // 鼠标锁定和视角控制
      // document.addEventListener("click", () =>
      //   document.body.requestPointerLock()
      // );
      //移动事件
      document.addEventListener("mousemove", (event) => {
        // if (document.pointerLockElement !== document.body) return;
        // 水平和垂直旋转
        this.state.view.yaw +=
          event.movementX * this.state.view.mouseSensitivity;
        this.state.view.pitch +=
          event.movementY * this.state.view.mouseSensitivity;
        // 限制垂直视角
        this.state.view.pitch = Math.max(
          -this.state.view.pitchLimit,
          Math.min(this.state.view.pitchLimit, this.state.view.pitch)
        );
        // 更新角色旋转
        if (this.group) this.group.rotation.y = this.state.view.yaw + Math.PI;
      });
      // 键盘输入处理
      document.addEventListener("keydown", ({ key }) => {
        switch (key.toLowerCase()) {
          case "w":
            this.state.keys.w = true;
            break;
          case "a":
            this.state.keys.a = true;
            break;
          case "s":
            this.state.keys.s = true;
            break;
          case "d":
            this.state.keys.d = true;
            break;
          case " ":
            this.state.keys.space = true;
            if (!this.state.physics.airborne) {
              this.state.physics.velocity.y = this.state.physics.jumpForce;
              this.state.physics.airborne = true;
            }
            break;
          case "shift":
            this.state.keys.shift = true;
            break;
        }
      });
      document.addEventListener("keyup", ({ key }) => {
        const k = key.toLowerCase();
        if (k in this.state.keys) this.state.keys[k] = false;
      });
    },
    updateModelAnimate() {
      if (!this.group) return;
      // 计算移动方向和速度
      const moveSpeed = this.state.keys.shift
        ? this.state.physics.speed * this.state.physics.sprintMultiplier
        : this.state.physics.speed;

      let [moveX, moveZ] = [0, 0];
      if (this.state.keys.w) moveZ = -1;
      if (this.state.keys.s) moveZ = 1;
      if (this.state.keys.a) moveX = -1;
      if (this.state.keys.d) moveX = 1;

      // 归一化对角线移动
      if (moveX !== 0 && moveZ !== 0) {
        const length = Math.sqrt(2);
        moveX /= length;
        moveZ /= length;
      }

      // 转换为世界坐标
      const rotation = this.state.view.yaw;
      const dx =
        (moveX * Math.cos(rotation) + moveZ * Math.sin(rotation)) * moveSpeed;
      const dz =
        (moveZ * Math.cos(rotation) - moveX * Math.sin(rotation)) * moveSpeed;

      // 应用重力和垂直运动??
      if (this.state.physics.airborne) {
        this.state.physics.velocity.y -= this.state.physics.gravity;
      }

      // 应用移动
      this.group.position.x += dx;
      this.group.position.z += dz;
      this.group.position.y += this.state.physics.velocity.y;

      // 检测地面碰撞
      if (this.group.position.y <= 0) {
        this.group.position.y = 0;
        this.state.physics.velocity.y = 0;
        this.state.physics.airborne = false;
      }

      // 更新动画
      this.group.mixerUpdate();

      // 更新相机
      const cameraRotation = new THREE.Quaternion().setFromEuler(
        new THREE.Euler(this.state.view.pitch, this.state.view.yaw, 0, "YXZ")
      );
      this.camera.position
        .copy(this.group.position)
        .add(new THREE.Vector3(0, this.state.camera.height, 0));
      this.camera.quaternion.copy(cameraRotation);
    },
    createUI() {
      const gui = new GUI({ width: 250 });
      // 相机设置
      const cameraFolder = gui.addFolder("相机设置");
      cameraFolder
        .add(this.state.camera, "height", 0.2, 2.0, 0.05)
        .name("相机高度");
      cameraFolder
        .add(this.camera, "fov", 60, 120, 1)
        .name("视野角度")
        .onChange(() => this.camera.updateProjectionMatrix());

      // 控制设置
      const controlFolder = gui.addFolder("控制设置");
      controlFolder
        .add(this.state.view, "mouseSensitivity", 0.0005, 0.005, 0.0001)
        .name("鼠标灵敏度");
      controlFolder
        .add(this.state.view, "pitchLimit", 0, Math.PI / 2, 0.05)
        .name("视角限制");

      // 移动设置
      const moveFolder = gui.addFolder("移动设置");
      moveFolder
        .add(this.state.physics, "speed", 0.05, 0.3, 0.01)
        .name("移动速度");
      moveFolder
        .add(this.state.physics, "sprintMultiplier", 1.2, 3.0, 0.1)
        .name("冲刺倍率");
      moveFolder
        .add(this.state.physics, "jumpForce", 0.1, 0.5, 0.01)
        .name("跳跃高度");
      moveFolder
        .add(this.state.physics, "gravity", 0.005, 0.03, 0.001)
        .name("重力");

      gui.domElement.style.cssText = "position:absolute;top:0;right:0;";
      // return gui;
    },
    animate() {
      this.stats.update();
      this.updateModelAnimate();
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
