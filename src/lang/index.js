import VueI18n from "vue-i18n";
import Vue from "vue";
import enLocale from "./en";
import zhLocale from "./zh";
import ElementLocale from "element-ui/lib/locale";
import ElementZh from "element-ui/lib/locale/lang/zh-CN"; //element 中文
import ElementEn from "element-ui/lib/locale/lang/en"; //element英文

Vue.use(VueI18n);
const messages = {
  en: {
    ...enLocale,
    ...ElementEn,
  },
  zh: {
    ...zhLocale,
    ...ElementZh,
  },
};

ElementLocale.i18n((key, value) => i18n.t(key, value)); // 实现element插件国际化

const i18n = new VueI18n({
  locale: localStorage.getItem("LANGUAGE") || "en",
  messages,
});
export default i18n;