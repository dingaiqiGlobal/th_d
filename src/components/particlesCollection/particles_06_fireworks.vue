<template>
  <div class="box" ref="box">
    <div class="control"></div>
  </div>
</template>

<script>
import * as THREE from "three";
import { OrbitControls } from "three/addons/controls/OrbitControls.js";
import Stats from "three/addons/libs/stats.module.js";

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

      textures: null, //贴图
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
      //加载贴图
      this.createTextures();
      //粒子效果
      setInterval(this.radomCreateFireWork, 600);
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
      camera.position.set(0, 0, 2);
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
    createTextures() {
      const textureLoader = new THREE.TextureLoader();
      this.textures = [
        textureLoader.load(require("@/assets/particles/fireworks/1.png")),
        textureLoader.load(require("@/assets/particles/fireworks/3.png")),
        textureLoader.load(require("@/assets/particles/fireworks/4.png")),
        textureLoader.load(require("@/assets/particles/fireworks/5.png")),
        textureLoader.load(require("@/assets/particles/fireworks/6.png")),
        textureLoader.load(require("@/assets/particles/fireworks/7.png")),
        textureLoader.load(require("@/assets/particles/fireworks/8.png")),
        textureLoader.load(require("@/assets/particles/fireworks/10.png")),
      ];
    },
    /**
     *
     * @param {粒子数目} count
     * @param {烟花位置} position
     * @param {烟花粒子大小} size
     * @param {纹理} texture
     * @param {烟花半径} radius
     * @param {颜色}color
     */
    createFireWork(count, position, size, texture, radius = 1, color) {
      if (!texture && texture instanceof THREE.Texture) return;
      // 反转纹理
      texture.flipY = false;
      const positionsArray = new Float32Array(count * 3);
      // 粒子的随机大小
      const sizeArray = new Float32Array(count);
      // 粒子的随机存在寿命
      const lifeArray = new Float32Array(count);
      for (let index = 0; index < count; index++) {
        const spherical = new THREE.Spherical(
          radius * (0.75 + (Math.random() - 0.5) * 0.25),
          Math.random() * Math.PI,
          Math.random() * Math.PI * 2
        );
        const position = new THREE.Vector3();
        position.setFromSpherical(spherical);
        positionsArray[index * 3] = position.x;
        positionsArray[index * 3 + 1] = position.y;
        positionsArray[index * 3 + 2] = position.z;
        sizeArray[index] = Math.random();
        // 粒子的寿命只能够在原有的基础上的更短，
        //这样烟花粒子就消失的更快,会在vs基于原有的寿命乘上这个值
        lifeArray[index] = Math.random() + 1;
      }

      //几何
      const geometry = new THREE.BufferGeometry();
      geometry.setAttribute(
        "position",
        new THREE.Float32BufferAttribute(positionsArray, 3)
      );
      geometry.setAttribute(
        "aSize",
        new THREE.Float32BufferAttribute(sizeArray, 1)
      );
      geometry.setAttribute(
        "aLife",
        new THREE.Float32BufferAttribute(lifeArray, 1)
      );
      //窗口大小
      const sizes = {
        width: window.innerWidth,
        height: window.innerHeight,
        resolution: null,
        pixelRatio: Math.min(window.devicePixelRatio, 2),
      };
      sizes.resolution = new THREE.Vector2(
        window.innerWidth * sizes.pixelRatio,
        window.innerHeight * sizes.pixelRatio
      );
      //材质
      const material = new THREE.ShaderMaterial({
        fragmentShader: `precision mediump float;
            uniform sampler2D uTexture;
            uniform vec3 uColor;
            varying vec2 vUv;
            uniform float uTime;
            varying vec3 vPosition;
            varying vec3 vNormal;
            void main(){
            // 注意开启材质透明
            float textureAlpha=texture(uTexture,gl_PointCoord).r;
            gl_FragColor=vec4(uColor, textureAlpha);
            // 引入three.js的内置shader代码。开启toneMapping和colorSpace
            #include <tonemapping_fragment>
            #include <colorspace_fragment> }`,
        vertexShader: `#include <common>
            precision mediump float;
            attribute float aSize;
            attribute float aLife;
            uniform float uTime;
            uniform float uSize;
            uniform vec2 uResolution;
            uniform float uProgress;
            varying vec3 vPosition;
            varying vec3 vNormal;
            float linearFunction (float x,float x1,float y1,float x2,float y2) {return x*((y2-y1)/(x2-x1))+(y2-((y2-y1)/(x2-x1))*x2);}
            void main(){
                /**
                * Position
                */
                vec3 newPosition=position;
                newPosition=newPosition;
                float vProgress=uProgress;
                vProgress*=aLife;
                //Explding
                // float explodingProgress=uProgress*((1.0-0)/(0.1-0));
                float explodingProgress=vProgress*10.0;
                explodingProgress=clamp(explodingProgress,0.0 ,1.0 );
                explodingProgress=1.0-pow(1.0-explodingProgress,3.0);
                newPosition*=explodingProgress;

                // Falling
                // fallingProgress
                float fallingProgress=linearFunction(vProgress,0.1,0.0,1.0,1.0);
                fallingProgress=clamp(fallingProgress,0.0 ,1.0 );
                fallingProgress=(1.0-pow(1.0-fallingProgress,3.0))*0.2;
                newPosition.y-=fallingProgress;

                //scalling
                float sizeOpenProgress=linearFunction(vProgress,0.0,0.0,0.125,1.0);
                float sizecCloseProgress=linearFunction(vProgress,0.125,1.0,1.0,0.0);
                float scallingProcess =min(sizecCloseProgress,sizecCloseProgress ) ;
                scallingProcess=clamp(scallingProcess,0.0 ,1.0 );

                //Twinkling
                float twinkProgreess=linearFunction(vProgress,0.2,0.0,0.8,1.0);
                twinkProgreess=clamp(twinkProgreess,0.0 ,1.0 );
                float twinkSize=sin(vProgress*30.0)*0.5+0.5;
                twinkSize=1.0-twinkProgreess*twinkSize;

                vec4 modelPosition=modelMatrix*vec4(newPosition,1.);
                vec4 viewPosition=viewMatrix*modelPosition;
                vec4 projectedPosition=projectionMatrix*viewPosition;
                gl_Position=projectedPosition;


                gl_PointSize=uSize*uResolution.y;
                gl_PointSize*=aSize;
                gl_PointSize*=scallingProcess;
                gl_PointSize*=twinkSize;
                // 实现粒子的透视效果，viewPosition为是模型视图变化后的posotion
                gl_PointSize*=(1.0/-viewPosition.z);
                if(gl_PointSize<1.0)gl_Position=vec4(9999.9);}`,
        uniforms: {
          uSize: new THREE.Uniform(size),
          // 屏幕分辨率
          uResolution: new THREE.Uniform(sizes.resolution),
          uTexture: new THREE.Uniform(texture),
          uColor: new THREE.Uniform(color),
          uProgress: new THREE.Uniform(0),
        },
        transparent: true,
        // 关闭粒子深度测试
        depthTest: false,
        // 开启混合
        blending: THREE.AdditiveBlending,
      });
      const fireWork = new THREE.Points(geometry, material);
      fireWork.position.copy(position);
      this.scene.add(fireWork);

      //销毁
      const destory = () => {
        this.scene.remove(fireWork);
        geometry.dispose(); //从内存中销毁对象
        material.dispose(); //从内存中销毁对象。
      };

      // 动画
      gsap.to(material.uniforms.uProgress, {
        value: 1,
        duration: 3,
        ease: "linear",
        onComplete: destory,
      });
    },
    //随机烟花
    radomCreateFireWork() {
      const count = Math.round(400 + Math.random() * 1000);
      const position = new THREE.Vector3(
        (Math.random() - 0.5) * 2,
        Math.random(),
        (Math.random() - 0.5) * 2
      );
      const size = 0.1 + Math.random() * 0.1;
      const texture =
        this.textures[Math.floor(Math.random() * this.textures.length)];
      const radius = 1 + Math.random();
      const color = new THREE.Color();
      color.setHSL(Math.random(), 1, 0.7);
      this.createFireWork(count, position, size, texture, radius, color);
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
