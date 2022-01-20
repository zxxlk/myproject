// 配置路由
import Vue from "vue";
import VueRouter from "vue-router";

Vue.use(VueRouter);
//动态加载组件
const homePage = () =>
  import ("./views/HomePage.vue");
const essGisMap = () =>
  import ("./components/ESSGisMap.vue");
const power = () =>
  import ("./components/powerStationMap.vue");
const newPower = () =>
  import ("./components/newPowerStation.vue");
const editPower = () =>
  import ("./components/editPowerStation.vue");
const testPower = () =>
  import ("./components/testPower.vue");
const canvas = () =>
  import ("./components/canvas.vue");
const form = () =>
  import ("./components/form.vue");
const login = () =>
  import ("./views/Login.vue");
const view = () =>
  import ("./components/view.vue");

//获取原型对象上的push函数
const originalPush = VueRouter.prototype.push;
//修改原型对象中的push方法
VueRouter.prototype.push = function push(location) {
  return originalPush.call(this, location).catch((err) => err);
};

const routes = [{
    path: "/",
    name: "login",
    component: login,
  },
  {
    path: "/home",
    name: "home",
    component: homePage,
  },
  {
    path: "/essGisMap",
    name: "ESSGisMap",
    component: essGisMap,
  },
  {
    path: "/power/index/:name",
    name: "powerStationMap",
    component: power,
  },
  {
    path: "/newpower",
    name: "newPowerStation",
    component: newPower,
  },
  {
    path: "/editpower",
    name: "editPowerStation",
    component: editPower,
  },
  {
    path: "/test",
    name: "testPower",
    component: testPower,
  },
  {
    path: "/canvas",
    name: "canvas",
    component: canvas,
    meta: {
      keepAlive: true,
    },
  },
  // 动态路由以:配置参数
  {
    path: "/form",
    name: "form",
    component: form,
    meta: {
      keepAlive: true,
    },
  },
  {
    path: "/view",
    name: "view",
    component: view,
    meta: {
      keepAlive: true,
    },
  },
];
// $router-路由器;$route-当前路由对象
const router = new VueRouter({
  mode: "hash", // 模式：#号后面值
  base: process.env.BASE_URL,
  routes,
});

export default router;