<!--1. 有router参数时：以index作为path跳转对应的页面，跳转index为路径的页面-->

<template>
  <div>
    <div class="t_left go-homePage" @click="goHomePage">
      <img src="../../static/img/login_logo.png" class="go-homePage-img" />
    </div>
    <div class="t_left mg_l1 nav_header">
      <el-scrollbar>
        <el-menu
          :default-active="activeIndex"
          background-color="#1c2e3e"
          text-color="#ddd"
          active-text-color="#fff"
          router
          mode="horizontal"
          class="navMenu"
        >
          <div class="flex_content">
            <el-menu-item v-for="(v, i) in menus" :key="i" :index="v.url">
              <span slot="title">{{ v.name }}</span></el-menu-item
            >
            <el-menu-item>视图</el-menu-item>
          </div>
        </el-menu>
      </el-scrollbar>
    </div>
    <div class="t_right pd_r1 login_index">
      <div class="t_right login_username">
        <el-popover popper-class="header_popover">
          <ul class="userDown" style="list-style: none">
            <li>
              <div>
                <i class="fa fa-user"></i>
                <span class="mg_l10" @click="showUserMsg">我的信息</span>
              </div>
            </li>
            <li>
              <div>
                <i class="fa fa-lock"></i>
                <span class="mg_l10">修改密码</span>
              </div>
            </li>
            <li @click="loginOutUser">
              <div>
                <i class="fa fa-sign-out"></i>
                <span class="mg_l10">退出登录</span>
              </div>
            </li>
          </ul>
          <el-button class="login_out_btn" slot="reference">
            <span class="index_username">hexing</span>
            <i class="el-icon-arrow-down el-icon--right"></i
          ></el-button>
        </el-popover>
      </div>
      <div class="login_out_img t_right">
        <img src="../../static/img/user.png" />
      </div>
    </div>
    <div style="clear: both"></div>
  </div>
</template>
<script>
import "../../static/css/index.css";
export default {
  data() {
    return {
      menus: [
        {
          index: "1",
          name: "首页",
          url: "/home",
        },
        {
          index: "2",
          name: "ESS地图",
          url: "/essGisMap",
        },
        {
          index: "3",
          name: "表单数据",
          url: "/canvas",
        },
        {
          index: "4",
          name: "测试地图",
          url: "/test",
        },
        {
          index: "5",
          name: "模板数据",
          url: "/form",
        },
      ],
      activeIndex: "", // 当前路由路径
    };
  },
  created() {
    this.onChangeRouter();
  },
  mounted() {},
  watch: {
    //当route发生变化时，执行该函数
    $route: "onChangeRouter",
  },
  methods: {
    goHomePage() {
      this.activeIndex = this.$route.path;
      // 编程式导航，push导航对应页面,动态路由传参数
      this.$router.push({ path: "/home" });
    },

    clickRouter() {
      this.$router.push({ name: "powerStationMap", params: { name: "user" } });
    },

    /**
     * 监听路由
     */
    onChangeRouter() {
      console.log("onChangeRouter: >>>", this.$route.path);
      this.activeIndex = this.$route.path;
    },

    /**
     * 展示用户信息
     */
    showUserMsg() {
      console.log("user");
    },

    /**
     * 退出登录,清除缓存，返回登录页面,退出登录时也要向后端接口发送状态，需要携带登陆成功时后端返回信息中的token，并且清除缓存
     */
    loginOutUser() {
      localStorage.clear();
      sessionStorage.clear();
      this.$router.push("/");
    },
  },
};
</script>
<style Lang="scss" scoped>
/**图标样式 */

.go-homePage {
  display: flex;
  justify-content: center;
  align-items: center;
  height: 50px;
  padding: 0 15px;
}
.go-homePage-img {
  max-width: 150px;
}

/**中间菜单栏样式 */
.el-menu-item.is-active > .el-menu-item {
  height: 50px;
  font-size: 16px;
  padding: 0px 22px;
  color: #94acc4 !important;
  font-size: 15px;
}
.el-menu-item {
  height: 50px;
}
.el-menu-item.is-active {
  border-bottom: 2px solid #fff;
  color: #fff !important;
}
.el-menu.el-menu--horizontal {
  border: none;
}
.flex_content {
  display: flex;
}
.nav_header {
  position: absolute;
  margin-left: 175px;
  background-color: #94acc4;
  width: 100%;
}
.el-scrollbar /deep/ .el-scrollbar__thumb {
  background-color: aqua;
}
.navMenu .el-menu-item {
  float: left;
  margin: 0 20px;
}

/**用户信息样式 */
.login_index {
  position: absolute;
  right: 0;
  height: 50px;
  background-color: #1c2e3e;
}
.login_out_btn {
  background: transparent;
  border: none;
  color: rgb(148, 172, 196);
  height: 50 px;
  padding: 0;
}
.login_out_img {
  margin: 0px 8px;
}
.index_username {
  font-weight: 700;
}
.login_username {
  margin-top: 18px;
}
.el-icon-arrow-down:before {
  content: "\E790";
}
.login_out_img {
  margin: 15px 10px 0 15px;
}

.userDown {
  margin: 0;
  padding: 0;
}
.userDown li {
  padding: 8px !important;
  cursor: pointer;
}
</style>

<style lang="scss">
/**popover, popover样式不可以在scoped中设置，可通过设置poper-class来定义自己的class，修改对应样式 */
.header_popover {
  background: #050f19 !important;
  border: none;
  color: #c0c4cc;
}
.header_popover[x-placement^="bottom"] .popper__arrow::after {
  border-bottom-color: #050f19;
}
.header_popover[x-placement^="bottom"] .popper__arrow {
  border-bottom-color: #050f19;
}
.header_popover[x-placement^="bottom"] {
  margin: 0;
  top: 50px !important;
}
</style>
