import axios from "axios"
import ElementUI from "element-ui";
import router from "../../router"
import i18n from "../../lang/index"

/**
 * http request请求拦截,发出请求时，主动拦截
 */
axios.interceptors.request.use(
  (config) => {
    //拦截的是axios发出的请求，其他不拦截。判断URL，如果是登录页面，不需要token
    const url = config.url;
    const lastName = url.split('/')[url.split('/').length - 1];
    let suffixName = lastName.split('.')
    if (suffixName.length > 0) {
      [, suffixName] = suffixName;
    }
    if (lastName == 'login' || suffixName == 'json') {
      config.headers = {
        'Content-Type': 'application/json'
      }
    } else if (JSON.parse(sessionStorage.getItem('user')) && JSON.parse(sessionStorage.getItem('user')).token) {
      //给请求头加上token
      const { token } = JSON.parse(sessionStorage.getItem('user'));
      // config.headers = {
      //   'Content-Type': 'application/json',
      //   Authorization: `Bearer ${token}`
      // }
    }
    return config
  },
  (error) => {
    return new Promise.reject(error)
  }
)

/**
 * axios响应拦截器，处理返回的消息，主要是处理token过期
 */
axios.interceptors.response.use(
  (response) => {
    console.log('this:>>>', this);
    let res;
    if (response.data) {
      res = response.data
      // res.msg_code = 'success'
      res.msg_code = 'token invalid'
    } else {
      res = response;
      res.msg_code = 'token invalid'
    }
    //返回数据没问题，直接返回
    if (res.msg_code === 'success') {
      return response
    }
    // token过期，从返回的数据里查看token状况
    if (res.msg_code === 'token invalid') {
      // 需要退出重新登录
      ElementUI.MessageBox.alert(res.msg_code, 'title', {
        confirmButtonText: i18n.t('message.relogin'),
        showClose: false,
        callback(){
          router.push('/')
        }
      })
    }
  },
  (err)=> {
    return new Promise.reject(err)
  }
)

/**
 * 封装get方法
 */
export function get(url, params = {}) {
  return new Promise((resolve, reject) => {
    axios.get(url, params)
      .then((response) => {
        resolve(response.data)
      })
      .catch((error) => {
        reject(error)
      })
  })
}