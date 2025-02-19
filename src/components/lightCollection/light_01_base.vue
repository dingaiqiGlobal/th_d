<template>
  <div class="box" ref="box">
    <div class="control">
      <el-button-group>
        <el-button
          type="primary"
          icon="el-icon-arrow-left"
          @click="handleAddition"
          >+</el-button
        >
        <el-button type="primary"
          >-<i
            class="el-icon-arrow-right el-icon--right"
            @click="handleSubtraction"
          ></i
        ></el-button>
      </el-button-group>
    </div>
  </div>
</template>

<script>
/**
 * 阴影效果
 * 光源：开启castShadow（PointLight，SpotLight，DirectionalLight）
 * 物体mesh：开启castShadow(投射阴影)
 * 地面或者其他mesh：开启receiveShadow(接收阴影)
 * 渲染器：开启shadowMap(阴影贴图)
 */
import * as THREE from "three";
import { OrbitControls } from "three/addons/controls/OrbitControls.js";

export default {
  name: "Base",
  data() {
    return {
      scene: null,
      camera: null,
      renderer: null,
      controls: null,
      lightGroup: null,
      step: 1,
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
      //几何体
      const geom = this.createGeom();
      this.scene.add(geom);
      //渲染器
      this.renderer = this.createRenderer();
      //控制器
      this.controls = this.createControls();
      //窗口变化
      this.changeWindow();
      //循环渲染
      this.render();
    },
    createScene() {
      const scene = new THREE.Scene();
      return scene;
    },
    createCamera() {
      let camera = new THREE.PerspectiveCamera(
        45,
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
      // 点光源
      if (this.step == 1) {
        let pointLight = new THREE.PointLight(0xffaa00, 1, 5000);
        pointLight.position.set(-5, -4, 5);
        pointLight.castShadow = true; //透视阴影
        lightGroup.add(pointLight);
        //光源圆球
        let sphereGeometry = new THREE.SphereGeometry(0.2, 16, 16);
        let sphereMaterial = new THREE.MeshBasicMaterial({ color: 0xff2200 });
        let lightSphere = new THREE.Mesh(sphereGeometry, sphereMaterial);
        lightSphere.position.set(-5, -4, 5);
        lightGroup.add(lightSphere);
      }
      //平行光
      if (this.step == 2) {
        let directionalLight = new THREE.DirectionalLight(0xffaa00);
        directionalLight.position.set(-5, 5, 15);
        let target = new THREE.Object3D();
        target.position.set(0, -5, 0);
        directionalLight.target = target;
        directionalLight.castShadow = true;
        lightGroup.add(directionalLight);
        //平行光线
        let lineGeometry = new THREE.BufferGeometry();
        const vertices = new Float32Array([-5, 4, 15, 0, -5, 0]);
        lineGeometry.setAttribute(
          "position",
          new THREE.BufferAttribute(vertices, 3)
        );
        const colors = new Float32Array([1, 0, 0, 1, 0, 0]);
        lineGeometry.setAttribute(
          "color",
          new THREE.BufferAttribute(colors, 3)
        );
        let singleLineMaterial = new THREE.LineBasicMaterial({
          color: 0xff2200,
          vertexColors: true, //是否使用顶点颜色
        });
        let line = new THREE.Line(lineGeometry, singleLineMaterial);
        lightGroup.add(line);
      }
      //聚光灯
      if (this.step == 3) {
        let target = new THREE.Object3D();
        target.position.set(0, -5, 0);
        let spotLight = new THREE.SpotLight(0xaaccff, 1, 0, Math.PI / 6, 0.01);
        spotLight.position.set(0, 20, 10);
        spotLight.target = target; // 设置目标物体
        spotLight.castShadow = true;
        lightGroup.add(spotLight);
      }
      //环境光
      if (this.step == 4) {
        let ambientLight = new THREE.AmbientLight(0x1a1005);
        lightGroup.add(ambientLight);
      }
      return lightGroup;
    },
    createGeom() {
      const group = new THREE.Group();
      let groundMaterial = new THREE.MeshPhongMaterial({
        shininess: 80,
        color: 0xffffff,
        specular: 0xffffff,
      });
      let planeGeometry = new THREE.PlaneGeometry(100, 100);
      let ground = new THREE.Mesh(planeGeometry, groundMaterial);
      ground.position.set(0, -5, 0);
      ground.rotation.x = -Math.PI / 2;
      ground.scale.set(1000, 1000, 1000);
      ground.receiveShadow = true; //投射阴影
      group.add(ground);

      let geom = new THREE.BoxGeometry(2, 15, 2);
      let cubeMaterial = new THREE.MeshPhongMaterial({ color: 0xffffff });
      let cube = new THREE.Mesh(geom, cubeMaterial);
      cube.position.set(0, 3, 0);
      cube.rotation.y = -Math.PI / 8;
      cube.material.color.offsetHSL(0.1, -0.1, 0);
      cube.castShadow = true; //投射阴影
      group.add(cube);

      return group;
    },
    createRenderer() {
      const box = this.$refs.box;
      const renderer = new THREE.WebGLRenderer();
      renderer.setSize(box.clientWidth, box.clientHeight);
      box.appendChild(renderer.domElement);
      // 渲染器渲染阴影
      renderer.shadowMap.enabled = true;
      // 软阴影(默认：THREE.PCFShadowMap)
      renderer.shadowMap.type = THREE.PCFSoftShadowMap;
      // 所有纹理和颜色进行γ
      renderer.gammaInput = true;
      // 所有的纹理和颜色都需要进行γ输出
      renderer.gammaOutput = true;
      return renderer;
    },
    createControls() {
      const controls = new OrbitControls(this.camera, this.renderer.domElement);
      controls.enableDamping = true;
      controls.dampingFactor = 0.05;
      controls.autoRotate = true;
      return controls;
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
    render() {
      this.controls.update();
      requestAnimationFrame(this.render);
      this.renderer.render(this.scene, this.camera);
    },
    handleAddition() {
      this.step < 4 ? this.step++ : (this.step = 1);
      this.scene.remove(this.lightGroup);
      this.lightGroup = this.createLight();
      this.scene.add(this.lightGroup);
    },
    handleSubtraction() {
      this.step > 1 ? this.step-- : (this.step = 4);
      this.scene.remove(this.lightGroup);
      this.lightGroup = this.createLight();
      this.scene.add(this.lightGroup);
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
