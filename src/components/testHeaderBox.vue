<template>
  <div class="test_nav">
    <div class="t_left navleft">
      <img
        src="../../static/img/login_logo.png"
        class="go-homePage-img"
        @click="goHomePage"
      />
    </div>
    <div class="t_right mg_r15 login_index">
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
            <li>
              <div @click="loginOutUser">
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
    <div class="test_scroll">
      <el-scrollbar>
        <el-menu
          :default-active="activeIndex"
          class="testMenu"
          mode="horizontal"
          text-color="#ddd"
          active-text-color="#fff"
          router
        >
          <div class="flex-content">
            <el-menu-item v-for="(v, i) in menus" :key="i" :index="v.url">
              <span slot="title">{{ v.name }}</span></el-menu-item
            >
          </div>
        </el-menu>
      </el-scrollbar>
    </div>
  </div>
</template>
<script>
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
        {
          index: "6",
          name: "视图",
          url: "/view",
        },
      ],
      activeIndex: "",
    };
  },
  created() {
    this.onChangeRouter();
  },
  watch: {
    //当route发生变化时，执行该函数
    $route: "onChangeRouter",
  },
  methods: {
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

    /**
     * 监听路由,路由传参时，params要跟name，query跟name、path都可
     */
    onChangeRouter() {
      this.activeIndex = this.$route.path;
      // if (this.$route.name === "view") {
      //   this.$router.push({ name: "view", query: { userId: 12 } });
      // }
    },

    /**
     * 返回首页
     */
    goHomePage() {
      this.$router.push({ path: "/home" });
    },
  },
};
</script>
<style Lang="scss" scoped>
/**图标样式 */
.go-homePage-img {
  max-width: 150px;
}
.navleft {
  padding: 0 15px;
  display: flex;
  justify-content: center;
  align-items: center;
  height: 56px;
}

/**滚动条导航栏 */
.test_nav {
  background-color: rgb(28, 46, 62);
  width: 100%;
}

.flex-content {
  display: flex;
}
.testMenu {
  background-color: rgb(28, 46, 62);
}
.testMenu .el-menu-item {
  float: left;
  margin: 0 15px;
  height: 50px;
}
.el-menu-item.is-active {
  border-bottom: 3px solid !important;
}
.el-menu-item:focus,
.el-menu-item:hover {
  background-color: rgb(28, 46, 62);
}
.el-menu.el-menu--horizontal {
  border-bottom: 0;
}

/**用户信息 */
.login_out_img {
  margin: 15px 10px 0 15px;
}
.login_out_btn {
  background: transparent;
  border: none;
  color: rgb(148, 172, 196);
  height: 50px;
  padding: 0;
}
.index_username {
  font-weight: 700;
}

.el-icon-arrow-down:before {
  content: "\E790";
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
