<template>
  <div class="query_table_data">
    <div>
      <div class="t_left">
        <div class="t_left leftTxt">名称</div>
        <div class="t_left mg_l15">
          <el-input
            size="mini"
            placeholder="请输入"
            v-model.trim="queryForm.name"
            @keyup.enter.native="query()"
          ></el-input>
        </div>
      </div>
      <div class="t_left">
        <div class="t_left leftTxt">类型</div>
        <div class="t_left mg_l15">
          <el-select size="mini" v-model="queryForm.type" value="All">
            <el-option
              v-for="item in deviceType"
              :key="item"
              :label="item"
              :value="item"
            >
            </el-option>
          </el-select>
        </div>
      </div>
      <div class="t_right">
        <el-button type="primary" size="mini" @click="query($event)"
          >查询</el-button
        >
      </div>
      <!--子元素设置了浮动，导致父元素没办法撑开，需要清除浮动-->
      <div class="clear"></div>
    </div>
    <div class="query_table">
      <el-table
        :data="tableData"
        border
        class="tableList"
        size="mini"
        row-key="value"
      >
        <el-table-column
          prop="value"
          label="餐品"
          min-width="50"
        ></el-table-column>
        <el-table-column
          prop="address"
          label="地址"
          show-overflow-tooltip
          min-width="100"
        ></el-table-column>
        <el-table-column label="操作">
          <template slot-scope="scope">
            <el-button size="mini" id="addBtn" @click="addlayers"
              >添加</el-button
            >
            <el-button
              size="mini"
              type="danger"
              plain
              @click="deleteData(scope.row, scope.$index, $event)"
              >删除</el-button
            >
            <el-button
              size="mini"
              plain
              :type="scope.row.protect ? 'success' : 'danger'"
              :disabled="scope.row.unEdit ? true : false"
              :title="
                scope.row.unEdit
                  ? '无权修改'
                  : scope.row.protect
                  ? '取消保护'
                  : '添加保护'
              "
              >{{ scope.row.protect ? cancelProtect : protect }}</el-button
            >
          </template>
        </el-table-column>
      </el-table>
    </div>
  </div>
</template>
<script>
export default {
  props: {
    queryForm: {
      type: Object,
      required: true,
    },
    queryTableData: {
      type: Array,
      required: true,
    },
    deviceType: {
      type: Array,
      required: true,
    },

    totalNum: {
      type: Number,
      required: true,
    },
  },
  data() {
    return {
      protect: "保护",
      cancelProtect: "取消",
    };
  },
  mounted() {
    this.dom = document.getElementsByClassName("tableList")[0];
    this.dom.addEventListener("scroll", (e) => {
      this.pageTableData();
    });
  },
  methods: {
    pageTableData() {
      console.log(this.dom.scrollHeight, this.dom.clientHeight,this.dom.scrollTop);
      const scrollDistance =
        this.dom.scrollHeight - this.dom.scrollTop - this.dom.clientHeight;
      
      if (scrollDistance <= 0) {
        // 滚动条到底时，判断是否表格长度超过总条数，如果没有，上次结束位置为起点，再加载数据
        if (this.tableData.length < this.totalNum) {
          this.$emit("queryAgain", this.tableData.length, 8);
        } else {
          return;
        }
      }
    },
    addlayers() {
      const ele = document.getElementById("addBtn");
      ele.blur();
    },
    query(event) {
      const ele = event.currentTarget;
      ele.blur();
    },
    deleteData(row, index, event) {
      this.$emit("deleteData", row, index);
    },
  },
  beforeDestroy() {
    this.dom.removeEventListener("scroll", (e) => {
      this.pageTableData;
    });
  },
  computed: {
    tableData() {
      return this.queryTableData;
    },
  },
};
</script>
<style Lang="scss" scoped>
.query_table_data {
  padding: 10px 20px;
}
.query_table {
  margin-top: 20px;
}
.el-table::before {
  z-index: inherit;
}
.clear {
  clear: both;
}
.tableList {
  width: 90%;
  margin: auto;
  max-height: 400px;
  min-height: 400px;
  overflow: auto;
}
</style>
