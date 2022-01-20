/**
 * ES6实现了模块的功能，一个模块就是一个文件，语法为import export
 */
/**
 * export导出，可以导出变量，函数，类，对象
 */
let firstName = "zhang";
let lastName = "xiaoxiao";
let year = 2000;

/**
 * export 不加default，命名导出时，import必须加{}且导入的名称必须与export保持一致
 * 加default默认导出时，不加{}，且导入名称可以自定义
 *
 * 导出变量
 */
// export default { firstName, lastName, year };

// 导出函数
let F = function() {
  console.log("这是一个函数");
};

// export default F;

/**
 * 导出类,静态方法不被实例继承，直接通过类调用
 * 如果不加static不是静态方法，会被类实例继承，需要通过类实例来调用该方法
 */

export default class A {
  static staticFun(a) {
    console.log("这是一个静态方法: >>>", a);
  }
}

export class Person {
  // 构造
  constructor(x, y) {
    this.x = x;
    this.y = y;
  }

  toString() {
    return this.x + "的年龄是" + this.y + "岁";
  }
}
