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

import { EffectComposer } from "three/examples/jsm/postprocessing/EffectComposer.js";
import { RenderPass } from "three/examples/jsm/postprocessing/RenderPass.js";
import { OutputPass } from "three/examples/jsm/postprocessing/OutputPass.js";
import { ShaderPass } from "three/examples/jsm/postprocessing/ShaderPass.js";

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
      //后期处理
      composer: null,
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
      //物体
      this.createMesh();
      //后期处理
      this.createComposer();
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
        2000
      );
      camera.position.set(10, 10, 10);
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
    createMesh() {
      let geometry = new THREE.BoxGeometry(1, 1, 1);
      for (let i = 0; i < 100; i++) {
        let material = new THREE.MeshStandardMaterial({
          color: 0xffffff * Math.random(),
        });
        let mesh = new THREE.Mesh(geometry, material);
        mesh.position.x = Math.random() * 10 - 5;
        mesh.position.y = Math.random() * 10 - 5;
        mesh.position.z = Math.random() * 10 - 5;
        this.scene.add(mesh);
      }
    },
    createComposer() {
      this.composer = new EffectComposer(this.renderer);
      const renderPass = new RenderPass(this.scene, this.camera);
      this.composer.addPass(renderPass);
      let outputPass = new OutputPass();
      this.composer.addPass(outputPass);
      //shader
      let finalMaterial = new THREE.ShaderMaterial({
        uniforms: {
          baseTexture: { value: null },
          saturation: { value: 0.2 },
          brightness: { value: 0.2 },
        },
        vertexShader: `
            varying vec2 vUv;
            void main(){
                vUv = uv;
                gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );
            }
        `,
        fragmentShader: `

            vec3 hsv2rgb( in vec3 c ){
                vec3 rgb = clamp( abs(mod(c.x*6.0+vec3(0.0,4.0,2.0),6.0)-3.0)-1.0, 0.0, 1.0 );

                return c.z * mix( vec3(1.0), rgb, c.y);
            }

            vec3 rgbToHsv(vec3 rgb){
                vec3 hsv = vec3(0);
                float maxC = max(max(rgb.r,rgb.g),rgb.b);
                float minC = min(min(rgb.r,rgb.g),rgb.b);
                float delta = maxC - minC;
                if (maxC == rgb.r) hsv.x = mod((rgb.g - rgb.b)/delta,6.0)/6.0;
                if (maxC == rgb.g) hsv.x = (rgb.b - rgb.r)/(delta*6.0) + 1.0/3.0;
                if (maxC == rgb.b) hsv.x = (rgb.r - rgb.g)/(delta*6.0) + 2.0/3.0;
                hsv.y = delta/maxC;
                hsv.z = maxC;
                return hsv;
            }

            varying vec2 vUv;
            uniform sampler2D tDiffuse;
            uniform float saturation;
            uniform float brightness;
            void main(){
                vec4 col = texture2D(tDiffuse,vUv);

                vec3 hsvCol = rgbToHsv(col.rgb);
                hsvCol.y *= saturation;
                hsvCol.z *= brightness;
                vec3 col2 = hsv2rgb(hsvCol);
                gl_FragColor = vec4(col2,col.a);

                #include <colorspace_fragment>
            }
        `,
      });
      let finalPass = new ShaderPass(finalMaterial);
      this.composer.addPass(finalPass);

      let gui = new GUI();
      gui
        .add(finalMaterial.uniforms.saturation, "value", 0, 1, 0.01)
        .name("饱和度");
      gui
        .add(finalMaterial.uniforms.brightness, "value", 0, 1, 0.01)
        .name("亮度");
    },
    animate() {
      this.controls.update();
      this.stats.update();
      requestAnimationFrame(this.animate);
      this.renderer.render(this.scene, this.camera);
      this.composer.render();//必须在最后
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
