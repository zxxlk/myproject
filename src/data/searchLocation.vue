<!--搜索定位子组件-->
<template>
  <el-popover placement="bottom-start" width="300" trigger="click">
    <div slot="reference" class="search-button">{{ searchButton }}</div>
    <el-tabs v-model="activeName" @tab-click="handleClick">
      <el-tab-pane label="设备搜索" name="search">
        <el-form>
          <el-form-item label="数据">
            <el-select
              v-model="searchData"
              :placeholder="$t('message.pleaseSelect')"
              size="mini"
            >
              <el-option
                v-for="(item, i) in searchDatas"
                :key="i"
                :label="item.label"
                :value="item.value"
              ></el-option>
            </el-select>
          </el-form-item>
          <el-form-item :label="$t('data.prop')">
            <el-select
              v-model="searchPro"
              filterable
              remote
              :placeholder="$t('message.pleaseSelect')"
              size="mini"
              :remote-method="searchProFun"
              :loading="searchLoading"
            >
              <el-option
                v-for="(item, i) in searchProperty"
                :key="i"
                :label="item.label"
                :value="item.value"
                @click.native="clickProperty"
              ></el-option>
            </el-select>
          </el-form-item>
          <el-form-item label="编辑">
            <el-autocomplete
              size="mini"
              style="width: 200px"
              placeholder="请输入内容"
              v-model="searchState"
              :fetch-suggestions="querySearch"
              :trigger-on-focus="false"
              @select="handleState"
              class="searchEquip"
              popper-class="search_locate"
              ref="searchEquip"
            >
              <el-button
                slot="append"
                icon="el-icon-search"
                @click="buttonQuerySearch"
              ></el-button>
            </el-autocomplete>
          </el-form-item>
        </el-form>
      </el-tab-pane>
      <el-tab-pane label="设备定位" name="locate">设备定位</el-tab-pane>
    </el-tabs>
  </el-popover>
</template>
<script>
export default {
  data() {
    return {
      searchButton: "搜索定位",
      activeName: "search",
      searchData: "",
      searchDatas: [
        {
          value: "选项1",
          label: "黄金糕",
          index: 0,
        },
        {
          value: "选项2",
          label: "双皮奶",
          index: 1,
        },
        {
          value: "选项3",
          label: "蚵仔煎",
          index: 2,
        },
        {
          value: "选项4",
          label: "龙须面",
          index: 3,
        },
        {
          value: "选项5",
          label: "北京烤鸭",
          index: 4,
        },
      ],
      searchPro: "",
      searchLoading: false,
      searchProperty: [],
      searchState: "",
      list: [],
      states: [
        "Alabama",
        "Alaska",
        "Arizona",
        "Arkansas",
        "California",
        "Colorado",
        "Connecticut",
        "Delaware",
        "Florida",
        "Georgia",
        "Hawaii",
        "Idaho",
        "Illinois",
        "Indiana",
        "Iowa",
        "Kansas",
        "Kentucky",
        "Louisiana",
        "Maine",
        "Maryland",
        "Massachusetts",
        "Michigan",
        "Minnesota",
        "Mississippi",
        "Missouri",
        "Montana",
        "Nebraska",
        "Nevada",
        "New Hampshire",
        "New Jersey",
        "New Mexico",
        "New York",
        "North Carolina",
        "North Dakota",
        "Ohio",
        "Oklahoma",
        "Oregon",
        "Pennsylvania",
        "Rhode Island",
        "South Carolina",
        "South Dakota",
        "Tennessee",
        "Texas",
        "Utah",
        "Vermont",
        "Virginia",
        "Washington",
        "West Virginia",
        "Wisconsin",
        "Wyoming",
      ],
      stateData: [],
    };
  },
  mounted() {
    this.list = this.states.map((item) => {
      return { value: item, label: item };
    });
  },
  methods: {
    handleClick(tab, event) {
      console.log(tab);
    },

    /**
     * select输入框值发生变化的时候调用
     */
    searchProFun(value) {
      //以输入的内容作为条件，将（从后端）查询到的数据，显示在列表选项中
      if (value !== "") {
        this.searchLoading = true;
        setTimeout(() => {
          this.searchLoading = false;
          this.searchProperty = this.list.filter((item) => {
            return item.label.toLowerCase().indexOf(value.toLowerCase()) > -1;
          });
        }, 200);
      }
    },
    /**
     * 选中input的值调用
     */
    handleState(obj) {
      console.log(this.searchState);
    },

    /**
     * 点击按钮查询列表
     */
    buttonQuerySearch() {
      this.$nextTick(() => {
        this.$refs.searchEquip.focus();
      });
    },
    /**
     * 输入内容后，查询匹配建议
     */
    async querySearch(value, cb) {
      if (value !== "") {
        await setTimeout(() => {
          this.stateData = this.list.filter((item) => {
            return item.label.toLowerCase().indexOf(value.toLowerCase()) > -1;
          });
        }, 200);
        // 查询无数据时
        const propValueEle = document.querySelector(".search_locate");
        if (this.stateData.length < 1) {
          this.stateData.push({
            label: "无数据",
            value: "无数据",
          });
          propValueEle.style.pointerEvents = "none";
          cb(this.stateData);
          const ele = document.getElementsByClassName(
            ".el-autocomplete-suggestion__list"
          );
          console.log(ele);
        } else {
          propValueEle.style.pointerEvents = "";
          cb(this.stateData); //查询到的结果，要放在回调函数中，才会显示列表中
        }
      }
    },

    /**
     * 点击查询到的属性值
     */
    clickProperty() {},
  },
};
</script>
<style Lang="scss" scoped>
.search-button {
  font-size: 14px;
  margin: 3px;
  cursor: pointer;
  color: #606266;
  padding: 0px 15px;
}
.el-popover {
  top: 95px !important;
}
.el-popover__title {
  font-size: 14px;
  color: #606266;
}
.el-tabs /deep/ .el-tabs__active-bar {
  width: 135px !important;
}
.el-tabs /deep/ .el-tabs__item {
  flex: 1;
  text-align: center;
}
.el-tabs /deep/.el-tabs__nav {
  display: flex;
  min-width: 100%;
  color: rgb(124, 219, 228);
}
.search_empty {
  padding: 10px 0;
  margin: 0;
  text-align: center;
  color: #999;
  font-size: 14px;
}
</style>
<style>
/* .search_locate.el-autocomplete-suggestion li {
  color: #999;
  text-align: center;
  font-size: 14px;
  padding: 10px 0px;
}
.search_locate.el-autocomplete-suggestion li {
  line-height: 21x;
}
.search_locate.el-autocomplete-suggestion__wrap {
  padding: 0px;
} */
</style>
