<template>
  <div id="map" class="map">
    <div id="inline-input">
      <el-autocomplete
        class="inline-input"
        v-model="state"
        placeholder="搜索地图"
        :fetch-suggestions="querySearch"
        :trigger-on-focus="trigger"
        @select="handleSelect"
        ref="inputBox"
      >
        <el-button
          slot="append"
          icon="el-icon-search"
          @click="locateAddress"
        ></el-button>
      </el-autocomplete>
    </div>
    <div>
      <el-button
        class="save_address"
        @click="saveAddressCoodinate"
        ref="saveAddress"
        >确定</el-button
      >
    </div>
  </div>
</template>
<script>
import "ol/ol.css";
import "ol-ext/dist/ol-ext.css";
import Map from "ol/Map";
import View from "ol/View";
import TileLayer from "ol/layer/Tile";
import { TileWMS, XYZ } from "ol/source";
import { Vector as VectorSource } from "ol/source";
import { Style, Icon } from "ol/style";
import { Point } from "ol/geom";
import { Vector as VectorLayer } from "ol/layer";
import Control from "ol/control";
import { transform, transformExtent } from "ol/proj";
import layerPopup from "ol-ext/control/LayerPopup";
import { MousePosition } from "ol/control";
import { createStringXY } from "ol/coordinate";
import * as Extent from "ol/extent";
import Feature from "ol/Feature";
import { GeoJSON } from "ol/format";
import WFS from "ol/format/WFS";
import Select from "ol/interaction/Select";
import { pointerMove } from "ol/events/condition";
import iconURL from "../assets/locateIcon.png";
export default {
  /**
   *  新建电站设备页面
   */
  data() {
    return {
      CENTER: [-52.5292662973, -25.8559629834],
      ZOOM: 8,
      LOCATE_ZOOM: 13,
      MAP_PROJECTION: "EPSG:3857",
      DISPLAY_PROJECTION: "EPSG:4326",
      state: "",
      KEY: "AIzaSyCx_0AIW05o5d4B4FNO2g8g7Iwk6u6cAKc", //google key
      searchResults: [],
      searchCountrys: [],
      searchCountry: "",
      SCALE: 0.3,
      POWER_SCALE: 0.2,
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
      isHaveAdress: true, //是否有选中地址
      initAdressCoor: [-51.5292662973, -26.8559629834], // 初始选中地址坐标
    };
  },
  //meta
  metaInfo() {
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
            "http://mt3.google.cn/maps/vt?lyrs=m%40817&hl=zh-CN&gl=CN&x={x}&y={y}&z={z}",
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
    //建立点击地图定位矢量点图层
    createLocateVectorLayer() {
      return new VectorLayer({
        source: new VectorSource(),
      });
    },
    /**
     * 如果初始有选中地址，定位该地址，显示图标
     */
    locateChooseAddress() {
      let initAddrsssFeatures = []
      //传入地址的坐标initAdressCoor格式为4326格式
      const addressCoor = transform(
        this.initAdressCoor,
        this.DISPLAY_PROJECTION,
        this.MAP_PROJECTION
      );
      const addressFeature = new Feature({
        geometry: new Point(addressCoor)
      })
      initAddrsssFeatures.push(addressFeature)
      this.addFeatureLayer(initAddrsssFeatures)
      this.locate(initAddrsssFeatures)
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
      if(this.searchCountry !== ""){
        this.searchCountry = ""
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
     * 点击地图，显示相关地址
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
  },
};
</script>
<style>
#nav {
  padding: 0px;
}
.map {
  width: 900px;
  height: 700px;
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
.el-input-group__append {
  background: #fff;
}
.el-input-group--append .el-input__inner,
.el-input-group__prepend {
  border-right: none;
}
.el-input__inner:focus {
  border: 1px solid #dcdfe6;
  border-right: none;
}
.el-input__inner:hover {
  border: 1px solid #dcdfe6;
  border-right: none;
}
.el-autocomplete {
  position: absolute;
  display: inline-block;
  z-index: 1;
  left: 0.5em;
  top: 0.5em;
}
.el-scrollbar {
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
}
.el-scrollbar__wrap {
  position: relative;
}
.el-popper[x-placement^="bottom"] {
  width: 258px !important;
}
.el-autocomplete-suggestion li {
  font-size: 12px;
}
.save_address {
  position: absolute;
  z-index: 1;
  bottom: 0.5em;
  right: 0.5em;
}
</style>
