<template>
  <div class="box" ref="box">
    <div class="control"></div>
  </div>
</template>

<script>
import * as THREE from "three";
import { OrbitControls } from "three/addons/controls/OrbitControls.js";
import Stats from "three/addons/libs/stats.module.js";

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

      particles: 50000, //粒子数量
      mesh: null, //粒子物体
      snowMaterial: null, //雪花材质
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
      //粒子效果
      this.createPoint();
      //循环渲染
      this.animate();
    },
    createScene() {
      const scene = new THREE.Scene();
      return scene;
    },
    createCamera() {
      let camera = new THREE.PerspectiveCamera(
        40,
        this.$refs.box.clientWidth / this.$refs.box.clientHeight,
        0.1,
        10000
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
      controls.autoRotate = true;
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
    createPoint() {
      const geometry = new THREE.BufferGeometry();
      let positions = new Float32Array(this.particles * 3);
      for (let i = 0; i < this.particles * 3; i += 3) {
        positions[i] = Math.random() * 200 - 100;
        positions[i + 1] = Math.random() * 200 - 100;
        positions[i + 2] = Math.random() * 200 - 100;
      }
      geometry.setAttribute(
        "position",
        new THREE.Float32BufferAttribute(positions, 3)
      );
      //雪花材质
      this.snowMaterial = new THREE.PointsMaterial({
        size: 2,
        blending: THREE.AdditiveBlending,
        transparent: true,
      });
      this.snowMaterial.onBeforeCompile = (shader) => {
        //在编译shader程序之前立即执行的可选回调。此函数使用shader源码作为参数。用于修改内置材质
        shader.uniforms.uColor = {
          value: new THREE.Color(0xffffff),
        };

        shader.fragmentShader = shader.fragmentShader.replace(
          `#include <common>`,
          `#include <common>
           uniform vec3 uColor;
            `
        );
        shader.fragmentShader = shader.fragmentShader.replace(
          `#include <premultiplied_alpha_fragment>`,
          `#include <premultiplied_alpha_fragment>
           float distanceLen = distance(gl_PointCoord,vec2(0.5));
           distanceLen = 1.0 - distanceLen;
           distanceLen = pow(distanceLen,10.0);
           vec4 color = vec4(uColor,distanceLen);
           // if(color.a<0.1)
           //discard;
            gl_FragColor = color;
           `
        );
      };
      this.mesh = new THREE.Points(geometry, this.snowMaterial);
      this.scene.add(this.mesh);
    },
    update() {
      if (this.snowMaterial) {
        const positions = this.mesh.geometry.getAttribute("position").array;
        for (let i = 0; i < positions.length; i += 3) {
          positions[i + 1] -= 0.1;
          positions[i] -= Math.sin(i) * 0.1;
          positions[i + 2] -= Math.sin(i) * 0.1;
          if (positions[i + 1] < -100) {
            positions[i + 1] = 100;
          }
        }
        this.mesh.geometry.getAttribute("position").needsUpdate = true;
      }
    },
    animate() {
      this.update();
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
