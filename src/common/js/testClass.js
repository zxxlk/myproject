export default class Animal {
  constructor() {
    this.type = "animal"
  }
  /**类中所有方法都是定义在类的原型下的，类中this指的是类实例对象 */
  sayHi(val) {
    setTimeout(() => {
      console.log(this.type + " say " + val);
    }, 200)
  }
  say(val) {
    setTimeout(function () {
      // setTimeout方法里面的this指向window，全局对象
      console.log(this.type + " say " + val);
    }, 200)
  }
  /**静态方法直接通过类调用，而不是实例 */
  static get(val) {
    console.log('static:>>>', val);
  }
  /**s实现一个打点计时器 */
  count(start, end) {
    console.log(start);
    var timer = setInterval(() => {
      if (start < end) {
        console.log(++start);
      }
    }, 100)
    return {
      cancel: function () {
        clearInterval(timer)
      }
    }
  }
}