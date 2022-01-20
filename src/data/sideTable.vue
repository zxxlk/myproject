<!--侧边栏。按钮点击控制表格显隐, 在引用该组件时，组件内部插入的标签，会在slot位置显示-->
<template>
  <div class="side_table">
    <el-button
      @click="sideCardVisible = !sideCardVisible"
      :icon="sideCardVisible ? 'el-icon-arrow-right' : 'el-icon-arrow-left'"
      class="side-button"
    ></el-button>
    <el-card v-show="sideCardVisible" class="side-card">
      <slot></slot>
    </el-card>
  </div>
</template>
<script>
export default {
  data() {
    return {
      sideCardVisible: false,
    };
  },
};
</script>
<style lang="scss">
.side_table {
  display: flex;
  align-items: center;
  .side-button {
    width: 20px;
    height: 40px;
    padding: 7px 0;
    border-right: 0;
    border-radius: 5px 0 0 5px;
  }
}
</style>
