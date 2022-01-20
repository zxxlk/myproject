<template>
  <div>
    <side-table>
      <el-tabs v-model="sideTableName">
        <el-tab-pane :label="equipInfo" name="equipInfo">
          <side-data
            :tableDataObj="innerTableDataObj"
            @click-locate="locateDevice"
            @click-favorite="changeFavoriteDevice"
          ></side-data>
        </el-tab-pane>
        <el-tab-pane :label="favoritesEquip" name="favoratesEquip">
          <side-data
            :tableDataObj="favoritesTableDataObj"
            @click-favorite="changeFavoriteDevice"
          ></side-data>
        </el-tab-pane>
      </el-tabs>
    </side-table>
  </div>
</template>
<script>
import sideTable from "./sideTable.vue";
import sideData from "./sideData.vue";

export default {
  props: {
    // 显示的表格信息数据
    sideTableObj: {
      type: Object,
      default: () => ({}),
    },
  },
  data() {
    return {
      sideTableName: "equipInfo",
      equipInfo: "设备信息",
      favoritesEquip: "收藏设备",
      favoritesTableData: {}, //收藏的设备信息
      user: "",
      userList: {},
      layerName: [],
    };
  },
  created() {
    this.user = "zxx";
    this.userList[this.user] = [];
    this.getFavoritesList();
  },
  components: {
    sideTable,
    sideData,
  },
  computed: {
    innerTableDataObj() {
      let obj = {};
      Object.entries(this.sideTableObj).forEach((device) => {
        const name = device[0];
        obj[name] = [];
        const property = device[1];
        property.forEach((properties) => {
          const clone = { ...properties };
          clone.favorite = false;
          // 如果收藏列表中收藏了该设备，收藏属性为true
          if (this.favoritesTableData[name]) {
            clone.favorite = this.favoritesTableData[name].some(
              (item) => item.id === properties.id
            );
          }
          obj[name].push(clone);
        });
      });
      return obj;
    },
    favoritesTableDataObj() {
      let obj = {};
      Object.entries(this.favoritesTableData).forEach((device) => {
        const name = device[0];
        obj[name] = [];
        const property = device[1];
        property.forEach((properties) => {
          const clone = { ...properties };
          clone.favorite = true;
          obj[name].push(clone);
        });
      });
      return obj;
    },
  },
  mounted() {},
  methods: {
    /**
     * 定位设备
     */
    locateDevice(row, name) {
      console.log(row, name);
    },
    /**
     * 收藏/取消收藏设备,点击收藏的时候，改变对应数据的收藏属性值:改变收藏状态时，将设备收藏到服务端接口。
     * 初始时根据token获取当前用户名称，然后根据用户名称获取该用户收藏的设备列表。移除收藏设备也是调用服务端接口，将当前登录用户收藏设备
     * 都保存在服务端。
     */
    changeFavoriteDevice(row, name) {
      const { favorite } = row;
      // 行信息中有收藏属性，上传至服务器时删除该属性
      const property = { ...row };
      delete property.favorite;
      if (favorite) {
        //取消收藏
        this.modifyFavorites("remove", name, property);
        this.getFavoritesList();
      } else {
        //添加收藏
        this.modifyFavorites("add", name, property);
        this.getFavoritesList();
      }
    },

    /**
     * 加载当前用户的收藏列表
     */
    getFavoritesList() {
      try {
        this.favoritesTableData = this.getFavoritesListByName(this.user);
      } catch (error) {
        console.log("error: >>", error);
      }
    },

    /**
     * 根据当前用户名称获取收藏列表
     */
    getFavoritesListByName(username) {
      // 根据接口获取
      const userArr = this.userList[username];
      const userList = {};
      userArr.forEach((item) => {
        const key = Object.keys(item);
        userList[key] = item[key];
      });
      return userList;
    },

    /**
     * 数组去重
     */

    /**
     * 收藏/删除服务端当前用户数据
     */
    modifyFavorites(type, layerName, property) {
      if (type === "add") {
        if (this.userList[this.user].length > 0) {
          this.userList[this.user].forEach((device) => {
            if (Object.prototype.hasOwnProperty.call(device, layerName)) {
              const index = this.userList[this.user].indexOf(device);
              this.userList[this.user][index][layerName].push(property);
            } else {
              if (this.layerName.indexOf(layerName) !== -1) {
                for (let key in device) {
                  if (key === layerName) {
                    const index = this.userList[this.user].indexOf(device);
                    this.userList[this.user].push(property);
                  } else {
                    return false;
                  }
                }
              } else {
                this.userList[this.user].push({
                  [layerName]: [property],
                });
              }
            }
          });
        } else {
          this.userList[this.user].push({
            [layerName]: [property],
          });
        }
        this.layerName.push(layerName);
        this.layerName = [...new Set(this.layerName)];
      }
      if (type === "remove") {
        console.log(this.userList);
        this.userList[this.user].forEach((device) => {
          if (Object.prototype.hasOwnProperty.call(device, layerName)) {
            const index = this.userList[this.user].indexOf(device);
            const favorite = this.userList[this.user][index][layerName].some(
              (item) => item.id === property.id
            );
            if (favorite) {
              this.userList[this.user][index][layerName].forEach((device) => {
                if (device.id === property.id) {
                  const proindex = this.userList[this.user][index][
                    layerName
                  ].indexOf(device);
                  this.userList[this.user][index][layerName].splice(
                    proindex,
                    1
                  );
                }
              });
            }
            if (this.userList[this.user][index][layerName].length < 1) {
              this.userList[this.user].splice(index, 1);
            }
          }
        });
      }
    },
  },
};
</script>
