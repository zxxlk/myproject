<template>
  <el-container class="width-full height-full" id="container">
    <el-header class="headerBox" height="50px">
      <header-bar></header-bar>
    </el-header>
    <el-main class="main">
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
      <set-params
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
            <el-select v-model="form.relay" placeholder="请选择">
              <el-option label="COPEL_relay" value="COPEL_relay"></el-option>
              <el-option
                label="Reference_relay"
                value="Reference_relay"
              ></el-option>
            </el-select>
          </el-form-item>
          <el-form-item label="Meter" prop="meter">
            <el-select v-model="form.meter" placeholder="请选择">
              <el-option label="meter" value="meter"></el-option>
            </el-select>
          </el-form-item>
        </el-form>
      </set-params>
      <div style="top: 100px; position: absolute; left: 20px">
        <p>{{ $t("data.hello") }}</p>
        <el-button type="primary" @click="back">{{ vuexMsg }}</el-button>
        <el-button type="primary" @click="CSVToArray">{{
          this.$store.state.a.msgA
        }}</el-button>
      </div>
      <div id="echarts" class="echarts" style="width:400px;height:400px"></div>
    </el-main>
  </el-container>
</template>
<script>
import headerBar from "./testHeaderBox.vue";
import Tip from "../mixins/tip.js";
import setParams from "../data/setParams.vue";
import * as echarts from "echarts";

export default {
  mixins: [Tip],
  data() {
    return {
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
              label: "数据2",
              icon: "fa fa-check-circle-o",
              method: this.showCardData,
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
        relay: "",
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
    };
  },
  components: {
    headerBar,
    setParams,
  },
  created() {
    const query = this.$route.query;
    this.basic = this.$t("data.basic");
  },
  mounted() {
    this.initEcharts();
    window.onresize = () => {
      this.myEcharts.resize();
    };
  },
  methods: {
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
  },
  computed: {
    vuexMsg() {
      let msg = "";
      msg = this.$store.state.message;
      return msg;
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
</style>
