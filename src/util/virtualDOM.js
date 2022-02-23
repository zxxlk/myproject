/**
 * 构建虚拟DOM的类
 * export const A=a
 * export function A(){}
 * export class A{}
 * 有default ，导入时不加{}
 */
export default class createElement {
  _count = 0;

  constructor(tagName, props, children) {
      (this.tagName = tagName),
      (this.props = props || {}),
      (this.children = children || []),
      (this.key = props ? props.key : undefined);
      this.children.forEach((child) => {
        if (child instanceof Element) {
          this._count += child.count;
        }
        this._count++;
      });
      this.count = this._count;
    }
    // 映射成真正的DOM
  render() {
    const ele = document.createElement(this.tagName);
    const props = this.props;
    for (const propName in props) {
      ele.setAttribute(propName, props[propName]);
    }
    this.children.forEach((child) => {
      const childEle =
        child instanceof Element ? child : document.createTextNode(child);
      ele.appendChild(childEle);
    });
    return ele;
  }
}