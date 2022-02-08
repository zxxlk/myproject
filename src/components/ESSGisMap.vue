<template>
  <div class="gis_ess_map">
    <el-container>
      <el-header class="headerBox" height="50px">
        <header-bar></header-bar>
      </el-header>
      <el-main>
        <div id="map" class="gis_map">
          <popup
            v-show="ifPopupShow"
            ref="popup"
            :popupData="popupData"
            id="popup"
            tabindex="0"
          ></popup>
          <legend-box ref="legendbox" class="legendBox"></legend-box>
          <div id="gis_inline-input">
            <el-autocomplete
              class="gis_inline-input"
              v-model="state"
              placeholder="搜索地图"
              :fetch-suggestions="querySearch"
              :trigger-on-focus="trigger"
              @select="handleSelect"
              ref="inputBox"
              popper-class="gis_popper"
            >
              <el-button
                class="gis_button"
                slot="append"
                icon="el-icon-search"
                @click="locateAddress"
              ></el-button>
            </el-autocomplete>
          </div>
          <div>
            <el-button
              class="gis_save_address"
              @click="saveAddressCoodinate"
              ref="saveAddress"
              >确定</el-button
            >
          </div>
        </div>
      </el-main>
    </el-container>
  </div>
</template>
<script>
import "ol/ol.css";
import "ol-ext/dist/ol-ext.css";
import Map from "ol/Map";
import View from "ol/View";
import TileLayer from "ol/layer/Tile";
import { TileWMS, XYZ } from "ol/source";
import { Vector as VectorSource, Cluster } from "ol/source";
import { Style, Icon, Circle, Text, Fill, Stroke } from "ol/style";
import { Point } from "ol/geom";
import { Vector as VectorLayer } from "ol/layer";
import Control from "ol/control";
import { transform, transformExtent } from "ol/proj";
import layerPopup from "ol-ext/control/LayerPopup";
import { MousePosition } from "ol/control";
import Popup from "ol-ext/overlay/Popup";
import { createStringXY } from "ol/coordinate";
import * as Extent from "ol/extent";
import Feature from "ol/Feature";
import { GeoJSON } from "ol/format";
import WFS from "ol/format/WFS";
import Select from "ol/interaction/Select";
import { pointerMove } from "ol/events/condition";
import iconURL from "../assets/locateIcon.png";
import powerIconURL from "../assets/locate.png";
import onlineIcon from "../assets/onlineIcon.png";
import allOfflineIcon from "../assets/allOfflineIcon.png";
import pieceOfflineIcon from "../assets/pieceOfflineIcon.png";
import alarmIcon from "../assets/alarmIcon.png";
import popup from "./popup.vue";
import SelectCluster from "ol-ext/interaction/SelectCluster";
import AnimatedCluster from "ol-ext/layer/AnimatedCluster";
import legendBox from "./legendBox.vue";
import headerBar from "../components/testHeaderBox.vue";
export default {
  /**
   *  所有页面功能
   */
  data() {
    return {
      CENTER: [-52.5292662973, -25.8559629834],
      // CENTER: [-47.93, -15.78],
      ZOOM: 8,
      LOCATE_ZOOM: 13,
      MAP_PROJECTION: "EPSG:3857",
      DISPLAY_PROJECTION: "EPSG:4326",
      state: "",
      KEY: "AIzaSyCx_0AIW05o5d4B4FNO2g8g7Iwk6u6cAKc", //google key
      searchResults: [],
      searchCountrys: [],
      searchCountry: "", // 点击保存输出的地址简称
      SCALE: 0.3,
      POWER_SCALE: 0.8,
      trigger: false,
      choosedAddressCoordinate: "",
      LANGUAGE: "zh-cn", //指定语言
      ifPopupShow: false,
      HITTOLERANCE: 0,
      ID: "id",
      popupData: [],
      popupContentObj: {},
      powerStationData: "", //电站设备信息
      CLICK: true, //true点击，false不点击
      ZERO_RESULTS: "找不到此请求的结果",
      INVALID_REQUEST: "该请求无效",
      NOT_FOUND: "找不到引用的位置",
      OVER_QUERY_LIMIT: "该应用程序已超过其请求配额",
      REQUEST_DENIED: "请求被拒绝",
      UNKNOWN_ERROR: "服务器错误",
      ERROR: "请求超时",
      isHaveAdress: false, //是否有选中地址
      initAdressCoor: [-51.5292662973, -26.8559629834], // 初始选中地址坐标
      POWER_INFORMATION: [
        {
          id: "001",
          state: "0",
          longitude: "118.796877",
          latitude: "32.060255",
          powerData: [
            {
              label: "station",
              value: "南京",
            },
            {
              label: "status",
              value: "在线",
            },
          ],
        },
        {
          id: "002",
          state: "1",
          longitude: "118.77894",
          latitude: "32.855985",
          powerData: [
            {
              label: "station",
              value: "南京南",
            },
            {
              label: "status",
              value: "全部离线",
            },
          ],
        },
        {
          id: "003",
          state: "2",
          longitude: "118.77788",
          latitude: "32.005985",
          powerData: [
            {
              label: "station",
              value: "南京海兴",
            },
            {
              label: "status",
              value: "部分离线",
            },
          ],
        },
        {
          id: "004",
          state: "3",
          longitude: "118.77659",
          latitude: "31.805965",
          powerData: [
            {
              label: "station",
              value: "南京百家湖",
            },
            {
              label: "status",
              value: "告警",
            },
          ],
        },
      ], //模拟后端返回电站信息数据
    };
  },
  components: {
    popup,
    legendBox,
    headerBar,
  },

  //meta
  metaInfo() {
    if (!window.google) {
      return {
        script: [
          {
            src: `https://maps.googleapis.com/maps/api/js?key=${this.KEY}&libraries=places&language=${this.LANGUAGE}`,
            async: true,
            defer: true,
            callback: () => this.MapsInit(),
          },
        ],
      };
    } else {
      this.MapsInit();
    }
  },
  mounted() {
    this.map = this.initMap();
    this.googleStreetLayer = this.googleStreetMap();
    this.locateVectorLayer = this.createLocateVectorLayer();
    this.map.addLayer(this.googleStreetLayer);
    this.map.addLayer(this.locateVectorLayer);
    this.locateVectorLayer.setStyle(this.locateStyle);
    this.map.addControl(this.addMouseControl());
    //点击地图显示关联地址
    if (this.CLICK === true) {
      this.clickMapAddress();
    }
    this.popup = this.createPopup();
    this.map.addOverlay(this.popup);
    if (this.POWER_INFORMATION.length > 0) {
      this.locatePowerStation();
    }
    // 有选中地址时，定位该地址位置
    if (this.isHaveAdress === true) {
      this.locateChooseAddress();
    }
  },
  methods: {
    //建立地图容器
    initMap() {
      const map = new Map({
        target: "map",
        view: new View({
          center: transform(
            this.CENTER,
            this.DISPLAY_PROJECTION,
            this.MAP_PROJECTION
          ),
          zoom: this.ZOOM,
          extent: [-20026376.39, -20078966.1, 20026376.39, 20078966.1],
        }),
      });
      return map;
    },
    //加载google地图 street
    googleStreetMap() {
      return new TileLayer({
        source: new XYZ({
          url:
            // "http://mt3.google.cn/maps/vt?lyrs=m%40817&hl=zh-CN&gl=CN&x={x}&y={y}&z={z}",
            `https://www.google.com/maps/vt?lyrs=m@189&hl=${this.LANGUAGE}&x={x}&y={y}&z={z}`,
          maxZoom: 19,
        }),
      });
    },
    //加载google地图 global
    googleStreetMapGlobal() {
      return new TileLayer({
        source: new XYZ({
          url:
            "http://www.google.com/maps/vt?lyrs=m@189&gl=cn&x={x}&y={y}&z={z}",
          maxZoom: 19,
        }),
      });
    },
    //建立矢量点图层
    createLocateVectorLayer() {
      return new VectorLayer({
        source: new VectorSource(),
      });
    },
    /**
     * 如果初始有选中地址，定位该地址，显示图标
     */
    locateChooseAddress() {
      let initAddrsssFeatures = [];
      //传入地址的坐标initAdressCoor格式为4326格式
      const addressCoor = transform(
        this.initAdressCoor,
        this.DISPLAY_PROJECTION,
        this.MAP_PROJECTION
      );
      const addressFeature = new Feature({
        geometry: new Point(addressCoor),
      });
      initAddrsssFeatures.push(addressFeature);
      this.addFeatureLayer(initAddrsssFeatures);
      this.locate(initAddrsssFeatures);
    },
    /**
     *  状态码判断
     */
    statusMessage(status) {
      if (status === "ZERO_RESULTS") {
        this.$message({
          type: "error",
          message: this.ZERO_RESULTS,
          showClose: true,
        });
      }
      if (status === "INVALID_REQUEST") {
        this.$message({
          type: "error",
          message: this.INVALID_REQUEST,
          showClose: true,
        });
      }
      if (status === "NOT_FOUND") {
        this.$message({
          type: "error",
          message: this.NOT_FOUND,
          showClose: true,
        });
      }
      if (status === "OVER_QUERY_LIMIT") {
        this.$message({
          type: "error",
          message: this.OVER_QUERY_LIMIT,
          showClose: true,
        });
      }
      if (status === "REQUEST_DENIED") {
        this.$message({
          type: "error",
          message: this.REQUEST_DENIED,
          showClose: true,
        });
      }
      if (status === "UNKNOWN_ERROR") {
        this.$message({
          type: "error",
          message: this.UNKNOWN_ERROR,
          showClose: true,
        });
      }
      if (status === "ERROR") {
        this.$message({
          type: "error",
          message: this.ERROR,
          showClose: true,
        });
      }
    },
    /**
     * 添加鼠标显示坐标控件
     */
    addMouseControl() {
      return new MousePosition({
        coordinateFormat: createStringXY(5),
        projection: this.DISPLAY_PROJECTION,
        className: "custom-mouse-position",
        underfinedHTML: "&nbsp",
      });
    },
    MapsInit() {
      this.service = new window.google.maps.places.AutocompleteService();
      console.log("查看地图服务是否初始化: >>", this.service);
    },
    displaySuggestions(predictions, status, cb) {
      let searchResults = [];
      if (status === window.google.maps.places.PlacesServiceStatus.OK) {
        searchResults = predictions.map((prediction) => {
          return { value: prediction.description };
        });
      } else {
        this.statusMessage(status);
      }
      cb(searchResults);
    },
    /**
     *  输入内容时搜索内容
     */
    querySearch(queryString, cb) {
      if (queryString === "") {
        cb(this.searchResults);
        return;
      }
      console.log("this.service: >>>", this.service);
      this.service.getQueryPredictions(
        {
          input: queryString,
          types: ["(cities)"],
        },
        (predictions, status) => {
          this.displaySuggestions(predictions, status, cb);
        }
      );
    },
    /**
     * 选中列表选项-地理编码定位
     */
    handleSelect(item) {
      const value = item.value;
      this.geocoder = new window.google.maps.Geocoder();
      this.geocoder.geocode(
        {
          address: value,
        },
        (results, status) => {
          this.geocodeAddress(results, status);
        }
      );
    },
    geocodeAddress(results, status) {
      // 输入内容并选择相关地址后，点击保存，保存改地址的经纬度，简称及地址信息
      if (this.searchCountry !== "") {
        this.searchCountry = "";
      }
      const relateCountrys = results[0].address_components;
      relateCountrys.forEach((element) => {
        if (element.types.indexOf("country") !== -1) {
          this.searchCountry = element.short_name;
        }
      });
      const locateFeature = [];
      if (status === "OK") {
        const addressLocation = results[0].geometry.location;
        const latlng = [addressLocation.lng(), addressLocation.lat()];
        const address = results[0].formatted_address;
        const coordinates = transform(
          latlng,
          this.DISPLAY_PROJECTION,
          this.MAP_PROJECTION
        );
        this.choosedAddressCoordinate = latlng;
        const feature = new Feature({
          geometry: new Point(coordinates),
        });
        locateFeature.push(feature);
        this.addFeatureLayer(locateFeature);
        this.locate(locateFeature);
      } else {
        this.statusMessage(status);
      }
    },
    /**
     * 定位所选地址
     */
    locate(feature) {
      const geom = feature[0].getGeometry();
      const coordinates = feature[0].getGeometry().getCoordinates();
      const view = this.map.getView();
      //定位无动画
      view.fit(geom);
      if (geom instanceof Point) {
        view.setZoom(this.LOCATE_ZOOM);
      }
      //实现定位动画
      //   const duration = 2000;
      //   let parts = 2;
      //   let called = false;
      //   let cb = function(complete) {
      //     --parts;
      //     if (called) {
      //       return;
      //     }
      //     if (parts === 0 || !complete) {
      //       called = true;
      //     }
      //   };
      //   view.animate(
      //     {
      //       center: coordinates,
      //       duration: duration,
      //     }, cb & cb);
      //   view.animate(
      //     {
      //       zoom: this.LOCATE_ZOOM - 2,
      //       duration: duration / 2,
      //     },
      //     {
      //       zoom: this.LOCATE_ZOOM - 1,
      //       duration: duration / 2,
      //     },cb & cb);
    },
    //矢量地图添加元素
    addFeatureLayer(features) {
      this.locateVectorLayer.getSource().clear();
      if (features.length === 1) {
        this.locateVectorLayer.getSource().addFeature(features[0]);
      } else {
        this.locateVectorLayer.getSource().addFeatures(features);
      }
    },
    //定位元素样式
    locateStyle() {
      return new Style({
        image: new Icon({
          src: iconURL,
          scale: this.SCALE,
        }),
      });
    },
    /**
     *  点击按钮，定位输入地址
     */
    locateAddress() {
      this.geocoder = new window.google.maps.Geocoder();
      this.geocoder.geocode(
        {
          address: this.state,
        },
        (results, status) => {
          this.geocodeAddress(results, status);
        }
      );
    },
    /**
     * 点击地图，显示相关地址 每次点击清空保存的简称及输入框内容
     */
    clickMapAddress() {
      this.map.on("click", (e) => {
        if (this.state !== "") {
          this.state = "";
        }
        if (this.searchCountry !== "") {
          this.searchCountry = "";
        }
        const clickCoordinate = e.coordinate;
        const coordinates = transform(
          clickCoordinate,
          this.MAP_PROJECTION,
          this.DISPLAY_PROJECTION
        );
        const latlng = {
          lng: parseFloat(coordinates[0]),
          lat: parseFloat(coordinates[1]),
        };
        this.geocoder = new window.google.maps.Geocoder();
        this.geocoder.geocode(
          {
            location: latlng,
          },
          (results, status) => {
            this.relateAddress(results, status);
          }
        );
      });
    },
    relateAddress(results, status) {
      if (status === "OK") {
        this.searchResults = results.map((result) => {
          return { value: result.formatted_address };
        });
        this.searchCountrys = results[0].address_components;
        this.searchCountrys.forEach((element) => {
          if (element.types.indexOf("country") !== -1) {
            this.searchCountry = element.short_name;
          }
        });
        this.trigger = true;
        this.$nextTick(() => {
          this.$refs.inputBox.focus();
        });
        let addressFeatures = [];
        results.forEach((element) => {
          let latlng = [
            element.geometry.location.lng(),
            element.geometry.location.lat(),
          ];
          let relateCoordinates = transform(
            latlng,
            this.DISPLAY_PROJECTION,
            this.MAP_PROJECTION
          );
          const feature = new Feature({
            geometry: new Point(relateCoordinates),
          });
          addressFeatures.push(feature);
        });
        this.addFeatureLayer(addressFeatures);
      } else {
        this.statusMessage(status);
      }
    },
    /**
     * 保存所选地址的经纬度信息
     */
    saveAddressCoodinate(e) {
      let target = e.target;
      if (target.nodeName === "SPAN" || target.nodeName === "I") {
        target = e.target.parentNode;
      }
      target.blur();
      console.log(this.choosedAddressCoordinate); //4326格式
      console.log(this.state);
      console.log(this.searchCountry); //点选国家
    },
    /**
     *  根据所传电站经纬度，显示设备----------
     */
    locatePowerStation() {
      // 解析设备经纬度信息
      this.powerStationData = this.POWER_INFORMATION; //初始从后台获取电站信息
      let allPowerFeature = [];
      for (let i = 0; i < this.powerStationData.length; i++) {
        const data = this.powerStationData[i];
        const id = data.id;
        const coordinate = transform(
          [data.longitude, data.latitude],
          this.DISPLAY_PROJECTION,
          this.MAP_PROJECTION
        );
        const feature = new Feature({
          geometry: new Point(coordinate),
          id: data.id,
          state: data.state,
        });
        allPowerFeature.push(feature);
      }
      // 建立新增电站矢量聚合图层
      const powerStationVectorLayer = new AnimatedCluster({
        distance: 100,
        source: new Cluster({
          source: new VectorSource(),
        }),
      });
      console.log(powerStationVectorLayer.getSource().getSource());
      powerStationVectorLayer
        .getSource()
        .getSource()
        .addFeatures(allPowerFeature);
      this.map.addLayer(powerStationVectorLayer);
      powerStationVectorLayer.setStyle((feature) =>
        this.powerStationStyle(feature)
      );
      this.locate(allPowerFeature);
      //实现聚合交互
      this.selectCluster = this.createSelectClusterInteraction([
        powerStationVectorLayer,
      ]);
      this.selectClusterLayer = this.selectCluster.getLayer();
      this.selectClusterLayer.setStyle((feature) =>
        this.iconStyleFunction(feature)
      );
      this.selectPoint = this.createSelectInteraction([
        powerStationVectorLayer,
        this.selectClusterLayer,
      ]);
      this.map.addInteraction(this.selectCluster);
      this.map.addInteraction(this.selectPoint);
      this.addSelectEvent(this.selectPoint, this.popup);
      // this.addWatchData(this.selectPoint);
    },
    //新增电站图层样式
    powerStationStyle(feature) {
      const size = feature.get("features").length;
      if (size > 1) {
        return new Style({
          image: new Circle({
            fill: new Fill({
              color: "#ffa500",
            }),
            radius: 10,
          }),
          text: new Text({
            text: String(size),
          }),
        });
      }
      if (size === 0) return new Style();
      if (size === 1) return this.iconStyleFunction(feature);
    },
    /**
     * 单个设备样式
     */
    iconStyleFunction(feature) {
      const geometry = feature.getProperties().geometry;
      if (geometry instanceof Point) {
        let featureIconURL;
        const status = feature.getProperties().features[0].getProperties()
          .state;
        if (status === "0") featureIconURL = onlineIcon;
        if (status === "1") featureIconURL = allOfflineIcon;
        if (status === "2") featureIconURL = pieceOfflineIcon;
        if (status === "3") featureIconURL = alarmIcon;
        return new Style({
          image: new Icon({
            src: featureIconURL,
            scale: this.POWER_SCALE,
          }),
        });
      }
    },
    /**
     * 实现聚合交互
     */
    createSelectClusterInteraction(layers) {
      return new SelectCluster({
        pointRadius: 20, //点开之后元素之间的距离
        spiral: true,
        animate: true,
        layers,
        filter: (feature) => {
          if (this.isMultiClusterFeature(feature)) return true;
          return false;
        },
      });
    },
    /**
     * 显示电站设备信息
     */
    createPopup() {
      return new Popup({
        popupClass: "default anim",
        positioning: "bottom-center",
        autoPan: false,
        autoPanAnimation: { duration: 100 },
        hitTolerance: this.HITTOLERANCE,
      });
    },
    // 添加元素交互
    createSelectInteraction(layers) {
      return new Select({
        condition: pointerMove,
        layers,
        filter: (feature) => {
          //非聚合元素，而且是点元素
          if (
            !this.isMultiClusterFeature(feature) &&
            this.isPointFeature(feature)
          )
            return true;
          return false;
        },
        style: null,
      });
    },
    //判断是否是聚合要素
    isMultiClusterFeature(feature) {
      if (this.isClusterFeature(feature) && feature.get("features").length > 1)
        return true;
      return false;
    },
    isClusterFeature(feature) {
      if (feature.get("features")) return true;
      return false;
    },
    //判断是否是点元素
    isPointFeature(feature) {
      if (feature.getGeometry() instanceof Point) return true;
      return false;
    },
    /**
     * 添加电站悬浮显示popup事件
     */
    addSelectEvent(interaction, popup) {
      let inter = false;
      interaction.on("select", (event) => {
        const [deselectedFeature] = event.deselected;
        const [feature] = event.selected;
        let coordinate;
        if (feature && !this.isMultiClusterFeature(feature)) {
          const id = this.getFeatureId(feature);
          coordinate = this.getFeatureCoordinate(feature);
          const powerCotent = this.getContentById(id);
          this.hidePopup();
          this.ifPopupShow = true;
          this.popupData = powerCotent;
          popup.show(coordinate, this.$refs.popup.$el);
        }
        if (deselectedFeature && popup) {
          //获取popup 元素对象, 实现悬浮pop上时不关闭pop图--------
          const element = popup.getElement("button");
          const popElement = element.getElementsByClassName(
            "ol-popup-content"
          )[0];
          const pop = document.getElementById("popup").id;
          popElement.onmouseenter = () => {
            inter = true;
            popup.show(coordinate, this.$refs.popup.$el);
          };
          popElement.onmouseleave = () => {
            inter = false;
            this.hidePopup();
          };
          if (inter === false) {
            this.hidePopup();
          }
          // this.hidePopup();
          interaction.getFeatures().clear();
        }
      });
    },
    // 获取所选元素坐标
    getFeatureCoordinate(feature) {
      if (this.isClusterFeature(feature)) {
        return feature.get("geometry").getCoordinates();
      }
      return feature.getGeometry().getCoordinates();
    },
    // 隐藏popup
    hidePopup() {
      if (this.popup) {
        this.popup.hide();
      }
    },
    //获取设备id
    getFeatureId(feature) {
      if (this.isClusterFeature(feature)) {
        return feature.get("features")[0].getProperties()[this.ID];
      }
      return feature.getProperties()[this.ID];
    },
    //根据元素id获取对应设备信息
    getContentById(id) {
      let result = [];
      for (let i = 0; i < this.powerStationData.length; i++) {
        const item = this.powerStationData[i];
        if (id === item.id) {
          result = item.powerData;
        }
      }
      return result;
    },
  },
};
</script>
<style>
#nav {
  padding: 0px;
}
.gis_map {
  width: 100%;
  height: 100%;
  position: absolute;
}
.ol-zoom {
  right: 0.5em !important;
  top: 0.5em;
  left: auto !important;
}
.custom-mouse-position {
  left: 10px;
  bottom: 10px;
  font-size: 14px !important;
  position: absolute;
  font-family: Arial;
  color: #f33939;
}
.ol-control {
  background-color: transparent !important;
}
.ol-control:hover {
  background-color: transparent !important;
}
.gis_ess_map .el-input-group__append {
  background: #fff;
}
.gis_ess_map .el-input-group--append .el-input__inner,
.el-input-group__prepend {
  border-right: none;
}
.gis_ess_map .el-input__inner:focus {
  border: 1px solid #dcdfe6;
  border-right: none;
}
.gis_ess_map .el-input__inner:hover {
  border: 1px solid #dcdfe6;
  border-right: none;
}
.gis_ess_map .el-autocomplete {
  position: absolute;
  display: inline-block;
  z-index: 1;
  left: 0.5em;
  top: 0.5em;
}
.gis_popper .el-scrollbar {
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
}
.gis_popper .el-scrollbar__wrap {
  position: relative;
}
.gis_popper {
  width: 258px !important;
}
.el-autocomplete-suggestion li {
  font-size: 12px !important;
}
.gis_save_address {
  position: absolute;
  z-index: 1;
  bottom: 0.5em;
  right: 0.5em;
}
.notify_text {
  position: relative;
  left: 550px !important;
  top: 603px !important;
}
.legendBox {
  z-index: 1;
  position: absolute;
  right: 10px;
  bottom: 50px;
}
</style>
