<!--添加数据：dialog表格-->
<template>
  <div>
    <el-dialog :visible.sync="addDataVisible" width="800px">
      <el-tabs v-model="activeName">
        <el-tab-pane label="添加数据" name="queryTable">
          <querydata-table
            ref="querydatatable"
            id="querydatatable"
            :queryForm="queryForm"
            :queryTableData="queryTableData"
            :deviceType="deviceType"
            :totalNum="totalNum"
            @queryAgain="loadAgain"
            @deleteData="deleteData"
          ></querydata-table>
        </el-tab-pane>
        <el-tab-pane label="收藏数据" name="favoriteTable">
          <el-table :data="favoratesData"> </el-table>
        </el-tab-pane>
      </el-tabs>
      <div slot="footer" class="dialog-footer">
        <el-button size="mini" @click="addDataVisible = false">关闭</el-button>
      </div>
    </el-dialog>
  </div>
</template>
<script>
import querydataTable from "../data/queryDataTable.vue";

export default {
  data() {
    return {
      addDataTitle: "添加数据",
      addDataVisible: false,
      queryForm: {
        name: "",
        type: "",
      },
      deviceType: ["All", "AP", "RELAY", "METER"],
      queryTableData: [],
      activeName: "queryTable",
      favoratesData: [],
      totalNum: null,
    };
  },
  components: {
    querydataTable,
  },
  created() {
    this.totalData = [];
    this.totalData.push(
      {
        value: "新旺角茶餐厅",
        address: "上海市普陀区真北路988号创邑金沙谷6号楼113",
        protect: true,
      },
      {
        value: "三全鲜食（北新泾店）",
        address: "长宁区新渔路144号",
        protect: true,
        unEdit: true,
      },
      {
        value: "Hot honey 首尔炸鸡（仙霞路）",
        address: "上海市长宁区淞虹路661号",
        protect: true,
        unEdit: true,
      },
      {
        value: "泷千家(天山西路店)",
        address: "天山西路438号",
        protect: true,
      },
      {
        value: "胖仙女纸杯蛋糕（上海凌空店）",
        address: "上海市长宁区金钟路968号1幢18号楼一层商铺18-101",
        protect: true,
      },
      { value: "贡茶", address: "上海市长宁区金钟路633号", protect: false },
      {
        value: "豪大大香鸡排超级奶爸",
        address: "上海市嘉定区曹安公路曹安路1685号",
      },
      {
        value: "茶芝兰（奶茶，手抓饼）",
        address: "上海市普陀区同普路1435号",
        protect: false,
      },
      {
        value: "十二泷町",
        address: "上海市北翟路1444弄81号B幢-107",
        protect: false,
      },
      {
        value: "星移浓缩咖啡",
        address: "上海市嘉定区新郁路817号",
        protect: false,
      },
      {
        value: "阿姨奶茶/豪大大",
        address: "嘉定区曹安路1611号",
        protect: false,
      },
      {
        value: "新麦甜四季甜品炸鸡",
        address: "嘉定区曹安公路2383弄55号",
        protect: false,
      },
      {
        value: "Monica摩托主题咖啡店",
        address: "嘉定区江桥镇曹安公路2409号1F，2383弄62号1F",
        protect: false,
      },
      {
        value: "浮生若茶（凌空soho店）",
        address: "上海长宁区金钟路968号9号楼地下一层",
        protect: false,
      },
      {
        value: "NONO JUICE  鲜榨果汁",
        address: "上海市长宁区天山西路119号",
        protect: false,
      },
      {
        value: "CoCo都可(北新泾店）",
        address: "上海市长宁区仙霞西路",
        protect: false,
      },
      {
        value: "快乐柠檬（神州智慧店）",
        address: "上海市长宁区天山西路567号1层R117号店铺",
        protect: false,
      },
      {
        value: "Merci Paul cafe",
        address: "上海市普陀区光复西路丹巴路28弄6号楼819",
        protect: false,
      },
      {
        value: "猫山王（西郊百联店）",
        address: "上海市长宁区仙霞西路88号第一层G05-F01-1-306",
        protect: false,
      },
      { value: "枪会山", address: "上海市普陀区棕榈路", protect: false },
      {
        value: "纵食",
        address: "元丰天山花园(东门) 双流路267号",
        protect: false,
      },
      { value: "钱记", address: "上海市长宁区天山西路", protect: false },
      { value: "壹杯加", address: "上海市长宁区通协路", protect: false },
      {
        value: "唦哇嘀咖",
        address: "上海市长宁区新泾镇金钟路999号2幢（B幢）第01层第1-02A单元",
        protect: false,
      },
      {
        value: "爱茜茜里(西郊百联)",
        address: "长宁区仙霞西路88号1305室",
        protect: false,
      },
      {
        value: "爱茜茜里(近铁广场)",
        address: "上海市普陀区真北路818号近铁城市广场北区地下二楼N-B2-O2-C商铺",
        protect: false,
      },
      {
        value: "鲜果榨汁（金沙江路和美广店）",
        address: "普陀区金沙江路2239号金沙和美广场B1-10-6",
        protect: false,
      },
      {
        value: "开心丽果（缤谷店）",
        address: "上海市长宁区威宁路天山路341号",
        protect: false,
      },
      {
        value: "超级鸡车（丰庄路店）",
        address: "上海市嘉定区丰庄路240号",
        protect: false,
      },
      {
        value: "妙生活果园（北新泾店）",
        address: "长宁区新渔路144号",
        protect: true,
      },
      {
        value: "香宜度麻辣香锅",
        address: "长宁区淞虹路148号",
        protect: false,
      },
      {
        value: "凡仔汉堡（老真北路店）",
        address: "上海市普陀区老真北路160号",
        protect: false,
      },
      {
        value: "港式小铺",
        address: "上海市长宁区金钟路968号15楼15-105室",
        protect: false,
      },
      {
        value: "蜀香源麻辣香锅（剑河路店）",
        address: "剑河路443-1",
        protect: false,
      },
      {
        value: "北京饺子馆",
        address: "长宁区北新泾街道天山西路490-1号",
        protect: false,
      },
      {
        value: "饭典*新简餐（凌空SOHO店）",
        address: "上海市长宁区金钟路968号9号楼地下一层9-83室",
        protect: false,
      },
      {
        value: "焦耳·川式快餐（金钟路店）",
        address: "上海市金钟路633号地下一层甲部",
        protect: false,
      },
      {
        value: "动力鸡车",
        address: "长宁区仙霞西路299弄3号101B",
        protect: false,
      },
      { value: "浏阳蒸菜", address: "天山西路430号", protect: false },
      {
        value: "四海游龙（天山西路店）",
        address: "上海市长宁区天山西路",
        protect: false,
      },
      {
        value: "樱花食堂（凌空店）",
        address: "上海市长宁区金钟路968号15楼15-105室",
        protect: false,
      },
      {
        value: "壹分米客家传统调制米粉(天山店)",
        address: "天山西路428号",
        protect: false,
      },
      {
        value: "福荣祥烧腊（平溪路店）",
        address: "上海市长宁区协和路福泉路255弄57-73号",
        protect: false,
      },
      {
        value: "速记黄焖鸡米饭",
        address: "上海市长宁区北新泾街道金钟路180号1层01号摊位",
        protect: false,
      },
      {
        value: "红辣椒麻辣烫",
        address: "上海市长宁区天山西路492号",
        protect: false,
      },
      {
        value: "(小杨生煎)西郊百联餐厅",
        address: "长宁区仙霞西路88号百联2楼",
        protect: false,
      },
      { value: "阳阳麻辣烫", address: "天山西路389号", protect: false },
      {
        value: "南拳妈妈龙虾盖浇饭",
        address: "普陀区金沙江路1699号鑫乐惠美食广场A13",
        protect: false,
      }
    );
    this.loadAll(0, 10).then((res) => {
      this.queryTableData = res.data;
      this.totalNum = res.total;
    });
  },
  mounted() {},
  methods: {
    // dialog中获取子组件实例，因为dialog是懒加载的，所以获取子组件实例可以放在open回调函数中

    openDialog() {
      this.addDataVisible = true;
    },
    query() {
      // 根据输入的内容，远程模糊搜索，结果赋值给表格
      let option = this.queryForm.name;
    },
    /**
     * 1. 模拟分页（后端实现分页），根据当前页和显示条数，查询对应的数据，总共49条数据，按一页十个，分为五页
     * 根据参数第几页就返回第几页的数据，初始加载第一页，滚动条到底部时，页数加1，然后返回对应页面的数据与上次数据连接起来赋值给表格
     * page=[0,5]
     * 2. 请求参数有pageSize,limit返回满足条件的数据
     */
    /**
     * 是否可以编辑保护图层，
     */
    async loadAll(start, limit) {
      const res = {};
      // 根据参数返回相应数据
      const tableData = [];
      this.totalData.forEach((item) => {
        tableData.push(item);
      });
      const data = tableData.slice(start, start + limit);
      res.data = data;
      res.total = tableData.length;
      return res;
    },

    /**
     * 删除相应行的数据
     */
    deleteData(row, index) {
      for (const item of this.totalData) {
        if (item.value === row.value) {
          this.totalData.splice(index, 1);
        }
      }
      this.loadAll(0, this.queryTableData.length).then((res) => {
        this.queryTableData = res.data;
        this.totalNum = res.total;
      });
    },
    /**
     * 滚动到底部再次加载
     */
    loadAgain: function(size, limit) {
      this.loadAll(size, limit).then((res) => {
        this.queryTableData = this.queryTableData.concat(res.data);
      });
    },
  },
};
</script>
<style scoped>
.el-dialog__wrapper /deep/ .el-dialog__header {
  padding: 0px 0px;
  /* border-bottom: 1px solid #ddd; */
}
.el-dialog__wrapper /deep/ .el-dialog__title {
  font-size: 16px;
}
.el-dialog__wrapper /deep/ .el-dialog__body {
  padding: 0px !important;
}
.el-dialog__wrapper /deep/ .el-dialog__footer {
  padding: 10px 20px 15px;
  text-align: right;
  box-sizing: border-box;
  border-top: 1px solid #ddd;
}
.el-dialog__wrapper /deep/ .el-dialog__body {
  margin: 0;
  padding: 8px 0px 10px;
}
.el-table::before {
  height: 0;
}
.el-dialog__wrapper /deep/ .el-dialog__headerbtn {
  top: 12px;
}
.el-dialog__wrapper /deep/ .el-tabs__item {
  font-size: 16px;
}
.el-dialog__wrapper /deep/ .el-dialog__headerbtn {
  z-index: 999; /**调整关闭按钮的层级及位置 */
}
.el-tabs /deep/ .el-tabs__nav-wrap::after {
  height: 1px;
}
.el-tabs /deep/ .el-tabs__header {
  margin: 0px;
}
.el-tabs /deep/.el-tabs__nav-scroll {
  padding: 0px 20px;
}
</style>
