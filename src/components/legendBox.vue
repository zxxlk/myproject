<template>
  <div>
    <el-collapse-transition>
      <el-card v-show="cardVisible" class="legend_card">
        <el-table :data="states" size="mini" class="legend-table">
          <el-table-column label="legend" min-width="70">
            <template slot-scope="scope">
              <img
                slot="reference"
                :src="scope.row.pictures"
                style="width: 26px;height: 30px"
              />
            </template>
          </el-table-column>
          <el-table-column prop="name" min-width="100"></el-table-column>
        </el-table>
      </el-card>
    </el-collapse-transition>
    <div>
      <el-button
        circle
        icon="el-icon-tickets"
        @click="onClick"
        class="legend-button"
      ></el-button>
    </div>
  </div>
</template>
<script>
import onlineIcon from '../assets/onlineIcon.png';
import allOfflineIcon from '../assets/allOfflineIcon.png';
import pieceOfflineIcon from '../assets/pieceOfflineIcon.png';
import alarmIcon from '../assets/alarmIcon.png';

export default {
  data() {
    return {
      cardVisible: false,
      cardVisibles: false,
      states: [
        {
          id: 1,
          name: 'online',
          pictures: onlineIcon,
        },
        {
          id: 2,
          name: 'allOffline',
          pictures: allOfflineIcon,
        },
        {
          id: 3,
          name: 'pieceOffline',
          pictures: pieceOfflineIcon,
        },
        {
          id: 4,
          name: 'alarm',
          pictures: alarmIcon,
        },
      ],
    };
  },
  methods: {
    onClick() {
      this.cardVisible = !this.cardVisible;
    },
  },
};
</script>
<style lang="scss">
.legend_card {
  position: absolute;
  right: 0px;
  bottom: 40px;
  background-color: rgba(255, 255, 255, 0.6); // 透明度设置为0.5

  .el-card__body {
    padding: 0px;
    position: unset;
    margin: 5px;
    border-radius: 10px;
    // background-color: rgba(255, 255, 255, 0.5);
    .el-table--fit {
      background-color: rgba(255, 255, 255, 0);
    }
    .el-table--mini,
    .el-table--small,
    .el-table__expand-icon {
      font-size: 14px;
      color: #000;
    }
    .el-table--mini td,
    .el-table--mini th {
      padding: 3px 0px 3px 0px;
    }
  }
}

.el-switch {
  margin: 5px;
  display: flex;
}

.legend-table th > .cell {
  padding-left: 7px !important;
}

.legend-table td,
.legend-table th.is-leaf {
  border-bottom: 0px;
}

.legend-table::before {
  height: 0px;
}

.legend-table th,
.legend-table tr {
  background-color: rgba(255, 255, 255, 0) !important;
}

.legend-table thead {
  color: #000;
  font-size: initial;
}

.legend-table {
  .el-table__header-wrapper {
    background-color: rgba(255, 255, 255, 0) !important;
  }
}

.legend-table .cell {
  line-height: 16px;
}

.legend-button.is-circle {
  padding: 9px;
}
</style>
