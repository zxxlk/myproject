<template>
  <div>
    <el-container>
      <el-header class="headerBox" height="48px">
        <header-bar></header-bar>
      </el-header>
      <el-main>
        <div
          id="map"
          style="width:100%; height:100%; position: absolute;"
        ></div>
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
import { Vector as VectorSource, Cluster, OSM, TileWMS } from "ol/source";
import { Style, Icon, Circle, Text, Fill, Stroke } from "ol/style";
import { Point, Polygon } from "ol/geom";
import { Vector as VectorLayer } from "ol/layer";
import { GeoJSON } from "ol/format";
import { transform, transformExtent } from "ol/proj";
import Feature from "ol/Feature";
import iconURL from "../assets/allOfflineIcon.png";
import loveICON from "../assets/love.png";
import SelectCluster from "ol-ext/interaction/SelectCluster";
import AnimatedCluster from "ol-ext/layer/AnimatedCluster";
import { createStringXY } from "ol/coordinate";
import { MousePosition } from "ol/control";
import headerBar from "../components/testHeaderBox.vue";
import OverviewMap from "ol/control/OverviewMap";
import T from "../modules/test";
import layerSwitcher from "ol-ext/control/LayerSwitcher";

console.log("导入的模块: >>>", T);

export default {
  data() {
    return {
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
    headerBar,
  },
  mounted() {
    T.staticFun(1);
    this.map = this.initMap();
    this.map.addControl(
      new layerSwitcher({
        tipLabel: "legend",
        trash: true,
      })
    );
    this.OSMLayer = this.createOSMLayer();
    this.map.addLayer(this.OSMLayer);
    this.map.addControl(this.addMouseControl());
    this.vectorWMSLayer = this.createVectorWMSLayer();
    this.map.addLayer(this.vectorWMSLayer);
    // this.clusterLayer = this.createClusterLayer();
    // this.map.addLayer(this.clusterLayer);
    // this.clusterLayer.setStyle(this.setClusterLayerStyle);
    // this.selectCluster = this.createSelectClusterInteraction([
    //   this.clusterLayer,
    // ]);
    // this.selectClusterLayer = this.selectCluster.getLayer();
    // this.selectClusterLayer.setStyle(this.iconFeatureStyle);
    // this.map.addInteraction(this.selectCluster);
    this.featureSelectCluster();
    this.overviewMap = this.addOverViewMap();
    // console.log(this.overviewMap);
    this.map.addControl(this.overviewMap);
    this.createLayer();
    //多维数组转一维数组
    const newArr = this.testArray([1, 2, [3, 4, [5, 5, 6, [2, 3]]]]);
    const uniqueArr = this.unique(newArr);
    // console.log(uniqueArr);
  },
  methods: {
    createLayer() {
      let layer = new VectorLayer({
        source: new VectorSource(),
        displayInLayerSwitcher: false,
      });
      const polygon = new Feature({
        geometry: new Polygon([
          [
            [0, 0],
            [0, 2],
            [2, 2],
            [2, 0],
            [0, 0],
          ],
        ]),
      });
      polygon.setStyle(
        new Style({
          stroke: new Stroke({
            color: "blue",
            width: 3,
          }),
          fill: new Fill({
            color: "rgba(0, 0, 255, 0.1)",
          }),
        })
      );
      console.log(polygon);
      layer.getSource().addFeature(polygon);
      this.map.addLayer(layer);
    },
    /**
     * 多维数组转一维数组
     */
    testArray(array) {
      let newArr = [];
      // for (let i = 0; i < array.length; i++) {
      //   const e = array[i];
      //   // 判断每一项是不是数组
      //   if (e instanceof Array) {
      //     newArr = newArr.concat(this.testArray(e));
      //   } else {
      //     newArr.push(e);
      //   }
      // }
      // console.log("去重前：>>>", newArr);
      // ES6 写法
      newArr = newArr.concat(
        ...array.map((item) =>
          Array.isArray(item) ? this.testArray(item) : item
        )
      );
      return newArr;
    },

    /**
     * 数组去重
     */
    unique(arr) {
      // 1. 利用ES6 Set去重：set是ES6提供的一种数据结构，类似于数组，但是值唯一
      // let setArr = [...new Set(arr)]; // ...扩展运算符，将数组转化为用逗号分割的参数序列
      // return setArr;
      //双层嵌套去重ES5-splice删除，直接操作原数组
      for (let i = 0; i < arr.length; i++) {
        for (let j = i + 1; j < arr.length; j++) {
          if (arr[i] == arr[j]) {
            // 如果上一项与下一个相同，删除原数组的第二个元素
            arr.splice(j, 1);
          }
        }
      }
      return arr;
    },

    addOverViewMap() {
      return new OverviewMap({
        collapsed: false,
        layers: [
          new TileLayer({
            source: new OSM(),
          }),
          // this.OSMLayer,
        ],
      });
    },
    /**
     * 初始化地图
     */
    initMap() {
      return new Map({
        target: "map",
        view: new View({
          center: transform(
            // [-52.5292662973, -25.8559629834],
            [118.77788, 32.005985],
            "EPSG:4326",
            "EPSG:3857"
          ),
          zoom: 5,
          extent: [-20026376.39, -20078966.1, 20026376.39, 20078966.1],
        }),
      });
    },

    /**
     * 添加OSM地图
     */
    createOSMLayer() {
      return new TileLayer({
        source: new OSM(),
        name: "OSM",
        title: "OSM",
        baseLayer: true,
      });
    },

    /**
     * 离线地图
     */
    createVectorWMSLayer() {
      return new TileLayer({
        source: new TileWMS({
          url:
            "http://192.168.6.107:8080/hgisserver/gwc/service/wms?authkey=2004149d-e039-4a95-b474-6157e1b5e8cc",
          params: {
            LAYERS: "topp:baseMap",
            SRS: "EPSG:900913",
          },
        }),
        name: "TileWMS",
        baseLayer: true,
        visible: false,
      });
    },

    /**
     * 添加鼠标显示坐标控件
     */
    addMouseControl() {
      return new MousePosition({
        coordinateFormat: createStringXY(5),
        projection: "EPSG:4326",
        className: "custom-mouse-position",
        underfinedHTML: "&nbsp",
      });
    },
    /**
     * 加载矢量数据
     */
    createClusterLayer() {
      return new AnimatedCluster({
        distance: 100,
        source: new Cluster({
          source: new VectorSource({
            format: new GeoJSON({
              geometryName: "the_geom",
            }),
            url:
              "http://161.189.61.189:9090/hgisserver/topp/ows?service=WFS&version=1.0.0 " +
              "&request=GetFeature&srsName=EPSG:4326&typeName=topp%3ANIC_COPELPatchRep_202112310732 " +
              "&outputFormat=application%2Fjson&propertyName=ID,the_geom",
          }),
        }),
      });
    },

    /**
     * new Feature加载元素
     */
    featureSelectCluster() {
      this.powerStationData = this.POWER_INFORMATION; //初始从后台获取电站信息
      let allPowerFeature = [];
      for (let i = 0; i < this.powerStationData.length; i++) {
        const data = this.powerStationData[i];
        const id = data.id;
        const coordinate = transform(
          [data.longitude, data.latitude],
          "EPSG:4326",
          "EPSG:3857"
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
        displayInLayerSwitcher: false,
      });
      powerStationVectorLayer
        .getSource()
        .getSource()
        .addFeatures(allPowerFeature);
      this.map.addLayer(powerStationVectorLayer);
      powerStationVectorLayer.setStyle((feature) =>
        this.setClusterLayerStyle(feature)
      );
      this.selectCluster = this.createSelectClusterInteraction([
        powerStationVectorLayer,
      ]);
      this.selectClusterLayer = this.selectCluster.getLayer();
      this.selectClusterLayer.setStyle(this.iconFeatureStyle);
      this.map.addInteraction(this.selectCluster);
    },
    /**
     * 聚合图层样式
     */
    setClusterLayerStyle(feature) {
      //判断有是不是聚合元素
      const size = feature.get("features").length;
      if (size == 1) return this.iconFeatureStyle(feature);
      if (size > 1) {
        return [
          new Style({
            image: new Circle({
              radius: 10,
              fill: new Fill({
                color: "rgba(240,192,16,0.8)",
              }),
              stroke: new Stroke({
                color: "rgba(240,192,16,0.3)",
                width: "4",
              }),
            }),
            text: new Text({
              text: size.toString(),
            }),
          }),
        ];
      }
    },
    iconFeatureStyle(feature) {
      const geometry = feature.getGeometry();
      if (geometry instanceof Point) {
        const singleFeature = this.getSingleFeature(feature);
        let status = singleFeature.getProperties().status;
        return [
          new Style({
            image: new Icon({
              src: iconURL,
              scale: 0.5,
            }),
          }),
          new Style({
            image: new Icon({
              src: loveICON,
              scale: 0.3,
              anchor: [0.5, 1],
            }),
          }),
        ];
      }
    },

    /**
     * 获取单个元素
     */
    getSingleFeature(feature) {
      if (feature.get("features")) return feature.get("features")[0];
      return feature;
    },

    /**
     *  聚合交互
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
        // featureStyle: new Style({
        //   image: new Icon({
        //     src: iconURL,
        //     scale: this.SCALE,
        //   }),
        // }),
        // style: (feature) => this.clusterStyle(feature),
      });
    },

    /**
     * 判断是否是聚类元素
     */
    isMultiClusterFeature(feature) {
      if (this.isClusterFeature(feature) && feature.get("features").length > 1)
        return true;
      else return false;
    },

    isClusterFeature(feature) {
      if (feature.get("features")) return true;
      else return false;
    },
  },
};
</script>
<style>
.custom-mouse-position {
  left: 10px;
  bottom: 10px;
  font-size: 14px !important;
  position: absolute;
  font-family: Arial;
  color: #f33939;
}
.ol-overviewmap {
  bottom: 60px;
}
</style>
