<template>
  <div>
    <el-container>
      <el-header class="headerBox" height="50px">
        <header-bar></header-bar>
      </el-header>
      <el-main>
        <canvas
          class="myCanvas"
          width="500"
          height="500"
          ref="myCanvas"
        ></canvas>
      </el-main>
    </el-container>
  </div>
</template>
<script>
import headerBar from "../components/testHeaderBox.vue";

export default {
  data() {
    return {};
  },
  components: {
    headerBar,
  },
  mounted() {
    this.canvas();
  },
  methods: {
    /**
     * canvas添加一个画布，本身没有绘画的功能，绘画利用js实现。
     */
    canvas() {
      // 获取canvas对象
      const canvas = this.$refs.myCanvas;
      canvas.onmousemove = function(e) {
        //创建context对象
        const ctx = canvas.getContext("2d");
        ctx.lineTo(e.clientX, e.clientY);
        ctx.stroke();
      };
    },
  },
};
</script>
<style lang="scss">
.myCanvas {
  background-color: aquamarine;
  border: 1px solid rgb(196, 226, 114);
}
</style>
