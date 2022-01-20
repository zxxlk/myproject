<template>
  <div class="gis_ess_map">
    <div id="map" class="gis_map">
      <popup
        v-show="ifPopupShow"
        ref="popup"
        :popupData="popupData"
        id="popup"
        tabindex="0"
      ></popup>
      <legend-box ref="legendbox" class="legendBox"></legend-box>
    </div>
  </div>
</template>
<script>
import 'ol/ol.css';
import 'ol-ext/dist/ol-ext.css';
import axios from 'axios';
import Map from 'ol/Map';
import View from 'ol/View';
import TileLayer from 'ol/layer/Tile';
import {XYZ} from 'ol/source';
import {Vector as VectorSource, Cluster, OSM} from 'ol/source';
import {Style, Icon, Circle, Text, Fill, Stroke} from 'ol/style';
import {Point} from 'ol/geom';
import {Vector as VectorLayer} from 'ol/layer';
import {GeoJSON} from 'ol/format';
import {transform, transformExtent} from 'ol/proj';
import layerPopup from 'ol-ext/control/LayerPopup';
import {MousePosition} from 'ol/control';
import Popup from 'ol-ext/overlay/Popup';
import {createStringXY} from 'ol/coordinate';
import Feature from 'ol/Feature';
import Select from 'ol/interaction/Select';
import {pointerMove} from 'ol/events/condition';
import iconURL from '../assets/locateIcon.png';
import onlineIcon from '../assets/onlineIcon.png';
import allOfflineIcon from '../assets/allOfflineIcon.png';
import pieceOfflineIcon from '../assets/pieceOfflineIcon.png';
import alarmIcon from '../assets/alarmIcon.png';
import popup from './popup.vue';
// import SelectCluster from 'ol-ext/interaction/SelectCluster';
import SelectCluster from '../ol-ext/ol-ext-master/src/interaction/SelectCluster';
import AnimatedCluster from 'ol-ext/layer/AnimatedCluster';
import legendBox from './legendBox.vue';
import {bbox} from 'ol/loadingstrategy';
export default {
  /**
   *  展示电站设备页面功能
   */
  data() {
    return {
      // CENTER: [-52.5292662973, -25.8559629834],
      CENTER: [118.796877, 32.060255],
      ZOOM: 4,
      LOCATE_ZOOM: 8,
      MAP_PROJECTION: 'EPSG:3857',
      DISPLAY_PROJECTION: 'EPSG:4326',
      state: '',
      KEY: 'AIzaSyCx_0AIW05o5d4B4FNO2g8g7Iwk6u6cAKc', //google key
      SCALE: 0.3,
      POWER_SCALE: 0.8,
      trigger: false,
      LANGUAGE: 'zh-cn', //指定语言
      ifPopupShow: false,
      HITTOLERANCE: 0,
      ID: 'id',
      popupData: [],
      popupContentObj: {},
      powerStationData: '', //电站设备信息
      POWER_INFORMATION: [
        {
          id: '001',
          state: '0',
          longitude: '118.796877',
          latitude: '32.060255',
          powerData: [
            {
              label: 'station',
              value: '南京',
            },
            {
              label: 'status',
              value: '在线',
            },
          ],
        },
        {
          id: '002',
          state: '1',
          longitude: '118.77894',
          latitude: '32.855985',
          powerData: [
            {
              label: 'station',
              value: '南京南',
            },
            {
              label: 'status',
              value: '全部离线',
            },
          ],
        },
        {
          id: '003',
          state: '2',
          longitude: '118.77788',
          latitude: '32.005985',
          powerData: [
            {
              label: 'station',
              value: '南京海兴',
            },
            {
              label: 'status',
              value: '部分离线',
            },
          ],
        },
        {
          id: '004',
          state: '3',
          longitude: '118.77659',
          latitude: '31.805965',
          powerData: [
            {
              label: 'station',
              value: '南京百家湖',
            },
            {
              label: 'status',
              value: '告警',
            },
          ],
        },
      ], //模拟后端返回电站信息数据
    };
  },
  components: {
    popup,
    legendBox,
  },
  mounted() {
    this.map = this.initMap();
    // this.googleStreetLayer = this.googleStreetMap();
    // this.map.addLayer(this.googleStreetLayer);
    this.OSMLayer = this.createOSMLayer();
    this.map.addLayer(this.OSMLayer);
    this.map.addControl(this.addMouseControl());
    this.popup = this.createPopup();
    this.map.addOverlay(this.popup);
    if (this.POWER_INFORMATION.length > 0) {
      this.locatePowerStation();
    }
  },
  methods: {
    //建立地图容器
    initMap() {
      const map = new Map({
        target: 'map',
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
            'http://www.google.com/maps/vt?lyrs=m@189&gl=cn&x={x}&y={y}&z={z}',
          maxZoom: 19,
        }),
      });
    },

    /**
     * 添加OSM地图
     */
    createOSMLayer() {
      return new TileLayer({
        source: new OSM(),
      });
    },

    /**
     * 添加鼠标显示坐标控件
     */
    addMouseControl() {
      return new MousePosition({
        coordinateFormat: createStringXY(5),
        projection: this.DISPLAY_PROJECTION,
        className: 'custom-mouse-position',
        underfinedHTML: '&nbsp',
      });
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
      powerStationVectorLayer
        .getSource()
        .getSource()
        .addFeatures(allPowerFeature);
      this.map.addLayer(powerStationVectorLayer);
      powerStationVectorLayer.setStyle((feature) =>
        this.powerStationStyle(feature)
      );
      // this.locate(allPowerFeature);
      //实现聚合交互
      this.selectCluster = this.createSelectClusterInteraction([
        powerStationVectorLayer,
      ]);
      this.selectClusterLayer = this.selectCluster.getLayer();
      console.log(this.selectClusterLayer);
      this.selectClusterLayer.setStyle(this.iconStyleFunction);
      this.selectPoint = this.createSelectInteraction([
        powerStationVectorLayer,
        this.selectClusterLayer,
      ]);
      this.map.addInteraction(this.selectCluster);
      this.map.addInteraction(this.selectPoint);
      this.addSelectEvent(this.selectPoint, this.popup);
    },

    /**
     * 新增电站图层样式
     */
    powerStationStyle(feature) {
      const size = feature.get('features').length;
      if (size > 1) {
        return [
          new Style({
            image: new Circle({
              fill: new Fill({
                color: '#ffa500',
              }),
              stroke: new Stroke({
                color: 'rgba(240,192,16,0.3)',
                width: '4',
              }),
              radius: 10,
            }),
            text: new Text({
              text: String(size),
            }),
          }),
        ];
      }
      if (size == 0) return [new Style()];
      if (size == 1) return this.iconStyleFunction(feature);
    },

    /**
     * 获取单个singleFeature
     */
    getSingleFeature(feature) {
      if (feature.get('features')) return feature.get('features')[0];
      return feature;
    },

    /**
     * 单个设备样式
     */
    iconStyleFunction(feature) {
      const geometry = feature.getGeometry();
      if (geometry instanceof Point) {
        let featureIconURL;
        const singleFeature = this.getSingleFeature(feature);
        const status = singleFeature.getProperties().state;
        if (status === '0') featureIconURL = onlineIcon;
        if (status === '1') featureIconURL = allOfflineIcon;
        if (status === '2') featureIconURL = pieceOfflineIcon;
        if (status === '3') featureIconURL = alarmIcon;
        return [
          new Style({
            image: new Icon({
              src: featureIconURL,
              scale: this.POWER_SCALE,
            }),
          }),
        ];
      }
    },

    /**
     * 聚合展开图层样式
     */
    clusterIconStyleFunction(feature) {
      const geometry = feature.getGeometry();
      if (geometry instanceof Point) {
        let featureIconURL;
        const singleFeature = this.getSingleFeature(feature);
        const status = singleFeature.getProperties().state;
        if (status === '0') featureIconURL = onlineIcon;
        if (status === '1') featureIconURL = allOfflineIcon;
        if (status === '2') featureIconURL = pieceOfflineIcon;
        if (status === '3') featureIconURL = alarmIcon;
        return [
          new Style({
            image: new Icon({
              src: featureIconURL,
              scale: this.POWER_SCALE,
            }),
          }),
        ];
      }
    },
    /**
     * 实现聚合交互
     * @param featureStyle 设置展开图层点和线的样式
     *
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
        // featureStyle: [
        //   new Style({
        //     image: new Icon({
        //       src: allOfflineIcon,
        //       scale: 0.75,
        //     }),
        //     stroke: new Stroke({
        //       color: 'rgba(0,0,192,0.5)',
        //       width: 2,
        //     }),
        //     fill: new Fill({color: 'rgba(0,0,192,0.3)'}),
        //     radius: 5,
        //   }),
        // ],
      });
    },
    /**
     * 显示电站设备信息
     */
    createPopup() {
      return new Popup({
        popupClass: 'default anim',
        positioning: 'bottom-center',
        autoPan: false,
        autoPanAnimation: {duration: 100},
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
      if (this.isClusterFeature(feature) && feature.get('features').length > 1)
        return true;
      return false;
    },
    isClusterFeature(feature) {
      if (feature.get('features')) return true;
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
      interaction.on('select', (event) => {
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
          const element = popup.getElement('button');
          const popElement = element.getElementsByClassName(
            'ol-popup-content'
          )[0];
          // const pop = document.getElementById('popup').id;
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
        return feature.get('geometry').getCoordinates();
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
        return feature.get('features')[0].getProperties()[this.ID];
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
  width: 900px;
  height: 700px;
  position: relative;
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
  bottom: 10px;
}
</style>
