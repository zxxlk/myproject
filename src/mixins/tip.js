/**
 * js文件相当于script里面的内容，混合时，data会进行合并，有相同的字段，会优先使用组件内容;
 * 方法会进行合并，两个文件之间可以互相调用变量及方法，相当于融合成一个文件。
 * 
 */
import { createMessageBox } from '../common/js/util'
export default {
  data() {
    return {
      message: '这是mixin中的信息'
    }
  },
  created() {

  },
  methods: {
    tipMessage() {
      const Arr = ['第一行', '第二行', '第三行'];
      const message = createMessageBox.bind(this)(Arr)
      this.$message({
        message: message,
        showClose: true,
      })
    }
  },
}