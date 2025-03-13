<template>
  <div class="box" ref="box">
    <div class="control"></div>
    <div id="provinceInfo" ref="provinceInfo"></div>
  </div>
</template>

<script>
/**
 * npm i d3 --save
 * d3中将经纬度转为坐标值，使用的是d3的d3-geo
 * （这种添加方法不推荐，在vue有未知bug）
 */
import * as THREE from "three";
import { OrbitControls } from "three/addons/controls/OrbitControls.js";
import Stats from "three/addons/libs/stats.module.js";
import * as d3 from "d3";

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
      raycaster: null, //射线
      mouse: null, //鼠标
      activeInstersect: null, //选中对象
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
      //几何
      this.loadMapData();
      //坐标辅助
      const axesHelper = this.createAxesHelper();
      this.scene.add(axesHelper);
      //光源
      this.lightGroup = this.createLight();
      this.scene.add(this.lightGroup);
      //渲染器
      this.renderer = this.createRenderer();
      //射线事件
      this.RayEvent();
      //控制器
      this.controls = this.createControls();
      //帧率
      this.createStats();
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

    render() {
      this.stats.update();
      requestAnimationFrame(this.render);
      //更新鼠标事件
      this.raycaster.setFromCamera(this.mouse, this.camera);
      const intersects = this.raycaster.intersectObjects(
        this.scene.children,
        true
      );
      if (this.activeInstersect && this.activeInstersect.length > 0) {
        this.activeInstersect.forEach((element) => {
          // 将上一次选中的恢复颜色
          element.object.material[0].color.set("#02A1E2");
          element.object.material[1].color.set("#3480C4");
        });
      }
      this.activeInstersect = [];
      for (var i = 0; i < intersects.length; i++) {
        if (
          intersects[i].object.material &&
          intersects[i].object.material.length === 2
        ) {
          this.activeInstersect.push(intersects[i]);
          intersects[i].object.material[0].color.set(0xff0000);
          intersects[i].object.material[1].color.set(0xff0000);
          break; // 只取第一个
        }
      }
      this.InfoWindow()//提示窗
      this.renderer.render(this.scene, this.camera);
    },
    //地图
    loadMapData() {
      let loader = new THREE.FileLoader();
      loader.load("/data/json/guangdong.json", (data) => {
        let jsonData = JSON.parse(data);
        this.initMap(jsonData);
      });
    },
    initMap(chinaJson) {
      let map = new THREE.Object3D();
      //墨卡托投影转换(并设置投影中心点、缩放、平移)
      //以中心点在three中定位
      const projection = d3
        .geoMercator()
        .center([113.625702,23.698261])
        .scale(80)
        .translate([0, 0]);
      chinaJson.features.forEach(function (elem) {
        const province = new THREE.Object3D(); //省份
        const coordinates = elem.geometry.coordinates; //每个坐标数组
        coordinates.forEach(function (multiPolygon) {
          multiPolygon.forEach(function (polygon) {
            const shape = new THREE.Shape(); //形状
            const lineMaterial = new THREE.LineBasicMaterial({
              color: "white",
            });
            const lineGeometry = new THREE.BufferGeometry();
            const vertices = [];
            for (let i = 0; i < polygon.length; i++) {
              const [x, y] = projection(polygon[i]); //坐标转换
              if (i === 0) {
                shape.moveTo(x, -y); //??
              }
              shape.lineTo(x, -y); //??
              vertices.push(x, -y, 4.01);
            }
            const positionAttribute = new THREE.Float32BufferAttribute(
              vertices,
              3
            );
            lineGeometry.setAttribute("position", positionAttribute);
            //挤出
            const geometry = new THREE.ExtrudeGeometry(shape, {
              depth: 4, //挤出深度
              bevelEnabled: false, //对挤出的形状应用是否斜角
            });
            const material = new THREE.MeshBasicMaterial({
              color: "#02A1E2", //线颜色
              transparent: true,
              opacity: 0.6,
            });
            const material1 = new THREE.MeshBasicMaterial({
              color: "#3480C4", //侧面颜色
              transparent: true,
              opacity: 0.5,
            });
            const mesh = new THREE.Mesh(geometry, [material, material1]); //??
            const line = new THREE.Line(lineGeometry, lineMaterial);
            province.add(mesh);
            province.add(line);
          });
        });
        province.properties = elem.properties;
        map.add(province);
      });
      this.scene.add(map);
    },
    //鼠标事件
    RayEvent() {
      this.raycaster = new THREE.Raycaster();
      this.mouse = new THREE.Vector2();
      const provinceInfo = this.$refs.provinceInfo; //UI信息框

      const box = this.$refs.box;
      const boxHeight = box.clientHeight;
      const boxWidth = box.clientWidth;
      let _this = this;
      function onMouseMove(event) {
        const px = event.offsetX;
        const py = event.offsetY;
        _this.mouse.x = (px / boxWidth) * 2 - 1;
        _this.mouse.y = -(py / boxHeight) * 2 + 1;
        //UI信息框
        provinceInfo.style.left = event.offsetX + 2 + "px";
        provinceInfo.style.top = event.offsetY + 2 + "px";
      }
      this.renderer.domElement.addEventListener(
        "mousemove",
        onMouseMove,
        false
      );
    },
    InfoWindow() {
        const provinceInfo = this.$refs.provinceInfo;
      if (
        this.activeInstersect.length !== 0 &&
        this.activeInstersect[0].object.parent.properties.name
      ) {
        let properties = this.activeInstersect[0].object.parent.properties;
        provinceInfo.textContent = properties.name;
        provinceInfo.style.visibility = "visible";
      } else {
        provinceInfo.style.visibility = "hidden";
      }
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
#provinceInfo {
  position: absolute;
  z-index: 2;
  background: white;
  padding: 10px;
  visibility: hidden;
}
</style>
