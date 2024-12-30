import * as THREE from "three";
class AxisGridHelper {
  constructor(node, units = 10) {
    const axes = new THREE.AxesHelper();
    axes.material.depthTest = false;
    axes.renderOrder = 2; // 在网格渲染之后再渲染
    node.add(axes);

    const grid = new THREE.GridHelper(units, units);
    grid.material.depthTest = false;
    grid.renderOrder = 1;
    node.add(grid);

    this.grid = grid;
    this.axes = axes;
    this.visible = false;
  }
  /**
   * 自定义get和set的方法
   * 设置AxisGridHelper的属性_visible(给类添加属性)
   *
   * 希望它创建一个复选框，所以我们需要指定一个 bool 属性。
   * 希望坐标轴和网格都能基于一个单一的属性出现/消失，
   * 所以将创建一个类，其有一个属性绑定了 getter 和 setter。  
   * 就可以让gui认为它在操作一个单一的属性
   */
  get visible() {
    return this._visible;
  }
  set visible(v) {
    this._visible = v;
    this.grid.visible = v;
    this.axes.visible = v;
  }
}
export default AxisGridHelper;
