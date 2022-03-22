

/**
 * 定义一个运动的小球
 */
var speed = 0;
var startPoint = 0;
export function runBall(canvas) {
  // 页面一加载就开始运动
  window.onload = () => {
    let ctx = canvas.getContext('2d');
    ctx.beginPath();
    ctx.fillStyle = "red"
    ctx.arc(50, 150, 40, 0, 2 * Math.PI, true)
    ctx.closePath();
    ctx.fill()
    setInterval(() => {
      run(ctx)
    }, 50)
  }
}
//鼠标手动绘制

function run(ctx) {
  speed = 5;
  startPoint += speed;
  if (startPoint >= 350) {
    startPoint = 0
  }
  // 清除画布
  ctx.clearRect(0, 0, 300, 300);
  ctx.beginPath();
  ctx.fillStyle = "red"
  ctx.arc(startPoint, 150, 40, 0, 2 * Math.PI, true)
  ctx.closePath();
  ctx.fill()
}

export function pointerPaint(canvas) {
  let ctx = canvas.getContext('2d');
  canvas.onmousedown = (event) => {
    if (canvas.setCaptrue) {
      canvas.setCaptrue()
    }
    console.log(canvas.offsetLeft);
    ctx.save();
    ctx.beginPath();
    // 鼠标点击的位置为起点
    ctx.moveTo(event.clientX - canvas.offsetLeft, event.clientY - canvas.offsetTop);
    console.log(event.clientX - canvas.offsetLeft, event.clientY - canvas.offsetTop);
    // 监听鼠标移动，移到哪里就画到哪里lineTo
    document.onmousemove = (e) => {
      e = window.event || e;
      ctx.lineTo(e.clientX - canvas.offsetLeft, e.clientY - canvas.offsetTop);
      ctx.stroke();
    }
    document.onmouseup = (e) => {
      document.onmouseup = document.onmousemove = null;
      
    }

  }
}