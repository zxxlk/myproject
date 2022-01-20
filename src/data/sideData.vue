<template>
  <div>
    <div v-if="!hasData">
      <span>{{ hasNotData }}</span>
    </div>
    <el-row v-else v-for="(tableData, name) in tableDataObj" :key="name">
      <b class="table_title">{{ name }}</b>
      <el-table
        :data="tableData"
        style="width: 100%;"
        size="mini"
        border
        class="table_data"
      >
        <el-table-column
          prop="date"
          label="日期"
          min-width="100"
        ></el-table-column>
        <el-table-column
          prop="name"
          label="名字"
          min-width="80"
        ></el-table-column>
        <el-table-column
          prop="address"
          label="地址"
          min-width="180"
          show-overflow-tooltip
        ></el-table-column>
        <el-table-column
          prop="tip"
          label="邮编"
          min-width="80"
        ></el-table-column>
        <el-table-column label="定位" min-width="50" fixed="right">
          <template slot-scope="scope">
            <el-button
              size="mini"
              type="primary"
              icon="el-icon-map-location"
              circle
              plain
              @click="clickLocateBtn(scope.row, name)"
            ></el-button>
          </template>
        </el-table-column>
        <el-table-column label="收藏" min-width="50" fixed="right">
          <template slot-scope="scope">
            <el-button
              size="mini"
              :type="scope.row.favorite ? 'success' : 'danger'"
              :icon="
                scope.row.favorite ? 'el-icon-star-on' : 'el-icon-star-off'
              "
              :title="scope.row.favorite ? '取消' : '收藏'"
              circle
              plain
              @click="onChangeFavorite(scope.row, name)"
            ></el-button>
          </template>
        </el-table-column>
      </el-table>
    </el-row>
  </div>
</template>
<script>
export default {
  /**
   * 侧边栏表格
   */
  props: {
    tableDataObj: {
      type: Object,
      default: () => ({}),
    },
  },
  data() {
    return {
      hasNotData: "没有数据",
      isFavorite: false,
    };
  },
  computed: {
    // 依赖其他属性计算得到的值，不用在  data中声明。
    hasData() {
      if (Object.keys(this.tableDataObj).length > 0) {
        return true;
      }
      return false;
    },
  },

  mounted() {},
  methods: {
    clickLocateBtn(row, name) {
      this.$emit("click-locate", row, name);
    },
    /**
     * 收藏设备：如果没有收藏是红色，收藏过的时候绿色
     */
    onChangeFavorite(row, name) {
      this.$emit("click-favorite", row, name);
    },
  },
};
</script>
<style lang="scss">
.table_title {
  font-size: 16px;
  align-items: start;
  display: flex;
}
.table_data {
  margin-bottom: 17px;
  max-width: 500px;
  max-height: 500px;
  thead {
    height: 50px;
  }
}
</style>
