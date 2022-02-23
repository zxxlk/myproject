<template>
  <!-- <div class="router-form"> -->
  <el-container class="width-full height-full" id="container">
    <el-header class="headerBox" height="50px">
      <header-bar></header-bar>
    </el-header>
    <el-main class="width-full height-full">
      <div class="form-main" id="map"></div>
    </el-main>
    <!--功能栏-->
    <div class="toolBar" id="toolBar">
      <div class="t_left ">
        <div class="tool_left" @click="toolShow = !toolShow">
          工具
          <span class="mrg_left mrg_right">
            <i :class="toolShow ? 'fa fa-angle-right' : 'fa fa-angle-left'"></i>
          </span>
        </div>
      </div>
      <transition>
        <div class="t_left flex" v-show="toolShow">
          <div v-for="item in data" :key="item.id">
            <el-select :value="item.label" size="mini" class="select">
              <el-option
                v-for="child in item.children"
                :key="child.id"
                :value="child.label"
                :label="child.label"
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
          <search-location></search-location>
        </div>
      </transition>
    </div>
    <!--添加数据-->
    <add-data ref="addData"></add-data>
    <!-- 侧边表格-->
    <side-main class="side_table" :sideTableObj="sideTableObj"></side-main>
    <div class="add_tablebtn">
      <el-button
        size="mini"
        icon="el-icon-circle-plus-outline"
        circle
        @click="addOneTableData"
      ></el-button>
      <el-button
        size="mini"
        icon="el-icon-circle-plus"
        circle
        @click="addTwoTableData"
      ></el-button>
    </div>
    <el-dialog
      :title="dataOne"
      :visible.sync="dataOneDialogVisible"
      class="dialog"
      id="data_dialog"
    >
      <el-form
        :model="formData"
        :rules="formRules"
        ref="dataOneForm"
        v-show="active == 0"
        class="dialog-form"
      >
        <el-form-item label="数据名称" label-width="80px" prop="name">
          <el-input
            v-model="formData.name"
            style="width:220px"
            class="dialog-form-input"
          ></el-input>
        </el-form-item>
        <el-form-item label="数据选项" label-width="80px" prop="options">
          <el-select
            v-model="formData.options"
            placeholder="请选择"
            filterable
            @change="editChooseValue"
            :value="formData.options"
          >
            <el-option label="第一数据" value="第一数据"> </el-option>
            <el-option label="第二数据" value="第二数据"></el-option>
          </el-select>
        </el-form-item>
      </el-form>

      <el-form
        :model="formTwoData"
        :rules="formRules"
        ref="dataTwoForm"
        v-show="active == 1"
      >
        <el-form-item label="输入数据" label-width="80px" prop="name">
          <el-input v-model="formTwoData.name" style="width:220px"></el-input>
        </el-form-item>
        <el-form-item label="选择数据" label-width="80px" prop="options">
          <el-select
            v-model="formTwoData.options"
            placeholder="请选择"
            clearable
          >
            <el-option label="第三数据" value="第三数据"> </el-option>
            <el-option label="第四数据" value="第四数据"></el-option>
          </el-select>
        </el-form-item>
      </el-form>

      <div slot="footer" class="dialog-footer">
        <el-button @click="resetFormOneData" size="mini">重置</el-button>
        <el-button size="mini" v-show="active == 0">选择</el-button>
        <el-button
          @click="dataOneDialogConfirm('dataTwoForm')"
          size="mini"
          v-show="active == 1"
          >确定</el-button
        >
        <el-button @click="back" v-show="active == 1" size="mini"
          >上一步</el-button
        >
        <el-button @click="next" v-show="active == 0" size="mini"
          >下一步</el-button
        >
      </div>
    </el-dialog>
    <div class="store" id="store">
      <el-table :data="tableData" style="width: 100%" stripe size="mini">
        <el-table-column prop="date" label="日期" width="100"></el-table-column>
        <el-table-column prop="name" label="姓名" width="100">
        </el-table-column>
        <el-table-column
          prop="address"
          label="地址"
          width="180"
          show-overflow-tooltip
        >
        </el-table-column>
      </el-table>
    </div>
    <div id="dd">
      <div id="id"></div>
    </div>

    <transition name="el-zoom-in-bottom">
      <div class="cardtable" id="cardtable">
        <el-card v-show="cardShow" id="card_table" class="card_table">
          <div slot="header" class="clearfix">
            <span>数据2</span>
            <el-button
              style="float: right; padding: 3px 0"
              type="text"
              @click="closeCard"
              >X</el-button
            >
          </div>
          <div v-for="o in 4" :key="o" class="text item">
            {{ "列表内容 " + o }}
          </div>
        </el-card>
      </div>
    </transition>
  </el-container>
  <!-- </div> -->
</template>
<script>
import "ol/ol.css";
import "ol-ext/dist/ol-ext.css";
import searchLocation from "../data/searchLocation.vue";
import sideMain from "../data/sideMain.vue";
import { Draw } from "ol/interaction";
import Overlay from "ol/Overlay";
import Map from "ol/Map";
import View from "ol/View";
import Tile from "ol/layer/Tile";
import OSM from "ol/source/OSM";
import { Vector as VectorLayer } from "ol/layer";
import { Vector as VectorSource } from "ol/source";
import {
  Style,
  Circle,
  Fill,
  Text,
  Icon,
  FontSymbol,
  Stroke,
  RegularShape,
} from "ol/style";
import { Polygon, LineString } from "ol/geom";
import { getArea, getLength } from "ol/sphere";
import { unByKey } from "ol/Observable";
import Draggable from "draggable";
import $ from "jquery";
import "jqueryui";
import addData from "../data/addData.vue";
import headerBar from "./testHeaderBox.vue";
import ImageLayer from "ol/layer/Image";
import Static from "ol/source/ImageStatic";

export default {
  data() {
    // name验证规则
    const validatorName = (rule, value, callback) => {
      if (this.isEmpty(value)) {
        return callback(new Error("数据不能为空"));
      } else {
        callback();
      }
    };
    return {
      toolShow: true, //是否显示工具栏
      dataOne: "数据",
      dataOneDialogVisible: false,
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
              method: this.clickDataOne,
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
      ],
      formData: {
        name: "",
        options: "",
      },
      formTwoData: {
        name: "",
        options: "",
      },
      // 表单验证规则,定义相应字段的验证规则，通过prop对应验证
      formRules: {
        name: [{ validator: validatorName, trigger: "blur" }],
        options: [{ required: true, message: "请选择数据", trigger: "blur" }],
      },
      active: 0, //控制显示哪一个表单
      dataTwoVisible: false, //数据2显示的dialog
      dataTwoTitle: "数据Two",
      sideTableObj: {},
      cardShow: false,
      dragElement: null,
      limit: null,
      options: {},
      activeIndex: "1",
    };
  },
  beforeRouteEnter(to, from, next) {
    // ...跳转到该路由之前的钩子函数
    next(); //不执行页面加载不成功
  },
  components: {
    searchLocation,
    sideMain,
    addData,
    headerBar,
  },
  created() {
    /**
     * 拖拽元素,对div元素有更好的作用效果，可使拖拽的元素都放在div中
     * // window.onresize = () => {
    //   this.draggableObj.setLimit(this.limit);
    // };
     */
    this.$nextTick(() => {
      this.dragElement = document.getElementById("cardtable");
      this.limit = document.getElementById("app");
      this.options = {
        setCursor: true,
        // limit: this.limit,
        onDrag: this.onDragFactory,
      };
      this.draggableObj = new Draggable(this.dragElement, this.options);
      this.dragElement.style.display = "none";
    });

    // 中断ajax请求
    let ajax = $.ajax({
      url:
        "http://192.168.6.107:8080/hgisserver/xu/ows?service=WFS&version=1.0.0&request=GetFeature&typeName=xu%3Aap&outputFormat=application%2Fjson",
      type: "GET",
      timeout: 100, // 设置超时时间ms
      contenType: "application/json",
      success(res) {},
      complete(XHR, TextStatus) {
        if (TextStatus === "timeout") {
          console.log("请求超时");
        }
      },
      error(error) {},
    });
    // ajax.abort(); //手动停止请求
  },
  computed: {
    tableData() {
      const data = [
        {
          date: "2016-05-02",
          name: "王小虎",
          address: "上海市普陀区金沙江路 1518 弄",
        },
        {
          date: "2016-05-04",
          name: "王小虎",
          address: "上海市普陀区金沙江路 1517 弄",
        },
        {
          date: "2016-05-01",
          name: "王小虎",
          address: "上海市普陀区金沙江路 1519 弄",
        },
        {
          date: "2016-05-03",
          name: "王小虎",
          address: "上海市普陀区金沙江路 1516 弄",
        },
      ];
      this.$store.commit("increment", data);
      return this.$store.state.tableData;
    },
  },
  mounted() {
    this.map = this.createMap();
    this.map.addLayer(this.createBasemap());
    const imageLayer = this.createImageLayer();
    /**
     * websocket，服务端主动向客户端推送消息
     */
    this.websocket = this.createWebSocket();
    this.websocket.onopen = () => {
      console.log("websocket建立连接");
    };
    this.websocket.onmessage = (evt) => {
      // 收到服务端推送的消息时，执行的回调
      console.log("收到的信息: >>", evt);
    };
    this.websocket.onclose = () => {
      console.log("close websocket");
    };
    // 跨域
    this.jsonpFn();
    /**
     * 切割字符串并拼接
     */
    this.stringFn();

    // jquery实现拖拽, 元素设置时设置为id，不设置class避免影响样式, 父元素设置id，并且不设置样式避免影响拖拽样式
    $("#dd").draggable({
      handle: "#id",
    });
  },
  methods: {
    /**
     * 加载图片图层
     */
    createImageLayer() {
      const layer = new ImageLayer({
        source: new Static({
          url: "https://imgs.xkcd.com/comics/online_communities.png",
        }),
      });
    },
    onDragFactory(element) {
      //拖拽过程中设置元素的样式
      // console.log((element.style.width = "100px"));
    },
    /**
     * 编辑选中的值
     */
    editChooseValue(value) {
      this.formData.options = value;
    },
    /**
     * 创建地图
     */
    createMap() {
      return new Map({
        target: "map",
        view: new View({
          zoom: 6,
          // center: [0, 0],
          center: [-5896194.710547658, -2995923.0484090103],
        }),
      });
    },
    /**
     * 创建OSM底图
     */
    createBasemap() {
      return new Tile({
        source: new OSM(),
      });
    },
    stringFn() {
      let a = "12345678999111";
      const length = a.length;
      let newStr = "";
      const count =
        length % 3 === 0 ? Math.trunc(length / 3) - 1 : Math.trunc(length / 3);
      for (let i = 0; i < count; i++) {
        let index = length - 3;
        index = index - i * 3;
        newStr = a.slice(0, index) + "," + a.slice(index);
        a = newStr;
      }
    },

    clickOption(child) {
      const id = child.id;
      switch (id) {
        case 11:
          this.clickDataOne();
          break;

        default:
          break;
      }
    },

    /**
     * 点击数据1
     */
    clickDataOne() {
      this.dataOneDialogVisible = true;
    },

    /**
     * 点击数据1，确认按钮
     */
    dataOneDialogConfirm(formName) {
      //验证整个表单
      this.$refs[formName].validate((valid) => {
        if (valid) {
          this.dataOneDialogVisible = false;
          this.formData = {
            name: "",
            options: "",
          };
        } else {
          this.dataOneDialogVisible = true;
        }
      });
    },
    /**
     * 重置表单数据
     */
    resetFormOneData() {
      if (this.active === 0) {
        this.formData = {
          name: "",
          options: "",
        };
      }
      if (this.active === 1) {
        this.formTwoData = {
          name: "",
          options: "",
        };
      }
    },

    /**
     * 验证name
     */
    isEmpty(value) {
      return value === undefined || value === null || value === "";
    },

    /**
     * next
     */
    next() {
      //上一步表单满足条件才进行下一步
      this.$refs["dataOneForm"].validate((pass) => {
        if (pass) {
          this.active = 1;
        } else {
          return false;
        }
      });
    },

    /**
     * prePage
     */
    back() {
      this.active = 0;
    },

    /**
     * 点击添加表格数据
     */
    addOneTableData() {
      (this.sideTableObj = {}),
        (this.sideTableObj = {
          first_table: [
            {
              date: "2016-05-02",
              name: "王小虎",
              address: "上海市普陀区金沙江路 1518 弄",
              tip: "1000302",
              id: "1",
            },
          ],
        });
    },
    addTwoTableData() {
      (this.sideTableObj = {}),
        (this.sideTableObj = {
          second_table: [
            {
              date: "2021-05-02",
              name: "李二虎",
              address: "南京市吉印大道1886号",
              tip: "300040",
              id: "2",
            },
            {
              date: "2021-10-02",
              name: "张二虎",
              address: "南京市吉印大道1886号",
              tip: "300040",
              id: "3",
            },
          ],
        });
    },

    /**
     * 创建websocket
     */
    createWebSocket() {
      return new WebSocket("ws://echo.websocket.org"); //参数为服务端地址
    },
    /**
     * jsonp解决跨域
     */
    jsonpFn() {
      // const url =
      //   "http://192.168.6.107:8080/hgisserver/xu/ows?service=WFS&version=1.0.0&request=GetFeature&typeName=xu%3Aap&maxFeatures=1000000&outputFormat=application%2Fjson";
      const url = "http://www.doubanapi.com/movie.html";
      $.ajax({
        url,
        type: "GET",
        dataType: "jsonp",
        jsonpCallback: "handleResponse", // 自定义回调函数
        contentType: "text/javascript",
        success(res) {
          console.log("res: >>", res);
        },
        error(error) {
          console.log("error: >>", error);
        },
      });
    },
    handleResponse(res) {
      console.log("jsonp: >>>", res);
    },

    /**
     * 测量长度
     */
    measureLength() {
      if (!this.drawLayer) {
        this.createDrawLayer();
      }
      let interaction = this.map.getInteractions();
      let drawInteraction = [];
      interaction.forEach((i) => {
        if (i instanceof Draw) {
          drawInteraction.push(i);
        }
      });
      drawInteraction.forEach((interaction) => {
        this.map.removeInteraction(interaction);
      });
      this.drawInteraction();
    },
    /**
     * 获取测量长度
     */
    formatLength(line) {
      const length = getLength(line);
      let output;
      if (length > 100) {
        output = Math.round((length / 1000) * 100) / 100 + " " + "km";
      } else {
        output = Math.round(length * 100) / 100 + " " + "m";
      }
      return output;
    },
    /**
     * 添加交互
     */
    drawInteraction() {
      this.draw = new Draw({
        source: this.drawSource,
        type: "LineString",
        style: this.drawStyle(),
      });
      this.map.addInteraction(this.draw);
      this.createMeasureTooltip();
      this.draw.on("drawstart", (e) => {
        // set sketch
        this.sketch = e.feature;
        let tooltipCoord = e.coordinate;
        this.listener = this.sketch.getGeometry().on("change", (e) => {
          const geom = e.target;
          let output;
          if (geom instanceof LineString) {
            output = this.formatLength(geom);
            tooltipCoord = geom.getLastCoordinate();
          }
          this.measureTooltipElement.innerHTML = output;
          this.measureTooltip.setPosition(tooltipCoord);
        });
      });

      this.draw.on("drawend", () => {
        this.measureTooltipElement.className = "ol-tooltip ol-tooltip-static";
        this.measureTooltip.setOffset([0, -7]);
        this.sketch = null;
        this.measureTooltipElement = null;
        this.createMeasureTooltip();
        unByKey(this.listener);
      });
    },

    /**
     * 添加测量图层
     */
    createDrawLayer() {
      this.drawSource = new VectorSource();
      this.drawLayer = new VectorLayer({
        source: this.drawSource,
        style: new Style({
          fill: new Fill({
            color: "rgba(255, 255, 255, 0.2)",
          }),
          stroke: new Stroke({
            color: "#ffcc33",
            width: 2,
          }),
          image: new Circle({
            radius: 7,
            fill: new Fill({
              color: "#ffcc33",
            }),
          }),
        }),
      });
      this.map.addLayer(this.drawLayer);
    },
    createMeasureTooltip() {
      if (this.measureTooltipElement) {
        this.measureTooltipElement.parentNode.removeChild(
          this.measureTooltipElement
        );
      }
      this.measureTooltipElement = document.createElement("div");
      this.measureTooltipElement.className = "ol-tooltip ol-tooltip-measure";
      this.measureTooltip = new Overlay({
        element: this.measureTooltipElement,
        offset: [0, -15],
        positioning: "bottom-center",
        stopEvent: false,
        insertFirst: false, //附加新的overlay，显示在原来的之上
      });
      this.map.addOverlay(this.measureTooltip);
    },

    /**
     * draw过程中样式
     */
    drawStyle() {
      return new Style({
        fill: new Fill({
          color: "rgba(255, 255, 255, 0.2)",
        }),
        stroke: new Stroke({
          color: "rgba(0, 0, 0, 0.5)",
          lineDash: [10, 10],
          width: 2,
        }),
        image: new Circle({
          radius: 5,
          stroke: new Stroke({
            color: "rgba(0, 0, 0, 0.7)",
          }),
          fill: new Fill({
            color: "rgba(255, 255, 255, 0.2)",
          }),
        }),
      });
    },
    showCardData() {
      /**
       * 点击展示卡片
       */
      this.dragElement.style.display = "block";
      this.cardShow = true;
    },

    /**
     * 关闭卡片
     */
    closeCard() {
      // 隐藏div
      this.dragElement.style.display = "none";
      this.cardShow = !this.cardShow;
    },
    addData() {
      this.$refs.addData.openDialog();
    },
  },
};
</script>
<style Lang="scss" scoped>
/**使用deep，深度作用子组件样式时，父组件要有hash值 */
.select /deep/ .el-input__inner {
  border: none;
}
.el-select /deep/ .el-input--mini {
  font-size: 14px;
}
.el-select-dropdown__item {
  font-size: 12px;
}
.el-dialog__wrapper /deep/.el-dialog__header {
  text-align: left;
}
.el-dialog__wrapper /deep/.el-dialog__body {
  padding: 11px 10px;
}
.el-dialog__wrapper /deep/ .el-dialog {
  width: 350px;
}
#map {
  width: 100%;
  height: 100%;
  background-color: rgb(119, 165, 156);
}
.side_table {
  position: absolute;
  top: 50%;
  right: 0;
  transform: translateY(-50%);
}
.add_tablebtn {
  position: absolute;
  top: 120px;
  left: 20px;
}
.a {
  position: absolute;
  top: 200px;
  left: 30px;
  width: 500px;
  height: 500px;
  display: flex;
  background-color: blue;
}
.b {
  width: 200px;
  background-color: aqua;
}
.c {
  flex: 1;
  background-color: bisque;
}
.store {
  position: absolute; /**绝对定位，相对于上级父元素；相对定位，相对于本身正常位置（不设置定位时） */
  top: 200px;
  left: 10px;
  font-size: 30px;
}
/**设置测量距离展示信息div的样式 */
.form-main /deep/ .ol-tooltip {
  position: relative;
  background: rgba(0, 0, 0, 0.5);
  border-radius: 4px;
  color: white;
  padding: 4px 8px;
  opacity: 0.7;
  white-space: nowrap;
  font-size: 12px;
  cursor: default;
  user-select: none;
}
.form-main /deep/.ol-tooltip-static {
  background-color: #ffcc33;
  color: black;
  border: 1px solid white !important;
}
.form-main /deep/ .ol-tooltip-static:before {
  border-top-color: #ffcc33 !important;
}
.form-main /deep/ .ol-tooltip-measure:before,
.form-main /deep/ .ol-tooltip-static:before {
  border-top: 6px solid rgba(0, 0, 0, 0.5);
  border-right: 6px solid transparent;
  border-left: 6px solid transparent;
  content: "";
  position: absolute;
  bottom: -6px;
  margin-left: -7px;
  left: 50%;
}
.form-main /deep/ .ol-tooltip-measure {
  opacity: 1;
  font-weight: bold;
}

#id {
  position: absolute;
  background-color: rgb(0, 122, 255);
  border-radius: 50%;
  width: 100px;
  height: 100px;
  cursor: move;
  bottom: 0;
}

#card_table {
  position: absolute;
  width: 200px;
  height: 170px;
  left: 50%;
  margin-left: -100px;
  cursor: move;
  bottom: 0;
}
.cardtable {
  /* display: none; */
  position: absolute;
  width: 200px;
  height: 170px;
  left: 50%;
  margin-left: -100px;
  cursor: move;
  bottom: 0;
}

/**P 标签是块级元素*/
/* .flex-content .scrollbar-demo-item {
  display: flex;
  flex-shrink: 0;
  justify-content: center;
  align-items: center;
  width: 100px;
  height: 50px;
  background-color: aquamarine;
  margin: 10px;
  border-radius: 4px;
} */
</style>
