export function createMessageBox(messageArray, attribute = null) {
  /**
   * 创建一个可以换行的message 
   */
  console.log(this);
  const h = this.$createElement;
  // h函数是createElement，返回一个虚拟DOM, message可以是String或者是createElement创造的Array
  const msgArr = [];
  messageArray.forEach(msg => {
    msgArr.push(h('p', attribute, msg))
  });
  return h('div', { style: 'color: teal' }, msgArr);
}