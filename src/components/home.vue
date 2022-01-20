<template>
  <div>
    <el-container>
      <el-header>header</el-header>
      <el-container>
        <el-aside width="200px">
          aside
          <nav-menu></nav-menu>
        </el-aside>
        <el-main>
          main
        </el-main>
      </el-container>
    </el-container>
    <div>
      <el-input v-model="text" style="padding: 10px 0px"></el-input>
    </div>
  </div>
</template>
<script>
import navMenu from "./navMenu.vue";
export default {
  data() {
    return {
      text: "",
    };
  },
  mounted() {
    document.onkeydown = function(e) {
      console.log(e);
      if (e.keyCode) {
        e.returnValue = false;
      }
    };
  },
  components: {
    navMenu,
  },
};
</script>
