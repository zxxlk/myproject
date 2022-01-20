import Vue from "vue";
import Vuex from "vuex";

Vue.use(Vuex);
/** 没有default导入时要加{}，有就不用加。
 * vuex - 状态管理，主要是管理项目中使用到的一些变量，类似于一个全局变量。
 * 导出一个对象，this.$store.sate.
 * state状态对象，状态改变是响应式的，状态数据发生变化时，组件中对应的数据也会发生变化
 * 不能直接改变store中的状态，只能通过mutation（类似于事件,需要在组件中commit触发事件,只支持同步代码）
 * actions类似于事件，执行的是mutation中方法，支持任何异步操作，不能直接操作state,定义的方法，通过dispatch调用
 */

const state = {
  tableData: [],
  message: "vuex-message",
};

const mutations = {
  increment(state, data) {
    state.tableData = data;
  },
  syncFun(state, arr) {
    state.tableData.push(arr);
  },
  changeMessage(state, msg) {
    state.message = msg;
  },
};

const actions = {
  incrementAsync({ commit }, arr) {
    setTimeout(() => {
      commit("syncFun", arr);
    }, 1000);
  },
};
const moduleA = {
  state: {
    msgA: "msgA",
  },
};
const moduleB = {
  state: {
    msgB: "msgB",
  },
};
export const store = new Vuex.Store({
  state,
  mutations,
  actions,
  modules: {
    a: moduleA,
    b: moduleB,
  },
});