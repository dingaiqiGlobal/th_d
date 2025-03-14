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
import Heatmap from "heatmap.js";

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
      //窗口变化
      this.changeWindow();
      //热力图
      this.createHeatMap();
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
    createHeatMap() {
      const getRandom = (max, min) =>
        Math.round((Math.random() * (max - min + 1) + min) * 10) / 10;
      // console.log(Heatmap)
      //用法特殊，Heatmap暴露出是个对象
      let heatmap = Heatmap.create({
        container: document.createElement("div"),
        width: 256,
        height: 256,
        blur: "0.8",
        radius: 10,
      });
      //创建坐标
      let i = 0,
        max = 10,
        data = [];
      while (i < 2000) {
        data.push({
          x: getRandom(1, 256),
          y: getRandom(1, 256),
          value: getRandom(1, 6),
        });
        i++;
      }
      heatmap.setData({
        max: max,
        data: data,
      });
      const texture = new THREE.CanvasTexture(heatmap._renderer.canvas);
      const geometry = new THREE.PlaneGeometry(50, 50, 1000, 1000);
      geometry.rotateX(-Math.PI * 0.5);
      const material = new THREE.ShaderMaterial({
        uniforms: {
          heightMap: { value: texture },
          heightRatio: { value: 5 },
        },
        vertexShader: `	uniform sampler2D heightMap;
			uniform float heightRatio;
			varying vec2 vUv;
			varying float hValue;
			varying vec3 cl;
			void main() {
			    vUv = uv;
			    vec3 pos = position;
		        cl = texture2D(heightMap, vUv).rgb;
		        hValue = texture2D(heightMap, vUv).r;
		        pos.y = hValue * heightRatio;
		        gl_Position = projectionMatrix * modelViewMatrix * vec4(pos,1.0);
		    }`,
        fragmentShader: `varying float hValue;
			varying vec3 cl;
			void main() {
		 		float v = abs(hValue - 1.);
		 		gl_FragColor = vec4(cl, .8 - v * v) ; 
		    }`,
        transparent: true,
      });
      const mesh = new THREE.Mesh(geometry, material);
      this.scene.add(mesh);
      //UI
      new GUI()
        .add(mesh.material.uniforms.heightRatio, "value", 1, 15)
        .name("heightRatio");
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
