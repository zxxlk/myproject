import Vue from "vue";
import App from "./App.vue";
import router from "./router";
import { store } from "./store/store";
import ElementUI from "element-ui";
import "element-ui/lib/theme-chalk/index.css";
import Vuex from "vuex";
import VueMeta from "vue-meta";
import { VueJsonp } from "vue-jsonp";
import axios from "axios";
import "font-awesome/css/font-awesome.min.css";
import NProgress from "nprogress";
import "nprogress/nprogress.css";
import i18n from "./lang/index.js";

Vue.config.productionTip = false;
Vue.use(ElementUI); //全局注册组件
Vue.use(Vuex);
Vue.use(VueMeta, {
  refreshOnceOnNavigation: true,
});
Vue.use(VueJsonp);

// 路由全局守卫，实现路由拦截器，每次跳转时，都对当前路由（地址）进行判断，防止未登录用户随意访问页面
router.beforeEach((to, from, next) => {
  NProgress.start();
  console.log(to);
  // 如果当前是登录页面，清除缓存，可任意访问
  if (to.path === "/") {
    sessionStorage.removeItem("user");
    next();
  } else {
    // 在其他地址页面，判断是否有缓存user，如果有随意访问，如果没有，返回登录页面
    if (to.query.language) {
      if (to.query.language === "zh") {
        localStorage.setItem("LANGUAGE", "zh");
        i18n.locale = "zh";
      } else {
        localStorage.setItem("LANGUAGE", to.query.language);
        i18n.locale = to.query.language;
      }
    } else {
      let language;
      if (navigator.language) {
        language = navigator.language;
      } else {
        language = navigator.browserLanguage;
      }
      language = language.substr(0, 2);
      if (language === "zh") {
        localStorage.setItem("LANGUAGE", "zh");
        i18n.locale = "zh";
      } else {
        // 其他情况都设置为英文
        localStorage.setItem("LANGUAGE", "en");
        i18n.locale = "en";
      }
    }
    const user = sessionStorage.getItem("user");
    if (user) {
      next();
    } else {
      next({
        path: "/",
      });
    }
    // 登录时设置选择语言
  }
});
router.afterEach(() => {
  NProgress.done();
});

new Vue({
  router,
  store, //挂载在vue实例上，该store会注入到根组件下的所有子组件，且能通过this.$调用
  components: { App },
  i18n,
  template: "<App/>",
  render: (h) => h(App),
}).$mount("#app");