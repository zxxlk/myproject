<template>
  <div>
    <el-container>
      <el-header class="headerBox" height="50px">
        <header-bar></header-bar>
      </el-header>
      <el-main>
        <canvas
          id="myCanvas"
          class="myCanvas"
          width="300"
          height="300"
          ref="myCanvas"
        ></canvas>
        <canvas
          id="myCanvas1"
          class="myCanvas1"
          width="300"
          height="300"
        ></canvas>
        <canvas
          id="myCanvas2"
          class="myCanvas2"
          width="300"
          height="300"
        ></canvas>
        <canvas
          id="myCanvas3"
          class="myCanvas3"
          width="300"
          height="300"
        ></canvas>
        <canvas
          id="myCanvas4"
          class="myCanvas4"
          width="300"
          height="300"
        ></canvas>
      </el-main>
    </el-container>
  </div>
</template>
<script>
import headerBar from "../components/testHeaderBox.vue";
import image from "../../static/img/111.png";
import { runBall, pointerPaint } from "../common/js/canvas.js";

export default {
  data() {
    return {};
  },
  components: {
    headerBar,
  },
  created() {},
  mounted() {
    /**
     * canvas添加一个画布，本身没有绘画的功能，绘画利用js实现。绘制的时候，先订制样式再画
     */
    // 绘制一个图片
    this.paintPic();
    // 绘制一个线
    this.paintLine();
    // 一个运动的小球
    runBall(document.getElementById("myCanvas2"));
    // 绘制一个正方形阴影
    this.paintShadow();
    // 鼠标绘制
    pointerPaint(document.getElementById("myCanvas4"));
  },
  methods: {
    paintPic() {
      this.canvas = document.getElementById("myCanvas");
      this.ctx = this.canvas.getContext("2d");
      let img = new Image();
      img.src = image;
      img.onload = () => {
        // 参数意思分别为：img对象、裁剪的起始位置X、裁剪起始Y坐标、裁剪的宽、高、显示的起始X、显示的起始位置、图片的宽和高
        this.ctx.drawImage(img, 0, 0, 220, 300, 0, 0, 300, 300);
      };
    },
    paintLine() {
      const canvas = document.getElementById("myCanvas1");
      const ctx = canvas.getContext("2d");
      let gradient = ctx.createLinearGradient(0, 0, canvas.width, 0); //生成渐变色
      gradient.addColorStop("0", "magenta");
      gradient.addColorStop("0.5", "blue");
      gradient.addColorStop("1", "red");
      ctx.beginPath();
      ctx.moveTo(10, 10);
      ctx.lineTo(10, 100);
      ctx.lineTo(100, 100);
      ctx.lineTo(10, 10);
      ctx.lineWidth = "3";
      ctx.strokeStyle = gradient;
      ctx.stroke();
      ctx.closePath();

      for (let i = 0; i < 5; i++) {
        ctx.beginPath();
        ctx.arc(30 + i * 50, 150, 20, 0, (2 * Math.PI * (i + 1)) / 5);
        ctx.strokeStyle = gradient;
        ctx.lineWidth = "5";
        ctx.closePath();
        ctx.stroke();
      }
      //画一个笑脸-绘制圆弧或圆：圆心坐标(x,y)、圆半径、开始绘制是X轴的弧度、圆弧的终点弧度、绘制顺时针还是逆时针
      ctx.beginPath();
      ctx.arc(150, 230, 50, 0, 2 * Math.PI, false);
      ctx.lineWidth = 3;
      ctx.strokeStyle = gradient;
      ctx.moveTo(140, 215); //移动到哪就从哪开始画
      ctx.arc(130, 215, 10, 0, 2 * Math.PI, true); //左眼
      ctx.moveTo(180, 215);
      ctx.arc(170, 215, 10, 0, 2 * Math.PI, true); //右眼
      ctx.moveTo(180, 235);
      ctx.arc(150, 230, 30, 0, Math.PI, false);
      ctx.stroke(); // 先闭合再绘制
    },
    paintShadow() {
      let ctx = document.getElementById("myCanvas3").getContext("2d");
      ctx.shadowColor = "black";
      ctx.shadowOffsetX = 10;
      ctx.shadowOffsetY = 10;
      ctx.fillStyle = "blue"; //先填充颜色，再绘制矩形，反过来不成功
      ctx.fillRect(10, 10, 100, 100);
      ctx.beginPath();
    },
  },
};
</script>
<style lang="scss">
.myCanvas {
  float: left;
  margin-top: 10px;
  margin-left: 10px;
  background-color: rgb(132, 202, 223);
  border: 1px solid rgb(196, 226, 114);
}
.myCanvas1 {
  float: left;
  margin-top: 10px;
  margin-left: 10px;
  background-color: rgb(132, 202, 223);
  border: 1px solid rgb(196, 226, 114);
}
.myCanvas2 {
  float: left;
  margin-top: 10px;
  margin-left: 10px;
  background-color: rgb(132, 202, 223);
  border: 1px solid rgb(196, 226, 114);
}
.myCanvas3 {
  float: left;
  margin-top: 10px;
  margin-left: 10px;
  background-color: rgb(132, 202, 223);
  border: 1px solid rgb(196, 226, 114);
}
.myCanvas4 {
  float: left;
  margin-top: 10px;
  margin-left: 10px;
  background-color: rgb(132, 202, 223);
  border: 1px solid rgb(196, 226, 114);
}
</style>
