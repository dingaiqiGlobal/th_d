<template>
  <div class="box" ref="box">
    <div class="control"></div>
  </div>
</template>

<script>
import * as THREE from "three";
import { OrbitControls } from "three/addons/controls/OrbitControls.js";
import Stats from "three/addons/libs/stats.module.js";
import proj4 from "proj4";

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
      //贴图
      map: null,
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
      //窗口变化
      this.changeWindow();
      //贴图
      this.createTexture();
      //3D
      this.create3d();
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
      camera.position.set(0, 0, 500);
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
    createTexture() {
      this.map = new THREE.TextureLoader().load(
        require("@/assets/texture/lmap.png")
      );
      this.map.wrapS = THREE.RepeatWrapping;
      this.map.wrapT = THREE.RepeatWrapping;
      this.map.needsUpdate = true;
    },
    async create3d() {
      const group = new THREE.Group();
      const geoJson = await fetch("data/json/chinaBound.json").then((res) =>
        res.json()
      );
      geoJson.features.forEach((i) => {
        if (i.geometry.type === "MultiPolygon") {
          i.geometry.coordinates.forEach((j) =>
            j.forEach((z) => this.createShapeWithCoord(z, group))
          );
        } else if (i.geometry.type === "Polygon") {
          i.geometry.coordinates.forEach((j) =>
            this.createShapeWithCoord(j, group)
          );
        } else if (i.geometry.type === "LineString") {
          i.geometry.coordinates.length > 1 &&
            this.createShapeWithCoord(i.geometry.coordinates, group);
        }
      });
      this.scene.add(group);
      this.translationOriginForGroup(group);
    },
    createShapeWithCoord(coordinates, group) {
      if (coordinates.length < 1000) return; // 设置点数限制 如果点太少则不绘制
      const curvePoints = coordinates.map((item) => {
        let lonLat = proj4("EPSG:4326", "EPSG:3857", item);
        const [x, y] = lonLat;
        const slace = 10000;
        return new THREE.Vector3(x / slace, y / slace, 0); //3维向量（因为曲线需要三维向量）
      });
      const curve = new THREE.CatmullRomCurve3(curvePoints); //平滑曲线
      const geometry = new THREE.TubeGeometry( //管道
        curve,
        curvePoints.length - 1,
        1,
        40,
        false
      );
      const material = new THREE.MeshPhongMaterial({
        color: 0xffffff,
        map: this.map, //贴图
        transparent: true, //透明
      });
      const mesh = new THREE.Mesh(geometry, material);
      this.translationOriginForMesh(mesh); //重新定义中心
      group.attach(mesh); //attach将object作为子级来添加到该对象中，同时保持该object的世界变换
    },
    translationOriginForGroup(group) {
      const boundingBox = new THREE.Box3().setFromObject(group); // 计算模型的包围盒
      boundingBox.getCenter(group.position); // 计算模型的中心点
      // 变换子模型位置
      group.traverse((c) => {
        c.isMesh && c.position.sub(group.position);
        c.initTranslate = c.position.clone();
      });
      group.position.set(0, 0, 0); // 重置模型位置
    },
    translationOriginForMesh(mesh) {
      const boundingBox = new THREE.Box3().setFromObject(mesh);
      boundingBox.getCenter(mesh.position);
      mesh.geometry.center();
    },
    animate() {
      requestAnimationFrame(this.animate);
      this.controls.update();
      this.stats.update();
      this.map.offset.x += 0.001;
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
