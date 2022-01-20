<template>
  <div class="login">
    <div class="box">
      <div class="login_img">
        <img src="../../static/img/login_logo.png" />
      </div>
      <div class="form">
        <el-form
          class="formStyle"
          :model="ruleForm"
          :rules="formRules"
          ref="loginForm"
          status-icon
          v-show="showForm == 0"
        >
          <el-form-item>
            <el-select v-model="language" @change="setLan">
              <el-option label="简体中文" value="zh"></el-option>
              <el-option label="English" value="en"></el-option>
            </el-select>
          </el-form-item>
          <el-form-item prop="user">
            <el-input
              type="text"
              placeholder="账户"
              v-model="ruleForm.user"
              auto-complete="on"
              prefix-icon="fa fa-user fa-lg"
              readonly
              @focus="removeAttribute"
              id="inputStyle"
              class="read_input"
            ></el-input>
          </el-form-item>
          <el-form-item prop="password">
            <el-input
              type="password"
              placeholder="密码"
              v-model="ruleForm.password"
              auto-complete="on"
              show-password
              prefix-icon="fa fa-lock fa-lg"
              @focus="removeAttribute"
            ></el-input>
          </el-form-item>
          <div class="login_forgetPwd">
            <a href="#" class="el_link">
              <span>忘记密码？</span>
            </a>
          </div>
          <el-form-item>
            <div class="login_btn">
              <el-button
                type="primary"
                class="login_submit"
                @click="loginUser"
                :loading="loading"
              >
                登陆
              </el-button>
            </div>
          </el-form-item>
          <div>
            <el-button class="login_signUp" size="small">
              <span style="color:rgb(211, 212, 214);padding-right:5px"
                >没有账号？</span
              >
              <span style="color:rgb(245, 108, 108)" @click="registerUser"
                >立即注册</span
              >
            </el-button>
          </div>
        </el-form>
        <!--注册用户-->
        <el-form
          class="formStyle"
          :model="registerFormData"
          :rules="registerFormRules"
          ref="registerForm"
          status-icon
          v-show="showForm == 1"
        >
          <el-form-item prop="user" required>
            <span class="redStar t_left">*</span>
            <el-input
              type="text"
              placeholder="账户"
              v-model="registerFormData.user"
              auto-complete="on"
              prefix-icon="fa fa-user-o fa-lg"
              size="small"
              class="width_300"
            ></el-input>
          </el-form-item>
          <el-form-item>
            <span class="whiteStar t_left">*</span>
            <el-input
              type="text"
              v-model="registerFormData.name"
              auto-complete="on"
              placeholder="姓名"
              prefix-icon="fa fa-user fa-lg"
              readonly
              @focus="removeRegisterAttribute"
              id="registerUser"
              class="read_input width_300"
              size="small"
            >
            </el-input>
          </el-form-item>

          <el-form-item prop="password">
            <span class="redStar t_left">*</span>
            <el-input
              type="password"
              placeholder="密码"
              v-model="registerFormData.password"
              auto-complete="on"
              prefix-icon="fa fa-lock fa-lg"
              @focus="removeRegisterAttribute"
              size="small"
              class="width_300"
            ></el-input>
          </el-form-item>
          <el-form-item prop="confirmPwd">
            <span class="redStar t_left">*</span>
            <el-input
              type="password"
              v-model="registerFormData.confirmPwd"
              auto-complete="on"
              placeholder="确认密码"
              prefix-icon="fa fa-lock fa-lg"
              class="width_300"
              size="small"
            >
            </el-input>
          </el-form-item>
          <el-form-item prop="email">
            <span class="redStar t_left">*</span>
            <el-input
              type="email"
              v-model="registerFormData.email"
              prefix-icon="fa fa-envelope"
              placeholder="邮箱"
              auto-complete="on"
              class="width_300 emailBtn "
              size="small"
            >
            </el-input>
            <el-button class="sendMegBtn" size="small">发送</el-button>
          </el-form-item>
          <el-form-item prop="VerificationCode">
            <span class="whiteStar t_left">*</span>
            <el-input
              type="text"
              v-model="registerFormData.VerificationCode"
              prefix-icon="fa fa-phone fa-lg"
              placeholder="手机号"
              auto-complete="on"
              class="width_300"
              size="small"
            >
            </el-input>
          </el-form-item>
          <el-form-item>
            <div class="register_btn">
              <el-button type="primary" class="login_submit" size="small">
                注册
              </el-button>
            </div>
          </el-form-item>
          <div>
            <el-button class="login_signUp" size="small">
              <span style="color:rgb(211, 212, 214);padding-right:5px"
                >已有账号？</span
              >
              <span style="color:rgb(245, 108, 108)" @click="goLoginUser"
                >立即登录</span
              >
            </el-button>
          </div>
        </el-form>
      </div>
    </div>
  </div>
</template>
<script>
export default {
  data() {
    return {
      ruleForm: {
        user: "",
        password: "",
      },
      formRules: {
        user: [{ required: true, message: "请输入账户", trigger: "blur" }],
        password: [{ required: true, message: "请输入密码", trigger: "blur" }],
      },
      registerFormRules: {
        user: [{ required: true, message: "此字段是必需的", trigger: "blur" }],
        password: [
          { required: true, message: "此字段是必需的", trigger: "blur" },
        ],
        confirmPwd: [
          { required: true, message: "此字段是必需的", trigger: "blur" },
        ],
        email: [{ required: true, message: "此字段是必需的", trigger: "blur" }],
        VerificationCode: [
          { required: true, message: "此字段是必需的", trigger: "blur" },
        ],
      },
      showForm: 0,
      loading: false,
      registerFormVisible: false,
      registerFormData: {
        user: "",
        name: "",
        password: "",
        confirmPwd: "",
        email: "",
        VerificationCode: "",
        phone: "",
      },
      language: "en",
    };
  },
  created() {
    /**
     * 监听键盘回车事件
     */
    window.addEventListener("keydown", this.handleKeyDown, true);
    console.log(sessionStorage);
  },
  mounted() {
    let language;
    if (navigator.language) {
      language = navigator.language;
    } else {
      language = navigator.browserLanguage;
    }
    // 初始默认语言与浏览器一致
    if (language.indexOf("zh") !== -1) {
      this.language = "zh";
      this.$i18n.locale = "zh";
      localStorage.setItem("LANGUAGE", "zh");
    } else {
      // 其他情况都设为英文
      this.language = "en";
      this.$i18n.locale = "en";
      localStorage.setItem("LANGUAGE", "en");
    }
  },
  methods: {
    setLan() {
      if (this.language === "zh") {
        localStorage.setItem("LANGUAGE", "zh");
        this.$i18n.locale = "zh";
      } else {
        localStorage.setItem("LANGUAGE", "en");
        this.$i18n.locale = "en";
      }
    },
    loginUser() {
      this.loading = true;
      const This = this;
      this.$refs["loginForm"].validate((valid) => {
        if (valid) {
          //根据当前请求地址及信息，请求后端,后端查看用户密码是否存在，如果请求成功，返回res,因为后端返回的用户信息中携带token，只应该在当前页面打开时有效，所以存储在sessionStorage
          const data = {
            user_no: this.ruleForm.user,
            password: this.ruleForm.password,
          };
          const url = "172.30.12.120:8080/login";
          This.post(url, data)
            .then((res) => {
              This.loading = false;
              if (res.state === "success") {
                sessionStorage.setItem("user", JSON.stringify(res));
                this.$router.push({
                  path: "/home",
                });
              } else if (res.state === "fail") {
                this.$message({
                  type: "error",
                  message: res.errorData,
                  showClose: true,
                });
              }
            })
            .catch((err) => {
              This.loading = false;
              console.log(err);
            });
        } else {
          this.loading = false;
          return;
        }
      });
    },
    /**
     * post请求,登录时请求后端接口，
     */
    post(url, data) {
      return new Promise((resolve, reject) => {
        if (data.password === "123456" && data.user_no === "user") {
          data.state = "success";
          resolve(data);
        } else {
          data.state = "fail";
          data.errorData = "密码错误";
          resolve(data);
          reject(new Error());
        }
      });
    },

    /**
     * 键盘回车事件
     */
    handleKeyDown(e) {
      let key = e.keyCode || window.event.keyCode;
      if (key && key === 13) {
        this.loginUser();
      }
    },

    /**
     * 移除表单属性,解决存储用户密码到本地浏览器，打开页面会自动填充的问题
     */
    removeAttribute() {
      const ele = document.getElementById("inputStyle");
      ele.removeAttribute("readonly");
    },
    removeRegisterAttribute() {
      const ele = document.getElementById("registerUser");
      ele.removeAttribute("readonly");
    },
    /**
     * 缓存用户信息提示
     */
    // loginUserTip() {
    //   console.log("inputttt");
    //   // 如果内存中有用户信息，提示密码用户,一次只有一个用户信息
    //   if (
    //     JSON.parse(localStorage.getItem("user")) &&
    //     JSON.parse(localStorage.getItem("user")).user_no
    //   ) {
    //     this.ruleForm.user = JSON.parse(localStorage.getItem("user")).user_no;
    //     this.ruleForm.password = JSON.parse(
    //       localStorage.getItem("user")
    //     ).password;
    //   }
    // },

    /**
     * 注册用户
     */
    registerUser() {
      this.showForm = 1;
    },

    /**
     * 返回登录页面
     */
    goLoginUser() {
      this.showForm = 0;
      this.$nextTick(() => {
        this.$refs["registerForm"].resetFields();
        this.registerFormData = {
          user: "",
          name: "",
          password: "",
          confirmPwd: "",
          email: "",
          VerificationCode: "",
          phone: "",
        };
      });
    },
  },
};
</script>
<style scoped Lang="scss">
.login {
  width: 100%;
  height: 100%;
  position: absolute;
  background: rgba(0, 0, 0, 0.2);
  display: flex;
  justify-content: center;
  align-items: center;
}
/**设置伪元素 */
.login::before {
  content: "";
  background: url("../../static/img/login_bg.png");
  position: absolute;
  background-size: contain;
  width: 100%;
  height: 100%;
  top: 0;
  left: 0;
  z-index: -999;
}
.login .box {
  position: absolute;
  z-index: 100;
  width: 330px;
  background: rgba(0, 0, 0, 0.1);
  top: 0;
  right: 0;
  bottom: 0;
  padding: 50px 45px 20px;
}
.login .login_img {
  margin: 60px 0px 50px 0px;
  display: flex;
  justify-content: center;
}
.login .login_forgetPwd {
  display: flex;
  justify-content: start;
}

.formStyle /deep/.el-input__inner {
  background-color: transparent;
  border: 1px solid #dcdfe6;
  border-color: #5c6b79;
  color: #fff;
}
#nav a {
  color: #909399;
}
.el-input .el-input__clear {
  display: inherit;
}
.login_btn .login_submit {
  width: 100%;
  margin-top: 50px;
}
.register_btn .login_submit {
  width: 100%;
  margin-top: 5px;
}
.login_signUp {
  position: absolute;
  background: transparent;
  border-color: transparent;
  display: flex;
  justify-content: start;
  padding: 9px 0px;
  color: #fff;
}
.el_link {
  text-decoration: none;
}

/**邮箱行 */
.emailBtn /deep/.el-input__inner {
  border-bottom-right-radius: 0px;
  border-top-right-radius: 0px;
  border-right: 0;
}
.emailBtn {
  width: 235px !important;
}
.sendMegBtn {
  background: transparent;
  border-color: #5c6b79;
  border-top-left-radius: 0px;
  border-bottom-left-radius: 0px;
  color: #409eff;
  width: 80px;
}
.redStar {
  color: red;
  width: 15px;
}
.whiteStar {
  color: transparent;
  width: 15px;
}
.el-form-item {
  margin-bottom: 13px;
}
.formStyle /deep/ .el-form-item.is-error .el-input__inner,
.el-form-item.is-error .el-input__inner:focus,
.el-form-item.is-error .el-textarea__inner,
.el-form-item.is-error .el-textarea__inner:focus,
.el-message-box__input input.invalid,
.el-message-box__input input.invalid:focus {
  border-color: #f56c6c;
}
</style>
