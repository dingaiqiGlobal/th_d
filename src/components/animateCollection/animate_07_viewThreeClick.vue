<template>
  <div class="box" ref="box">
    <div class="control"></div>
  </div>
</template>

<script>
import * as THREE from "three";
import { OrbitControls } from "three/addons/controls/OrbitControls.js";
import Stats from "three/addons/libs/stats.module.js";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";
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
      group: null, //模型
      gsap: null,
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
      const gridHelper = new THREE.GridHelper(100, 20);
      this.scene.add(axesHelper, gridHelper);
      //光源
      this.lightGroup = this.createLight();
      this.scene.add(this.lightGroup);
      //渲染器
      this.renderer = this.createRenderer();
      //控制器
      this.controls = this.createControls();
      //帧率
      this.createStats();
      //窗口变化
      this.changeWindow();
      //模型
      this.createModel();
      //事件
      this.RayEvent();
      //循环渲染
      this.animate();
    },
    createScene() {
      const scene = new THREE.Scene();
      return scene;
    },
    createCamera() {
      let camera = new THREE.PerspectiveCamera(
        75,
        this.$refs.box.clientWidth / this.$refs.box.clientHeight,
        0.1,
        1000
      );
      camera.position.set(5, 5, 5);
      camera.lookAt(0, 0, 0);
      return camera;
    },
    createAxesHelper() {
      const axesHelper = new THREE.AxesHelper(5);
      return axesHelper;
    },
    createLight() {
      const lightGroup = new THREE.Group();
      let ambientLight = new THREE.AmbientLight(0xffffff, 4);
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
    createModel() {
      new GLTFLoader().load("data/model/Soldier.glb", (gltf) => {
        this.group = gltf.scene;
        this.scene.add(this.group);
        //模型动画
        const clock = new THREE.Clock(); // 时钟
        const mixer = new THREE.AnimationMixer(this.group); // 动画混合器
        //给group添加属性
        this.group.mixerAnimateRender = () => mixer.update(clock.getDelta()); // 动画帧
        this.group.currentAction = mixer.clipAction(gltf.animations[3]); // walk 动画
      });
    },
    RayEvent() {
      this.renderer.domElement.addEventListener("click", (event) => {
        const mouse = new THREE.Vector2(
          (event.offsetX / event.target.clientWidth) * 2 - 1,
          -(event.offsetY / event.target.clientHeight) * 2 + 1
        );
        const raycaster = new THREE.Raycaster(); //射线
        raycaster.setFromCamera(mouse, this.camera);
        /**
         * 相交平面添加图形
         */
        const plane = new THREE.Plane(new THREE.Vector3(0, 1, 0), 0); // 碰撞面
        const targetPositon = new THREE.Vector3(); // 目标位置
        raycaster.ray.intersectPlane(plane, targetPositon); //相交平面
        const mesh = new THREE.Mesh(
          new THREE.BoxGeometry(0.1, 0.1, 0.1),
          new THREE.MeshBasicMaterial()
        );
        mesh.position.copy(targetPositon);
        this.scene.add(mesh);
        this.goAddress(this.group, targetPositon);
      });
    },
    goAddress(group, targetPositon) {
      this.gsap?.kill(); // 停止上一个动画
      const distance = group.position.distanceTo(targetPositon); // 距离
      const vector = this.camera.position.clone().sub(group.position); // camera 和 group 差向量
      group.lookAt(targetPositon); // 模型朝向
      group.rotation.y += Math.PI; // 朝向纠正
      const duration = distance / 3; // 距离 / 速度
      this.gsap = gsap.to(group.position, {
        ...targetPositon,
        duration,
        ease: "none",
        onStart: () => {
          this.controls.enabled = false; // 禁止控制
          group.currentAction.play(); // 播放动画
        },
        onUpdate: () => {
          group.mixerAnimateRender(); // 动画帧
          this.controls.target.copy(group.position); // 目标跟随
          this.camera.position.lerp(group.position.clone().add(vector), 0.1); // 相机跟随
        },
        onComplete: () => (this.controls.enabled = true), // 恢复控制
      });
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
