<template>
  <div id="app">
    <!--路由配置到的组件，将显示在这里（根据路由配置里面的path渲染相应组件）-->
    <!-- 把需要缓存和不需要缓存的组件分开加载-->
    <transition name="fade" mdoe="out-in">
      <router-view v-if="$route.meta.keepAlive" />
    </transition>
    <transition name="fade" mdoe="out-in">
      <router-view v-if="!$route.meta.keepAlive" />
    </transition>
  </div>
</template>
<script>
import "../static/css/index.css";
import "../static/css/default.css";
export default {};
</script>
<!--根组件， 相当于项目容器，其他组件都会在这个容器内显示,定义的样式作用于整个项目-->
<style lang="scss">
#app {
  font-family: Avenir, Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-align: center;
  color: #2c3e50;
  position: absolute;
  top: 0;
  bottom: 0;
  width: 100%;
}
body {
  padding: 0px;
  margin: 0px;
  font-size: 14px;
  overflow: hidden;
}
#nav {
  padding: 0px;

  a {
    font-weight: bold;
    color: #2c3e50;

    &.router-link-exact-active {
      color: #42b983;
    }
  }
}
.el-main {
  padding: 0 !important;
}
</style>
