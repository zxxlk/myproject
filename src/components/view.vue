<template>
  <el-container class="width-full height-full" id="container">
    <el-header class="headerBox" height="50px">
      <header-bar></header-bar>
    </el-header>
    <el-main class="main" id="main">
      <div class="toolBar">
        <div class="tool t_left">
          <div @click="toolBarShow = !toolBarShow" class="tool_left">
            工具
            <span class="mrg_left mrg_right">
              <i
                :class="toolBarShow ? 'fa fa-angle-right' : 'fa fa-angle-left'"
              ></i>
            </span>
          </div>
        </div>
        <transition>
          <div v-show="toolBarShow" class="flex t_left">
            <div v-for="item in data" :key="item.id">
              <el-select :value="item.label" size="mini" class="select">
                <el-option
                  v-for="child in item.children"
                  :key="child.id"
                  :label="child.label"
                  :value="child.label"
                  @click.native="child.method"
                >
                  <span class="mrg_right grey_icon">
                    <i :class="child.icon"></i>
                  </span>
                  <span>{{ child.label }}</span>
                </el-option>
              </el-select>
              <div class="t_left tool-right mrg_left mrg_right grey_icon">
                <span>
                  <i :class="item.icon"></i>
                </span>
              </div>
            </div>
          </div>
        </transition>
      </div>
      <!-- 设置参数 -->
      <set-topology-params
        ref="params"
        :paramsTitle="$t('data.paraTitle')"
        @confirmParams="confirmParams"
      >
        <el-form
          ref="formParams"
          :model="form"
          label-width="90px"
          :rules="formRules"
          size="mini"
          :inline="true"
        >
          <el-form-item label="AP" prop="ap">
            <el-select v-model="form.ap" placeholder="请选择">
              <el-option
                v-for="item in apOptions"
                :key="item.value"
                :label="item.label"
                :value="item.value"
              >
              </el-option>
            </el-select>
          </el-form-item>
          <el-form-item label="Relay" prop="relay">
            <el-select
              v-model="form.relay"
              multiple
              :collapse-tags="collapsetags"
              placeholder="请选择"
              @change="changeRelay"
              :class="collapsetags ? 'height28' : ''"
            >
              <el-checkbox
                v-model="relayCheck.checkAll"
                :style="{ paddingLeft: '20px' }"
                :indeterminate="relayCheck.indeterminate"
                @change="checkAllDevice($event)"
                >全选</el-checkbox
              >
              <el-option
                v-for="item in relayOptions"
                :key="item.value"
                :value="item.value"
                :label="item.label"
              ></el-option>
            </el-select>
          </el-form-item>
          <el-form-item label="Meter" prop="meter">
            <el-select v-model="form.meter" placeholder="请选择">
              <el-option label="meter" value="meter"></el-option>
            </el-select>
          </el-form-item>
        </el-form>
      </set-topology-params>
      <div style="top: 100px; position: absolute; left: 20px">
        <p>{{ $t("data.hello") }}</p>
        <el-button type="primary" size="mini" @click="back">{{
          vuexMsg
        }}</el-button>
        <el-button type="primary" size="mini" @click="location">{{
          this.$store.state.a.msgA
        }}</el-button>
        <el-button type="danger" size="mini" @click="deLocation">{{
          this.$store.state.a.msgA
        }}</el-button>
        <h3 v-if="awesome">awesome</h3>
        <h3 v-else>oh no awesome 😢</h3>
      </div>
      <div id="echarts" class="echarts" style="width:400px;height:400px"></div>
      <ul id="entrust">
        <li class="item">item1</li>
        <li class="item">item2</li>
        <li class="item">item3</li>
      </ul>
      <el-button type="primary" @click="addLI" size="mini" id="add"
        >add</el-button
      >
    </el-main>
  </el-container>
</template>
<script>
import headerBar from "./testHeaderBox.vue";
import Tip from "../mixins/tip.js";
import setTopologyParams from "../data/setTopologyParams.vue";
import * as echarts from "echarts";
import createElement from "../util/virtualDOM";
import { debounce } from "lodash";

export default {
  mixins: [Tip],
  data() {
    return {
      awesome: false,
      toolBarShow: true,
      data: [
        {
          id: 1,
          label: "数据",
          icon: "fa fa-align-justify",
          children: [
            {
              id: 11,
              label: "数据1",
              icon: "fa fa-check-circle",
              method: this.tipMessage,
            },
            {
              id: 12,
              label: "深拷贝",
              icon: "fa fa-check-circle-o",
              method: this.deepClone,
            },
          ],
        },
        {
          id: 2,
          label: "数据测量",
          icon: "fa fa-crop",
          children: [
            {
              id: 21,
              label: "测量长度",
              icon: "fa fa-crop",
              method: this.measureLength,
            },
          ],
        },
        {
          id: 3,
          label: "操作数据",
          icon: "fa fa-edit",
          children: [
            {
              id: 31,
              label: "添加数据",
              icon: "fa fa-plus-circle color-grey",
              method: this.addData,
            },
          ],
        },
        {
          id: 4,
          label: "点选规划",
          icon: "fa fa-hand-pointer-o",
          children: [
            {
              id: 41,
              label: "设置图层",
              icon: "fa fa-edit",
              method: this.setParams,
            },
            {
              id: 42,
              label: "导出数据",
              icon: "fa fa-cloud-download",
              method: this.exportFile,
            },
          ],
        },
      ],
      basic: "",
      form: {
        ap: "",
        relay: [], //多选是数组
        meter: "",
      },
      apOptions: [
        {
          label: "COPEL_AP",
          value: "COPEL_AP",
        },
        {
          label: "Reference_AP",
          value: "Reference_AP",
        },
      ],
      formRules: {
        ap: [{ required: true, message: "请选择数据", trigger: "blur" }],
      },
      options: {
        title: {
          text: "ECharts 入门示例",
        },
        tooltip: {},
        xAxis: {
          data: ["衬衫", "羊毛衫", "雪纺衫", "裤子", "高跟鞋", "袜子"],
        },
        yAxis: {},
        series: [
          {
            name: "销量",
            type: "bar",
            data: [5, 20, 36, 10, 10, 20],
            // 每一项元素样式
            itemStyle: {
              shadowBlur: 10,
              shadowColor: "rgba(120,36,50,0.5)",
              shadowOffsetY: 5,
            },
          },
        ],
      },
      relayOptions: [
        {
          value: "选项1",
          label: "黄金糕",
        },
        {
          value: "选项2",
          label: "双皮奶",
        },
        {
          value: "选项3",
          label: "蚵仔煎",
        },
        {
          value: "选项4",
          label: "龙须面",
        },
        {
          value: "选项5",
          label: "北京烤鸭",
        },
        {
          value: "选项6",
          label: "黄金糕",
        },
        {
          value: "选项7",
          label: "黄金糕",
        },
        {
          value: "选项8",
          label: "黄金糕",
        },
        {
          value: "选项9",
          label: "黄金糕",
        },
        {
          value: "选项10",
          label: "黄金糕",
        },
        {
          value: "选项11",
          label: "黄金糕",
        },
      ],
      relayCheck: {
        checkAll: false, // 是否选中状态
        indeterminate: true, //维持全选框不确定状态
      },
    };
  },
  components: {
    headerBar,
    setTopologyParams,
  },
  created() {
    const query = this.$route.query;
    this.basic = this.$t("data.basic");
    // 为了使复用组件的防抖函数相互独立，可在created中设置防抖函数
    this.deLocation = debounce(this.debounceLocation, 500, { leading: true });
  },
  mounted() {
    this.initEcharts();
    window.onresize = () => {
      this.myEcharts.resize();
    };
    this.virtualDOM();
    let dom = document.getElementById("entrust");
    dom.onclick = (e) => {
      e = e || window.event;
      //给li绑定事件，判断是不是li
      if (e.target.nodeName.toLowerCase() === "li") {
        console.log(e.target.innerHTML);
      }
    };
    const array = [1, 2, 3, 4, 5, 6];
  },
  methods: {
    // 增加一个li
    addLI() {
      let ul = document.getElementById("entrust");
      let li = document.createElement("li");
      li.className = "item";
      li.innerHTML = "item4";
      ul.appendChild(li);
    },
    /**
     * 实现全选
     */
    checkAllDevice(event) {
      // 全选时，将option所有的数据，都添加到select绑定的数组中
      this.form.relay = event
        ? this.relayOptions.map((item) => item.value)
        : [];
      this.relayCheck.indeterminate = false;
    },
    /**
     * 选中值发生变化时，维持全选框的状态
     */
    changeRelay() {
      const relayLength = this.form.relay.length;
      this.relayCheck.indeterminate =
        relayLength > 0 && relayLength < this.relayOptions.length;
      this.relayCheck.checkAll = relayLength === this.relayOptions.length;
    },
    back() {
      // this.$router.go(-1);
      this.$store.commit("changeMessage", "改变state");
    },
    backTo() {
      const date = new Date();
      const nowDate = {
        year: date.getFullYear(),
        month: date.getMonth() + 1,
        todayDate: date.getDate(),
        hours: date.getHours(),
        min: date.getMinutes(),
        sec: date.getSeconds(),
      };
      const today =
        nowDate.year +
        "-" +
        nowDate.month +
        "-" +
        nowDate.todayDate +
        " " +
        nowDate.hours +
        ":" +
        nowDate.min +
        ":" +
        nowDate.sec;
      console.log(today);
    },
    /**
     * JSON/String转化为CSV文件
     */
    download() {
      const string = `Year,Make,Model,Description,Price
    1997,Ford,E350,"ac, abs, moon",3000.00
    1999,Chevy,"Venture ""Extended Edition""","",4900.00
    1999,Chevy,"Venture ""Extended Edition, Very Large""",,5000.00
    1996,Jeep,Grand Cherokee,"MUST SELL!
    air, moon roof, loaded",4799.00`;
      const blob = new Blob([string], { type: "text/csv, charset=ANSI" });
      const link = document.createElement("a");
      link.download = "text-file"; // 下载文件的名称
      link.target = "_blank";
      link.style.display = "none";
      link.href = URL.createObjectURL(blob);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    },
    /**
     * csv格式的String转化为数组
     */
    CSVToArray() {
      const csvStr = `\source,target\r\n2,1\r\n3,2`;
      const csvArr = csvStr.split("\r\n");
      const arr = [];
      for (let i = 0; i < csvArr.length; i++) {
        if (csvArr[i] !== "") {
          arr.push(csvArr[i].split(","));
        }
      }
      this.arrToCSV(arr);
    },
    /**
     * 将数组转化为csv string
     */
    arrToCSV(arr) {
      let str = "";
      // 将每一项转化成字符串再拼接
      for (let i = 0; i < arr.length; i++) {
        const item = arr[i];
        str += item.join();
        if (i !== arr.length - 1) {
          str += "\r\n";
        }
      }
    },
    /**
     * 设置参数
     */
    setParams() {
      this.$refs.params.openDialog();
    },
    exportFile() {
      console.log("export");
    },
    confirmParams() {
      this.$refs.formParams.validate((valid) => {
        if (valid) {
          this.$refs.params.closeDialog();
        } else {
          return false;
        }
      });
    },
    /**
     * 初始化echarts
     */
    initEcharts() {
      // 初始化echarts
      const dom = document.getElementById("echarts");
      this.myEcharts = echarts.init(dom);
      this.myEcharts.setOption(this.options);
    },

    /**
     * 读取csv文件
     */
    readCSVFile() {},

    /**
     * 获取当前浏览器位置,h5 Geolocation实现;
     * 场景：如果频繁一直点击，会一直向浏览器发送请求，使用防抖优化，在一段时间内，如果频繁点击，只输出最后一次点击的结果，
     */
    location: debounce(
      async function() {
        try {
          const location = await this.getLocation();
          this.$message({
            message: "当前位置: " + location,
            type: "success",
          });
        } catch (error) {
          switch (error.code) {
            case 0:
              console.log("获取位置信息失败，失败原因: " + error.message);
              break;
            case 1: //错误编码 PERMISSION_DENIED
              console.log("用户拒绝共享其位置信息");
              break;
            case 2: //错误编码 POSITION_UNAVAILABLE
              console.log("尝试获取用户位置，但失败了");
              break;
            case 3: //错误编码 TIMEOUT
              console.log("获取位置信息超时");
              break;
          }
        }
      },
      500,
      { leading: true }
    ),

    async debounceLocation() {
      try {
        const location = await this.getLocation();
        this.$message({
          message: "当前位置: " + location,
          type: "success",
        });
      } catch (error) {
        switch (error.code) {
          case 0:
            console.log("获取位置信息失败，失败原因: " + error.message);
            break;
          case 1: //错误编码 PERMISSION_DENIED
            console.log("用户拒绝共享其位置信息");
            break;
          case 2: //错误编码 POSITION_UNAVAILABLE
            console.log("尝试获取用户位置，但失败了");
            break;
          case 3: //错误编码 TIMEOUT
            console.log("获取位置信息超时");
            break;
        }
      }
    },

    /**
     * getCurrentPosition有三个参数：
     * 1. successCallback必选参数，位置信息请求成功后的处理函数
     * 2. errorCallback 可选，请求错误处理函数
     * 3. options 可选，调整数据搜集的方式
     */
    getLocation() {
      if (navigator && navigator.geolocation) {
        return new Promise((resolve, reject) => {
          navigator.geolocation.getCurrentPosition(
            (position) => {
              resolve([position.coords.longitude, position.coords.latitude]);
            },
            (error) => {
              reject(error);
            },
            {
              timeout: 2000,
              maximumAge: Infinity, //浏览器重新计算位置的时间间隔
            }
          );
        });
      }
    },

    /**
     * 手写递归实现深拷贝
     */
    deepClone() {
      const obj = [
        {
          name: "臧三",
          childs: ["小明", "小芳"],
          fn: function() {},
          age: undefined,
        },
      ];
      let cloneObj = this.clone(obj);
      cloneObj[0].childs = [];
      console.log(cloneObj);
    },
    // 检查数据类型
    checkType: (target) => {
      return Object.prototype.toString.call(target).slice(8, -1);
    },
    // 递归
    clone(target) {
      let cloneData;
      let type = this.checkType(target);
      // eslint-disable-next-line no-constant-condition
      cloneData = type === "Object" ? {} : "Array" ? [] : target;
      for (const i in target) {
        if (Object.hasOwnProperty.call(target, i)) {
          const value = target[i];
          let eleType = this.checkType(value);
          if (eleType === "Object" || eleType === "Array") {
            cloneData[i] = this.clone(value);
          } else {
            cloneData[i] = value;
          }
        }
      }
      return cloneData;
    },

    /**
     * 利用js构建虚拟DOM
     */
    virtualDOM() {
      // let dom = new createElement("div", { id: "real-dom" }, [
      //   new createElement("p", {}, ["Virtual DOM"]).render(),
      //   new createElement("ul", { class: "Virtual-ul" }, [
      //     new createElement("li", { class: "item" }, ["item 1"]).render(),
      //     new createElement("li", { class: "item" }, ["item 2"]).render(),
      //     new createElement("li", { class: "item" }, ["item 3"]).render(),
      //   ]).render(),
      // ]);
      // const VDOM = dom.render();
      // document.getElementById("main").appendChild(VDOM);
    },
  },
  computed: {
    vuexMsg() {
      let msg = "";
      msg = this.$store.state.message;
      return msg;
    },
    collapsetags() {
      let collapsed = false;
      collapsed = this.form.relay.length > 7 ? true : false;
      return collapsed;
    },
  },
};
</script>
<style Lang="scss" scoped>
.main {
  background-color: rgb(114, 169, 179);
}
.select /deep/ .el-input__inner {
  border: none;
}
.echarts {
  top: 150px;
}
.height28 /deep/ .el-input--mini .el-input__inner {
  height: 28px !important;
}
</style>
