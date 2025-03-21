<template>
  <div class="box" ref="box">
    <div class="control"></div>
  </div>
</template>

<script>
/**
 * Material.onBeforeCompile ( shader : Shader, renderer : WebGLRenderer )
 * 在编译shader程序之前立即执行的可选回调。此函数使用shader源码作为参数。用于修改内置材质
 */
import * as THREE from "three";
import { OrbitControls } from "three/addons/controls/OrbitControls.js";
import Stats from "three/addons/libs/stats.module.js";
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

      //效果集合
      renderList: [],
      clock: new THREE.Clock(),
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
        50,
        this.$refs.box.clientWidth / this.$refs.box.clientHeight,
        0.1,
        100000
      );
      camera.position.set(0, 400, 1000);
      camera.lookAt(0, 0, 0);
      return camera;
    },
    createAxesHelper() {
      const axesHelper = new THREE.AxesHelper(5);
      return axesHelper;
    },
    createLight() {
      const lightGroup = new THREE.Group();
      let ambientLight = new THREE.AmbientLight(0xadadad);
      lightGroup.add(ambientLight);

      let directionalLight = new THREE.DirectionalLight(0xffffff, 0.5);
      directionalLight.position.set(600, 600, 0);

      lightGroup.add(directionalLight);
      return lightGroup;
    },
    createRenderer() {
      const box = this.$refs.box;
      const renderer = new THREE.WebGLRenderer({
        antialias: true, //抗锯齿
        alpha: true,
        logarithmicDepthBuffer: true, //对数深度缓冲区
      });

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
      const obj = {
        CITY_UNTRIANGULATED: (model, group) => {
          // 城市建筑
          const { geometry, position, material } = model;

          // 模型线框化
          const lienMaterial = new THREE.LineBasicMaterial({
            color: "#2685fe",
          });
          const lineBox = new THREE.LineSegments(
            new THREE.EdgesGeometry(geometry, 1),
            lienMaterial
          );
          lineBox.position.copy(position);
          // 模型坐标系与WebGL坐标系不同需要处理
          lineBox.rotateX(-Math.PI / 2);
          group.add(lineBox);

          // 在原先材质效果的基础上修改shader
          //在编译shader程序之前立即执行的可选回调。此函数使用shader源码作为参数。用于修改内置材质
          material.onBeforeCompile = (shader) => {
            material.color = new THREE.Color("#0e233d");
            material.transparent = true;
            material.opacity = 0.9;
            this.applyGrowShader(shader);
            this.applyRiseShader(shader);
            this.applySpreadShader(shader);
            this.applySweepShader(shader);
          };
          lienMaterial.onBeforeCompile = (shader) => {
            this.applyGrowShader(shader);
          };
        },
        LANDMASS: (model) => {
          // 地面
          const material = model.material;
          material.color = new THREE.Color("#040912");
          material.transparent = true;
          material.opacity = 0.8;
        },
        ROADS: (model) => {
          // 道路
          const material = model.material;
          material.color = new THREE.Color("#292e4c");
        },
      };

      new FBXLoader().load("data/model/shanghai.FBX", (cityScene) => {
        const group = new THREE.Group();
        cityScene.children.forEach((item) => {
          const clonedData = item.clone();
          //根据不同属性渲染不同材质
          obj[clonedData.name]?.(clonedData, group);
          group.add(clonedData);
        });
        this.scene.add(group);
      });
    },
    /**
     * 对于shader内容的修改，需要根据具体内容进行处理
     * shader中会存在#include <begin_vertex>等语句，这些事three定义的glsl，
     * 具体脚本内容查看three源码中renderer/shaders/shaderChunk下对应脚本文件
     * 而修改shader就是在对应的脚本语句后修改脚本或增加语句
     */
    //生长着色器
    applyGrowShader(shader) {
      shader.uniforms.uProgress = { value: 0 };
      shader.vertexShader = `
        uniform float uProgress;
        ${shader.vertexShader}
      `;
      shader.vertexShader = shader.vertexShader.replace(
        "#include <begin_vertex>",
        `#include <begin_vertex>
        transformed.z = position.z * min(uProgress, 1.0);`
      );
      this.renderList.push((progress) => {
        shader.uniforms.uProgress.value = progress;
      });
    },
    //上升（建筑物环）着色器
    applyRiseShader(shader) {
      shader.uniforms.uRiseTime = { value: 0 };
      shader.uniforms.uRiseColor = { value: new THREE.Color("#87CEEB") };
      shader.vertexShader = shader.vertexShader.replace(
        "#include <common>",
        `#include <common>
        varying vec3 vTransformedNormal;
        varying float vHeight;`
      );
      shader.vertexShader = shader.vertexShader.replace(
        "#include <begin_vertex>",
        `#include <begin_vertex>
        vTransformedNormal = normalize(normal);
        vHeight = transformed.z;`
      );

      shader.fragmentShader = shader.fragmentShader.replace(
        "#include <common>",
        `#include <common>
        uniform vec3 uRiseColor;
        uniform float uRiseTime;
        varying float vHeight;
        varying vec3 vTransformedNormal;
        vec3 riseLine() {
            float smoothness = 1.8;
            float speed = uRiseTime;
            bool isTopBottom = (vTransformedNormal.z > 0.0 || vTransformedNormal.z < 0.0) && vTransformedNormal.x == 0.0 && vTransformedNormal.y == 0.0;
            float ratio = isTopBottom ? 0.0 : smoothstep(speed, speed + smoothness, vHeight) - smoothstep(speed + smoothness, speed + smoothness * 2.0, vHeight);
            return uRiseColor * ratio;
        }`
      );
      shader.fragmentShader = shader.fragmentShader.replace(
        "#include <dithering_fragment>",
        `#include <dithering_fragment>
        gl_FragColor = gl_FragColor + vec4(riseLine(), 1.0);`
      );
      this.renderList.push((time) => {
        shader.uniforms.uRiseTime.value = time * 30.0;
      });
    },
    // 扩散波效果
    applySpreadShader(shader) {
      shader.uniforms.uSpreadTime = { value: 0 };
      shader.uniforms.uSpreadColor = { value: new THREE.Color("#9932CC") };
      shader.vertexShader = shader.vertexShader.replace(
        "#include <common>",
        `#include <common>
            varying vec2 vTransformedPosition;`
      );
      shader.vertexShader = shader.vertexShader.replace(
        "#include <begin_vertex>",
        `#include <begin_vertex>
        vTransformedPosition = vec2(position.x, position.y);`
      );
      shader.fragmentShader = shader.fragmentShader.replace(
        "#include <common>",
        `#include <common>
        uniform vec3 uSpreadColor;
        uniform float uSpreadTime;
        varying vec2 vTransformedPosition;
        vec3 spread() {
            vec2 center = vec2(0.0);
            float smoothness = 60.0;
            float start = mod(uSpreadTime, 1800.0);
            float distance = length(vTransformedPosition - center);
            float ratio = smoothstep(start, start + smoothness, distance) - smoothstep(start + smoothness, start + smoothness * 2.0, distance);
            return uSpreadColor * ratio;
        }`
      );
      shader.fragmentShader = shader.fragmentShader.replace(
        "#include <dithering_fragment>",
        `#include <dithering_fragment>
        gl_FragColor = gl_FragColor + vec4(spread(), 1.0);`
      );
      this.renderList.push((time) => {
        shader.uniforms.uSpreadTime.value = time * 200.0;
      });
    },
    applySweepShader(shader) {
      shader.uniforms.uSweepTime = { value: 0 };
      shader.uniforms.uSweepColor = { value: new THREE.Color("#00FFFF") };
      shader.vertexShader = shader.vertexShader.replace(
        "#include <common>",
        `#include <common>
        varying vec2 vSweepPosition;`
      );
      shader.vertexShader = shader.vertexShader.replace(
        "#include <begin_vertex>",
        `#include <begin_vertex>
        vSweepPosition = vec2(position.x, position.y);`
      );
      shader.fragmentShader = shader.fragmentShader.replace(
        "#include <common>",
        `#include <common>
        uniform vec3 uSweepColor;
        uniform float uSweepTime;
        varying vec2 vSweepPosition;
        vec3 sweep() {
            vec2 center = vec2(0.0);
            float smoothness = 60.0;
            float start = mod(uSweepTime, 1800.0) - 800.0;
            float ratio = smoothstep(start, start + smoothness, vSweepPosition.x) - smoothstep(start + smoothness, start + smoothness * 2.0, vSweepPosition.x);
            return uSweepColor * ratio;
        }`
      );
      shader.fragmentShader = shader.fragmentShader.replace(
        "#include <dithering_fragment>",
        `#include <dithering_fragment>
        gl_FragColor = gl_FragColor + vec4(sweep(), 1.0);`
      );
      this.renderList.push((time) => {
        shader.uniforms.uSweepTime.value = time * 160.0;
      });
    },
    animate() {
      //粒子
      this.renderList.forEach((fn) => fn(this.clock.getElapsedTime()));
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
