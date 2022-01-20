module.exports = {
    devServer:{
        proxy:{
            '/ess':{
                target: 'https://maps.googleapis.com/maps/api',
                secure: false,
                ws:true,
                changeOrigin: true, //是否跨域
                pathRewrite: {
                  "^/ess": "/ess", //路径重写
                }
            }
        }
    }
}