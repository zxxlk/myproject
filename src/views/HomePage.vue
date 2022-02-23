<template>
  <div>
    <el-container class="width-full height-full">
      <el-header class="headerBox" height="50px">
        <header-bar></header-bar>
      </el-header>
      <el-main class="width-full height-full">
        <div class="homePage"></div>
      </el-main>

      <div class="upload">
        <el-upload
          class="upload-demo"
          action="https://jsonplaceholder.typicode.com/posts/"
          :on-preview="handlePreview"
          :file-list="fileList"
        >
          <el-button size="small" type="primary">点击上传</el-button>
        </el-upload>
        <el-button
          ref="download"
          class="download"
          :loading="ifLoad"
          @click="downloadFile"
          >点击下载文件</el-button
        >
        <el-button @click="testAnimation">动画</el-button>
        <p ref="pp" id="transition" class="transition">
          这是一个动画文本
        </p>
        <a href="http://www.w3school.com.cn" target="iframe_a">点击跳转</a>
        <iframe src="" frameborder="0" name="iframe_a">这是一个iframe</iframe>
      </div>
    </el-container>
  </div>
</template>
<script>
import "../../static/css/index.css";
import headerBar from "../components/testHeaderBox.vue";

import $ from "jquery";
import axios from "axios";
export default {
  data() {
    return {
      fileList: [
        {
          name: "food.jpeg",
          url:
            "https://fuss10.elemecdn.com/3/63/4e7f3a15429bfda99bce42a18cdd1jpeg.jpeg?imageMogr2/thumbnail/360x360/format/webp/quality/100",
        },
        {
          name: "food2.jpeg",
          url:
            "https://fuss10.elemecdn.c om/3/63/4e7f3a15429bfda99bce42a18cdd1jpeg.jpeg?imageMogr2/thumbnail/360x360/format/webp/quality/100",
        },
      ],
      downloadURL:
        "http://192.168.6.107:8080/hgisserver/xu/ows?service=WFS&version=1.0.0&request=GetFeature&typeName=xu%3Aap&maxFeatures=1000000&outputFormat=csv",
      ifLoad: false,
      bool: false,
    };
  },
  components: {
    headerBar,
  },
  computed: {},
  created() {
    //form页面已经通过mutation改变了状态tableData的值,先加载form页面再加载首页才会改变。
    console.log("store tableData:>>>", this.$store.state.tableData);
    this.$store.dispatch("incrementAsync", {
      address: "商丘市",
      date: "2021",
      name: "Lkk",
    });
  },
  mounted() {
    // 获得滚动条与顶部之间的距离
    /**
     * window的onscroll事件，指向的是一个函数，放在mounted中，初始加载页面会执行一次
     * 然后滚动条滚动时会触发，执行指向的函数
     */
    // window.onscroll = this.debounce(this.getTop, 1000);
    window.onscroll = this.throttle(this.getTop, 1000);
    // test Promise
    this.testPromise()
      .then((value) => {
        // console.log("resolve:>>", value);
      })
      .catch((err) => {
        console.log("error: >>", err);
      });

    //函数作用域、块级作用域
    this.fun();

    this.testasync().then((res) => {
      // console.log(res);
    });
  },
  methods: {
    /**
     * 频繁滚动，会一直打印，对浏览器的请求太过频繁。可以使用防抖节流（前端的性能优化，优化请求太过频繁的，提到频繁请求，想到防抖节流优化，给事件设置时间）
     * 防抖：第一次请求该函数时，不执行该函数，设置一个时间期望值，time
     * 如果time时间内，没有触发该事件，则执行该事件。
     * 如果time时间内，触发了该事件，则时间1重新计算。
     *
     */
    getTop() {
      let scrollTop =
        document.body.scrollTop || document.documentElement.scrollTop;
      console.log("滚动条位置: >>>", scrollTop);
    },

    debounce(fn, delay) {
      let timer = null;
      return () => {
        if (timer) {
          clearTimeout(timer); // 进入该语句，说明当前正有一个计时器过程中，又触发了相同事件，所以清除定时器，重新计算
        }
        timer = setTimeout(fn, delay);
      };
    },

    /**
     * 节流：相当于技能冷却，当函数触发过一次之后，在规定时间内，事件不再工作，直至过了这段时间才可以重新触发
     * 定义一个变量，为true才可以执行函数，开始执行设为false，执行完设为true
     */
    throttle(fn, delay) {
      // 利用一个变量判断事件是否工作
      let valid = true;
      return () => {
        if (!valid) {
          return false;
        }
        valid = false;
        setTimeout(() => {
          fn();
          valid = true;
        }, delay);
      };

      // let activeTime = 0;
      // console.log("1");
      // return () => {
      //   const current = Date.now();
      //   if (current - activeTime > delay) {
      //     fn();
      //     console.log("activeTime: >>", activeTime);
      //     activeTime = Date.now();
      //   }
      // };
    },
    /**
     * 联系promise
     */
    testPromise() {
      const url =
        "http://192.168.6.107:8080/hgisserver/xu/ows?service=WFS&version=1.0.0&request=GetFeature&typeName=xu%3Aap&maxFeatures=1000000&outputFormat=application%2Fjson";
      //promise 接受两个参数resolve，reject。promise处理一些异步的操作，当异步代码执行成功后，调用resolve（），失败调用reject（）
      // return new Promise((resolve, reject) => {
      //   //处理一些异步操作
      //   $.ajax({
      //     url,
      //     type: "Get",
      //     contenType: "application/json",
      //     success(res) {
      //       resolve(res);
      //     },
      //     error(err) {
      //       reject(err);
      //     },
      //   });
      // });
      return this.testasync();
    },

    /**
     * 作用域
     */
    fun(c = 0) {
      // var a = 1;
      // if (c == 0) {
      //   var a = 1; //var声明的在整个函数内都有效
      //   let b = 2; //let声明的变量只在他所在的代码块{}内有效
      // }
      // console.log("a:>>>", a); // 1或者undifined
      // console.log("b:>>>", b); // 'b' is not defined  no-undef
      //ajax链式调用
      const url =
        "http://192.168.6.107:8080/hgisserver/xu/ows?service=WFS&version=1.0.0&request=GetFeature&typeName=xu%3Aap&maxFeatures=1000000&outputFormat=application%2Fjson";
      $.when(
        $.ajax({
          url,
          type: "Get",
          contenType: "application/json",
        })
      ).done((data) => {
        //相当于success请求成功后的数据
        // console.log(data);
        $.ajax({
          url,
          type: "Get",
          contenType: "application/json",
          success(res) {
            // console.log("res: >>>", res);
          },
        });
      });
    },

    handlePreview(file, fileList) {
      console.log(file);
    },

    downloadFile() {
      let url = this.downloadURL;
      const link = document.createElement("a");
      link.download = url;
      link.href = url;
      link.style.display = "none";
      link.target = "_blank"; //页面会闪烁一下，
      document.body.appendChild(link);
      link.click();
      this.ifLoad = true;
      document.body.removeChild(link);
      this.ifLoad = false;
    },

    testAnimation() {
      if (!this.bool) {
        document.getElementById("transition").classList.add("aftertransition");
      } else {
        document
          .getElementById("transition")
          .classList.remove("aftertransition");
      }
      this.bool = !this.bool;
    },

    /**
     * async返回的是一个promise异步方法
     */
    async testasync() {
      const url = this.downloadURL;
      let res = await axios.get(url); //后面是一个异步函数，等待异步执行完，再进行后续的操作。
      return res.data;
    },
  },
};
</script>
<style lang="scss" scoped>
.homePage {
  width: 100%;
  height: 100%;
  color: rgba(221, 221, 221);
  background: url("../../static/img/homePage.png") no-repeat;
  background-color: antiquewhite;
  background-size: 100% 100%;
  position: absolute;
}
.box {
  position: absolute;
  width: 0;
  height: 0;
  border-top: 100px solid red;
}
.upload {
  position: absolute;
  top: 50px;
  left: 10px;
}
.transition {
  width: 100px;
  height: 100px;
  background: aqua;
  opacity: 1;
}
.aftertransition {
  width: 100px;
  height: 100px;
  opacity: 1;
  transform: translateY(100px);
  transition: 2s; //不指定属性默认过渡所有属性
  // animation: 2s changeColor infinite ease;
}

// 利用@keyframes定义动画，并在选择器中使用
@keyframes changeColor {
  0% {
    opacity: 0;
  }
  50% {
    opacity: 0;
  }
  100% {
    opacity: 1;
  }
}
</style>
