<template>
  <div>
    <el-dialog
      :visible.sync="setParamsVisible"
      width="500px"
      :title="paramsTitle"
      custom-class="params"
      :close-on-click-modal="false"
    >
      <slot></slot>
      <div slot="footer" class="dialog-footer">
        <el-switch
          v-model="value"
          active-color="#13ce66"
          inactive-color="#ff4949"
          :disabled="switchDisabled"
          inactive-text="启用点选"
        >
        </el-switch>
        <el-button @click="setParamsVisible = false" size="mini"
          >取消
        </el-button>
        <el-button type="primary" @click="confirmParams" size="mini"
          >确定</el-button
        >
      </div>
    </el-dialog>
  </div>
</template>
<script>
export default {
  props: {
    paramsTitle: {
      type: String,
      required: true,
    },
    form: {
      type: Object,
    },
  },
  data() {
    return {
      setParamsVisible: false,
      value: "false",
      switchDisabled: false,
    };
  },
  methods: {
    openDialog() {
      this.setParamsVisible = true;
    },
    closeDialog() {
      this.setParamsVisible = false;
    },
    confirmParams() {
      this.$emit("confirmParams");
    },
  },
};
</script>
<style lang="scss">
.params {
  .el-dialog__footer {
    border-top: 1px solid #ddd;
  }
  .el-dialog__header {
    border-bottom: 1px solid #ddd;
    padding: 8px 20px;
    text-align: left;
  }
  .el-dialog__title {
    font-size: 16px;
  }
  .el-dialog__headerbtn {
    top: 12px;
  }
  .el-dialog__body {
    padding: 20px 20px;
    .el-form-item {
      margin-bottom: 15px;
    }
  }
  .el-switch {
    margin: 5px;
  }
  .el-switch__label.is-active {
    color: #303133;
  }
  .el-switch__label {
    color: #409eff;
  }
}
</style>
