<template>
  <div>
    <el-table :data="tableData" :show-header="false" sizi="mini">
      <el-table-column prop="label" min-width="140"></el-table-column>
      <el-table-column prop="value" min-width="140"></el-table-column>
    </el-table>
  </div>
</template>
<script>
export default {
  props: {
    popupData: {
      type: Array,
    },
  },
  computed: {
    tableData() {
      let arr = [];
      for (const item of this.popupData) {
        switch (item.label) {
          case "station":
            arr.push({
              label: "电站地址", //改成国际化值
              value: item.value,
            });
            break;
          case "status":
            arr.push({
              label: "状态", //改成国际化值
              value: item.value,
            });
            break;
        }
      }
      console.log("arr->", arr);
      return arr
    },
  },
};
</script>
