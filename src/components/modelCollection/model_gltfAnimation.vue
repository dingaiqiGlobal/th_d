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
      settings: null, //UI设置集合
      clock: null, //时间
      model: null, //模型
      skeleton: null, //骨骼
      animations: null, //动画
      mixer: null, //动画混合器
      //动作
      actions: null,
      idleAction: null, //闲置
      walkAction: null, //行走
      runAction: null, //跑
      //权重
      idleWeight: null,
      walkWeight: null,
      runWeight: null,
      //单步执行
      singleStepMode: false,
      sizeOfNextStep: 0,

      //淡入淡出（混合权重控制）
      crossFadeControls: [],
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

      //地面+模型
      this.createPlane();
      this.createModel();
      //UI面板
      this.createPanel();
      //循环渲染
      this.animate();
    },
    createScene() {
      this.clock = new THREE.Clock(); //时间
      const scene = new THREE.Scene();
      scene.background = new THREE.Color(0xa0a0a0);
      scene.fog = new THREE.Fog(0xa0a0a0, 10, 50);
      return scene;
    },
    createCamera() {
      let camera = new THREE.PerspectiveCamera(
        45,
        this.$refs.box.clientWidth / this.$refs.box.clientHeight,
        1,
        100
      );
      camera.position.set(1, 2, -5);
      camera.lookAt(0, 2, 0);
      return camera;
    },
    createLight() {
      const lightGroup = new THREE.Group();
      //环境光
      let ambientLight = new THREE.AmbientLight(0x999999);
      lightGroup.add(ambientLight);
      //平行光
      const dirLight = new THREE.DirectionalLight(0xffffff, 3);
      dirLight.position.set(-3, 10, -10);
      dirLight.castShadow = true;
      dirLight.shadow.camera.top = 2; //平型光阴影计算
      dirLight.shadow.camera.bottom = -2;
      dirLight.shadow.camera.left = -2;
      dirLight.shadow.camera.right = 2;
      dirLight.shadow.camera.near = 0.1;
      dirLight.shadow.camera.far = 40;
      lightGroup.add(dirLight);
      return lightGroup;
    },
    createRenderer() {
      const box = this.$refs.box;
      const renderer = new THREE.WebGLRenderer();
      renderer.antialias = true; //抗锯齿
      renderer.setSize(box.clientWidth, box.clientHeight);
      box.appendChild(renderer.domElement);
      // 渲染器渲染阴影
      renderer.shadowMap.enabled = true;
      renderer.shadowMap.type = THREE.PCFSoftShadowMap;
      renderer.gammaInput = true;
      renderer.gammaOutput = true;
      return renderer;
    },
    createControls() {
      const controls = new OrbitControls(this.camera, this.renderer.domElement);
      controls.enableDamping = true; //开启阻尼
      controls.dampingFactor = 0.05;
      controls.screenSpacePanning = false;
      controls.minDistance = 3;
      controls.maxDistance = 20;
      controls.maxPolarAngle = Math.PI / 2;
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
    /**
     * 动画+render
     */
    animate() {
      this.idleWeight = this.idleAction.getEffectiveWeight(); //返回影响权重
      this.walkWeight = this.walkAction.getEffectiveWeight();
      this.runWeight = this.runAction.getEffectiveWeight();
      // 如果权重从"外部"修改（通过过渡效果），更新面板值
      this.updateWeightSliders();
      // 根据当前权重值启用/禁用过渡控制
      this.updateCrossFadeControls();
      // 获取上一帧到当前帧的时间差，用于混合器更新（非单步模式下）
      let mixerUpdateDelta = this.clock.getDelta(); //(时间差);
      // 如果在单步模式下，执行一步然后停止（直到用户再次点击）
      if (this.singleStepMode) {
        mixerUpdateDelta = this.sizeOfNextStep;
        this.sizeOfNextStep = 0;
      }
      this.mixer.update(mixerUpdateDelta); //更新动画混合器、状态面板，并渲染此帧

      // 更新轨道控制器的目标点
      if (this.model) {
        const cameraTarget = new THREE.Vector3();
        cameraTarget.copy(this.model.position);
        cameraTarget.y += 1;
        this.controls.target.copy(cameraTarget);
      }

      this.controls.update();
      this.stats.update();
      requestAnimationFrame(this.animate);
      this.renderer.render(this.scene, this.camera);
    },
    createPlane() {
      const mesh = new THREE.Mesh(
        new THREE.PlaneGeometry(100, 100),
        new THREE.MeshPhongMaterial({ color: 0xcbcbcb, depthWrite: false })
      );
      mesh.rotation.x = -Math.PI / 2;
      mesh.receiveShadow = true;
      this.scene.add(mesh);
    },
    createModel() {
      const loader = new GLTFLoader();
      loader.load("/data/model/Soldier.glb", (gltf) => {
        this.model = gltf.scene;
        this.scene.add(this.model);
        //递归投射阴影
        this.model.traverse((object) => {
          if (object.isMesh) object.castShadow = true;
        });
        //骨骼
        this.skeleton = new THREE.SkeletonHelper(this.model);
        this.skeleton.visible = false;
        this.scene.add(this.skeleton);
        //模型动画
        this.animations = gltf.animations;
        this.mixer = new THREE.AnimationMixer(this.model);
        this.idleAction = this.mixer.clipAction(this.animations[0]); //获取动作
        this.walkAction = this.mixer.clipAction(this.animations[3]);
        this.runAction = this.mixer.clipAction(this.animations[1]);
        this.actions = [this.idleAction, this.walkAction, this.runAction];

        this.activateAllActions(); //激活所有动画
        this.renderer.setAnimationLoop(this.animate()); //每帧都会调用的函数
      });
    },
    //UI面板
    createPanel() {
      const panel = new GUI({ width: 310 });

      const folder1 = panel.addFolder("可见性控制");
      const folder2 = panel.addFolder("动画激活/停用");
      const folder3 = panel.addFolder("暂停/步进");
      const folder4 = panel.addFolder("动画过渡");
      const folder5 = panel.addFolder("混合权重");
      const folder6 = panel.addFolder("全局速度");

      this.settings = {
        "show model": true,
        "show skeleton": false,
        "deactivate all": this.deactivateAllActions,
        "activate all": this.activateAllActions,
        "pause/continue": this.pauseContinue,
        "make single step": this.toSingleStepMode,
        "modify step size": 0.05,
        "from walk to idle": () => {
          this.prepareCrossFade(this.walkAction, this.idleAction, 1.0);
        },
        "from idle to walk": () => {
          this.prepareCrossFade(this.idleAction, this.walkAction, 0.5);
        },
        "from walk to run": () => {
          this.prepareCrossFade(this.walkAction, this.runAction, 2.5);
        },
        "from run to walk": () => {
          this.prepareCrossFade(this.runAction, this.walkAction, 5.0);
        },
        "use default duration": true,
        "set custom duration": 3.5,
        "modify idle weight": 0.0,
        "modify walk weight": 1.0,
        "modify run weight": 0.0,
        "modify time scale": 1.0,
      };

      folder1
        .add(this.settings, "show model")
        .name("显示模型")
        .onChange(this.showModel);
      folder1
        .add(this.settings, "show skeleton")
        .name("显示骨骼")
        .onChange(this.showSkeleton);
      folder2.add(this.settings, "deactivate all").name("停用所有");
      folder2.add(this.settings, "activate all").name("激活所有");
      folder3.add(this.settings, "pause/continue").name("暂停/继续");
      folder3.add(this.settings, "make single step").name("单步执行");
      folder3
        .add(this.settings, "modify step size", 0.01, 0.1, 0.001)
        .name("单步步长修改");
      //过渡动画先都放在一个数组中
      this.crossFadeControls.push(
        folder4.add(this.settings, "from walk to idle").name("从行走到待机")
      );
      this.crossFadeControls.push(
        folder4.add(this.settings, "from idle to walk").name("从待机到行走")
      );
      this.crossFadeControls.push(
        folder4.add(this.settings, "from walk to run").name("从行走到跑步")
      );
      this.crossFadeControls.push(
        folder4.add(this.settings, "from run to walk").name("从跑步到行走")
      );
      folder4.add(this.settings, "use default duration").name("使用默认时长");
      folder4
        .add(this.settings, "set custom duration", 0, 10, 0.01)
        .name("自定义时长");
      folder5
        .add(this.settings, "modify idle weight", 0.0, 1.0, 0.01)
        .name("待机权重")
        .listen()
        .onChange((weight) => {
          this.setWeight(this.idleAction, weight);
        });
      folder5
        .add(this.settings, "modify walk weight", 0.0, 1.0, 0.01)
        .name("行走权重")
        .listen()
        .onChange((weight) => {
          this.setWeight(this.walkAction, weight);
        });
      folder5
        .add(this.settings, "modify run weight", 0.0, 1.0, 0.01)
        .name("跑步权重")
        .listen()
        .onChange((weight) => {
          this.setWeight(this.runAction, weight);
        });
      folder6
        .add(this.settings, "modify time scale", 0.0, 1.5, 0.01)
        .name("时间缩放")
        .onChange(this.modifyTimeScale);

      folder1.open();
      folder2.open();
      folder3.open();
      folder4.open();
      folder5.open();
      folder6.open();
    },
    /**
     *可见性控制
     */
    showModel(visibility) {
      this.model.visible = visibility;
    },
    showSkeleton(visibility) {
      this.skeleton.visible = visibility;
    },
    /**
     * 动画激活与停用
     */
    deactivateAllActions() {
      this.actions.forEach(function (action) {
        action.stop();
      });
    },
    activateAllActions() {
      //先设置权重
      this.setWeight(this.idleAction, this.settings["modify idle weight"]);
      this.setWeight(this.walkAction, this.settings["modify walk weight"]);
      this.setWeight(this.runAction, this.settings["modify run weight"]);
      this.actions.forEach(function (action) {
        action.play();
      });
    },
    /**
     * 暂停/步进
     */
    pauseContinue() {
      //暂停/继续
      if (this.singleStepMode) {
        this.singleStepMode = false;
        this.unPauseAllActions();
      } else {
        if (this.idleAction.paused) {
          this.unPauseAllActions();
        } else {
          this.pauseAllActions();
        }
      }
    },
    toSingleStepMode() {
      this.unPauseAllActions(); //取消全部暂停
      //单步执行
      this.singleStepMode = true;
      this.sizeOfNextStep = this.settings["modify step size"];
    },
    pauseAllActions() {
      //全部暂停
      this.actions.forEach(function (action) {
        action.paused = true;
      });
    },
    unPauseAllActions() {
      //取消全部暂停
      this.actions.forEach(function (action) {
        action.paused = false;
      });
    },
    /**
     * 动画过渡crossFadeTo(最后写***)
     */
    //准备交叉变换
    prepareCrossFade(startAction, endAction, defaultDuration) {
      //根据用户选择切换默认/自定义过渡持续时间
      const duration = this.setCrossFadeDuration(defaultDuration);
      // 确保不在单步模式下，且所有动作都未暂停
      this.singleStepMode = false;
      this.unPauseAllActions();
      // 如果当前动作是'待机'idleAction（持续4秒），立即执行过渡
      // 否则等待当前动作完成其当前循环
      if (startAction === this.idleAction) {
        this.executeCrossFade(startAction, endAction, duration); //执行
      } else {
        this.synchronizeCrossFade(startAction, endAction, duration); //同步
      }
    },
    setCrossFadeDuration(defaultDuration) {
      if (this.settings["use default duration"]) {
        return defaultDuration;
      } else {
        return this.settings["set custom duration"];
      }
    },
    executeCrossFade(startAction, endAction, duration) {
      this.setWeight(endAction, 1); // 在开始过渡之前，确保结束动作的权重为1
      endAction.time = 0;
      // AnimationAction.crossFadeTo()过渡动画
      startAction.crossFadeTo(endAction, duration, true);
    },
    synchronizeCrossFade(startAction, endAction, duration) {
      this.mixer.addEventListener("loop", onLoopFinished);
      let _this=this;
      function onLoopFinished(event) {
        if (event.action === startAction) {
          _this.mixer.removeEventListener("loop", onLoopFinished);
          _this.executeCrossFade(startAction, endAction, duration);
        }
      }
    },

    /**
     * 混合权重
     */
    updateWeightSliders() {
      this.settings["modify idle weight"] = this.idleWeight;
      this.settings["modify walk weight"] = this.walkWeight;
      this.settings["modify run weight"] = this.runWeight;
    },
    setWeight(action, weight) {
      // 此函数是必需的，因为animationAction.crossFadeTo()会禁用其起始动作
      // 并将起始动作的时间缩放设置为((起始动画持续时间)/(结束动画持续时间))
      action.enabled = true;
      action.setEffectiveTimeScale(1);
      action.setEffectiveWeight(weight);
    },
    // 由渲染循环调用
    updateCrossFadeControls() {
      if (
        this.idleWeight === 1 &&
        this.walkWeight === 0 &&
        this.runWeight === 0
      ) {
        this.crossFadeControls[0].disable(); // 禁用从行走到待机
        this.crossFadeControls[1].enable(); // 启用从待机到行走
        this.crossFadeControls[2].disable(); // 禁用从行走到跑步
        this.crossFadeControls[3].disable(); // 禁用从跑步到行走
      }
    },
    /**
     *全局速度
     */
    modifyTimeScale(speed) {
      this.mixer.timeScale = speed; //时间缩放
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
