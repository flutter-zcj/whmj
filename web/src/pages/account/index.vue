<style lang="scss" scoped>
$brand: #1aa86c;
$brand-deep: #12925b;
$ink: #1b1f24;
$sub: #6b7280;
$faint: #9ca3af;
$line: #eff1f4;
$bg: #f5f6f8;
.page { position: relative; display: flex; flex-direction: column; width: 100%; height: 100vh; overflow: hidden; background: $bg; }
.overview { position: relative; display: flex; flex-direction: column; flex-shrink: 0; padding: 36rpx 32rpx 40rpx; background: linear-gradient(158deg, #1fb377 0%, $brand 46%, $brand-deep 100%); }
.overview__top { position: relative; display: flex; align-items: center; justify-content: space-between; }
.overview__action { display: flex; align-items: center; }
.overview__title { font-size: 32rpx; font-weight: 600; color: #fff; }
.month { display: flex; align-items: center; }
.month__arrow { display: flex; align-items: center; justify-content: center; width: 48rpx; height: 48rpx; }
.month__text { font-size: 28rpx; font-weight: 600; color: #fff; letter-spacing: 0.5rpx; }
.ledger { padding: 8rpx 20rpx; border: 1rpx solid rgba(255, 255, 255, 0.5); margin-right: 16rpx; background: rgba(255, 255, 255, 0.16); font-size: 22rpx; color: #fff; border-radius: 999rpx; }
.overview__search { display: flex; align-items: center; justify-content: center; width: 48rpx; height: 48rpx; }
.overview__main { position: relative; display: flex; flex-direction: column; margin-top: 26rpx; }
.overview__label { font-size: 22rpx; color: rgba(255, 255, 255, 0.78); letter-spacing: 1rpx; }
.overview__amount { margin-top: 8rpx; font-size: 68rpx; font-weight: 700; color: #fff; letter-spacing: -1rpx; }
.overview__stats { position: relative; display: flex; margin-top: 26rpx; }
.stat { display: flex; flex: 1; flex-direction: column; }
.stat__label { font-size: 21rpx; color: rgba(255, 255, 255, 0.72); }
.stat__value { margin-top: 6rpx; font-size: 27rpx; font-weight: 600; color: #fff; }
.budget { position: relative; display: flex; flex-direction: column; margin-top: 26rpx; }
.budget__head { display: flex; justify-content: space-between; }
.budget__text { font-size: 20rpx; color: rgba(255, 255, 255, 0.82); }
.budget__track { height: 8rpx; margin-top: 10rpx; background: rgba(255, 255, 255, 0.26); border-radius: 999rpx; }
.budget__fill { height: 100%; background: #fff; border-radius: 999rpx; }
.budget__fill--over { background: #ffd75e; }
.content { position: relative; display: flex; flex: 1; flex-direction: column; box-sizing: border-box; width: 100%; min-height: 0; padding: 24rpx 24rpx 0; overflow-x: hidden; }
.day { margin-bottom: 28rpx; }
.day__head { display: flex; align-items: baseline; justify-content: space-between; padding: 0 8rpx 12rpx; }
.day__date { font-size: 25rpx; font-weight: 600; color: $ink; }
.day__week { margin-left: 10rpx; font-size: 21rpx; color: $faint; }
.day__total { font-size: 21rpx; color: $faint; }
.day__body { display: flex; flex-direction: column; overflow: hidden; background: #fff; border-radius: 20rpx; }
.row { display: flex; align-items: center; padding: 22rpx 24rpx; border-bottom: 1rpx solid $line; }
.row--last { border-bottom: none; }
.row__photo { width: 84rpx; height: 84rpx; background: #f2f3f5; border-radius: 26rpx; }
.row__info { display: flex; flex: 1; flex-direction: column; min-width: 0; margin-left: 20rpx; }
.row__title { display: flex; align-items: center; }
.row__name { font-size: 28rpx; font-weight: 500; color: $ink; }
.row__tag { padding: 2rpx 10rpx; margin-left: 10rpx; background: #f1f3f6; font-size: 18rpx; color: $sub; border-radius: 999rpx; }
.row__meta { margin-top: 6rpx; overflow: hidden; font-size: 21rpx; color: $faint; white-space: nowrap; text-overflow: ellipsis; }
.row__amount { font-size: 30rpx; font-weight: 600; color: $ink; }
.row__amount--income { color: $brand; }
.row__amount--transfer { color: #55637a; }
.card { display: flex; flex-direction: column; padding: 26rpx 24rpx; margin-bottom: 20rpx; background: #fff; border-radius: 22rpx; }
.card__head { display: flex; align-items: center; justify-content: space-between; }
.card__title { font-size: 28rpx; font-weight: 600; color: $ink; }
.card__action { font-size: 23rpx; color: $brand; }
.segment { display: flex; padding: 5rpx; background: #f1f3f6; border-radius: 999rpx; }
.segment__item { padding: 8rpx 26rpx; font-size: 22rpx; color: $sub; border-radius: 999rpx; }
.segment__item--active { background: $ink; font-weight: 600; color: #fff; }
.donut { display: flex; align-items: center; justify-content: center; width: 200rpx; height: 200rpx; border-radius: 50%; }
.donut__hole { display: flex; flex-direction: column; align-items: center; justify-content: center; width: 136rpx; height: 136rpx; background: #fff; border-radius: 50%; }
.donut__label { font-size: 18rpx; color: $faint; }
.donut__value { font-size: 24rpx; font-weight: 700; color: $ink; }
.donut-row { display: flex; align-items: center; margin-top: 24rpx; }
.donut__legend { display: flex; flex: 1; flex-direction: column; margin-left: 24rpx; }
.legend { display: flex; align-items: center; padding: 5rpx 0; }
.legend__dot { width: 14rpx; height: 14rpx; border-radius: 50%; }
.legend__name { flex: 1; margin-left: 10rpx; font-size: 22rpx; color: $sub; }
.legend__percent { font-size: 22rpx; color: $faint; }
.rank { display: flex; flex-direction: column; margin-top: 8rpx; }
.rank__row { display: flex; align-items: center; padding: 18rpx 0; border-bottom: 1rpx solid $line; }
.rank__row--last { border-bottom: none; }
.rank__photo { width: 56rpx; height: 56rpx; border-radius: 16rpx; }
.rank__name { width: 130rpx; margin-left: 16rpx; overflow: hidden; font-size: 25rpx; color: $ink; white-space: nowrap; text-overflow: ellipsis; }
.rank__bar { flex: 1; height: 12rpx; overflow: hidden; background: #f1f3f6; border-radius: 999rpx; }
.rank__fill { height: 100%; background: $brand; border-radius: 999rpx; }
.rank__amount { width: 150rpx; font-size: 24rpx; font-weight: 600; color: $ink; text-align: right; }
.trend { display: flex; align-items: flex-end; justify-content: space-between; height: 220rpx; margin-top: 24rpx; }
.trend__col { display: flex; flex: 1; flex-direction: column; align-items: center; justify-content: flex-end; height: 100%; }
.trend__bar { width: 20rpx; background: $brand; border-radius: 8rpx 8rpx 0 0; }
.trend__month { margin-top: 10rpx; font-size: 19rpx; color: $faint; }
.asset-card { display: flex; flex-direction: column; padding: 32rpx 30rpx; margin-bottom: 20rpx; background: linear-gradient(150deg, #2c3a48 0%, #1c2833 100%); border-radius: 24rpx; }
.asset-card__label { font-size: 22rpx; color: rgba(255, 255, 255, 0.68); }
.asset-card__value { margin-top: 8rpx; font-size: 58rpx; font-weight: 700; color: #fff; }
.asset-card__sub { display: flex; margin-top: 16rpx; }
.asset-card__item { font-size: 21rpx; color: rgba(255, 255, 255, 0.66); }
.asset-card__item--gap { margin-left: 32rpx; }
.account { display: flex; align-items: center; padding: 20rpx 0; border-bottom: 1rpx solid $line; }
.account--last { border-bottom: none; }
.account__icon { display: flex; align-items: center; justify-content: center; width: 72rpx; height: 72rpx; border-radius: 50%; }
.account__info { display: flex; flex: 1; flex-direction: column; margin-left: 18rpx; }
.account__name { font-size: 27rpx; color: $ink; }
.account__meta { margin-top: 4rpx; font-size: 20rpx; color: $faint; }
.account__balance { font-size: 28rpx; font-weight: 600; color: $ink; }
.account__balance--minus { color: #e05252; }
.profile { display: flex; align-items: center; padding: 30rpx 26rpx; margin-bottom: 20rpx; background: #fff; border-radius: 22rpx; }
.profile__avatar { width: 104rpx; height: 104rpx; border-radius: 32rpx; }
.profile__info { display: flex; flex-direction: column; margin-left: 22rpx; }
.profile__name { font-size: 32rpx; font-weight: 600; color: $ink; }
.profile__account { margin-top: 6rpx; font-size: 22rpx; color: $faint; }
.cell { display: flex; align-items: center; padding: 24rpx 0; border-bottom: 1rpx solid $line; }
.cell--last { border-bottom: none; }
.cell__label { flex: 1; margin-left: 18rpx; font-size: 27rpx; color: $ink; }
.cell__label--danger { color: #e05252; }
.cell__value { font-size: 24rpx; color: $faint; }
.empty { display: flex; flex-direction: column; align-items: center; padding: 90rpx 0 60rpx; }
.empty__photo { width: 300rpx; height: 200rpx; opacity: 0.9; border-radius: 24rpx; }
.empty__text { margin-top: 24rpx; font-size: 26rpx; color: $sub; }
.empty__tip { margin-top: 10rpx; font-size: 22rpx; color: $faint; }
.dock { position: relative; display: flex; flex-shrink: 0; align-items: flex-end; padding: 10rpx 0 calc(10rpx + env(safe-area-inset-bottom)); background: #fff; border-top: 1rpx solid $line; }
.dock__item { display: flex; flex: 1; flex-direction: column; align-items: center; padding: 10rpx 0; }
.dock__text { margin-top: 6rpx; font-size: 19rpx; color: $faint; }
.dock__text--active { font-weight: 600; color: $brand; }
.dock__add { display: flex; flex: 1; align-items: center; justify-content: center; }
.dock__add-btn { display: flex; align-items: center; justify-content: center; width: 104rpx; height: 104rpx; margin-top: -46rpx; background: linear-gradient(150deg, #24bd7d 0%, $brand-deep 100%); box-shadow: 0 10rpx 22rpx rgba(26, 168, 108, 0.34); border-radius: 50%; }
.bottom-holder { height: 40rpx; }
</style>
<template>
  <view class="page">
    <view class="overview">
      <view class="overview__top">
        <view class="month" v-if="isOverview">
          <view class="month__arrow" @click="changeMonth(-1)">
            <acc-icon name="back" :size="30" color="#FFFFFF" />
          </view>
          <text class="month__text">{{ monthLabel }}</text>
          <view class="month__arrow" @click="changeMonth(1)">
            <acc-icon name="forward" :size="30" color="#FFFFFF" />
          </view>
        </view>
        <text class="overview__title" v-else>{{ tabTitle }}</text>
        <view class="overview__action">
          <text class="ledger" @click="goLedger">{{ ledgerName }}</text>
          <view class="overview__search" @click="goAi">
            <acc-icon name="sparkle" :size="32" color="#FFFFFF" />
          </view>
          <view class="overview__search" @click="goSearch">
            <acc-icon name="search" :size="32" color="#FFFFFF" />
          </view>
        </view>
      </view>
      <view class="overview__main" v-if="isOverview">
        <text class="overview__label">本月支出（元）</text>
        <text class="overview__amount">{{ formatMoney(summary.totalExpense) }}</text>
      </view>
      <view class="overview__stats" v-if="isOverview">
        <view class="stat">
          <text class="stat__label">收入</text>
          <text class="stat__value">{{ formatMoney(summary.totalIncome) }}</text>
        </view>
        <view class="stat">
          <text class="stat__label">结余</text>
          <text class="stat__value">{{ formatMoney(summary.balance) }}</text>
        </view>
        <view class="stat">
          <text class="stat__label">笔数</text>
          <text class="stat__value">{{ summary.billCount }}</text>
        </view>
      </view>
      <view class="budget" v-if="hasBudget">
        <view class="budget__head">
          <text class="budget__text">预算 {{ formatMoney(budget.totalAmount) }}</text>
          <text class="budget__text">剩 {{ formatMoney(budgetRest) }}</text>
        </view>
        <view class="budget__track">
          <view class="budget__fill" :class="budgetFillClass" :style="budgetFillStyle" />
        </view>
      </view>
    </view>

    <scroll-view class="content" scroll-y>
      <view v-show="tab === 'list'">
        <view class="day" v-for="group in groupedBills" :key="group.date">
          <view class="day__head">
            <view>
              <text class="day__date">{{ group.dateLabel }}</text>
              <text class="day__week">{{ group.weekLabel }}</text>
            </view>
            <text class="day__total">{{ group.totalText }}</text>
          </view>
          <view class="day__body">
            <view class="row" v-for="(bill, index) in group.items" :key="bill.billId"
                  :class="{ 'row--last': index === group.items.length - 1 }"
                  @click="editBill(bill)" @longpress="onBillLongPress(bill)">
              <image class="row__photo" :src="rowPhoto(bill)" mode="aspectFill" />
              <view class="row__info">
                <view class="row__title">
                  <text class="row__name">{{ billTitle(bill) }}</text>
                  <text class="row__tag" v-if="bill.tag">{{ bill.tag }}</text>
                </view>
                <text class="row__meta">{{ billSub(bill) }}</text>
              </view>
              <text class="row__amount" :class="amountClass(bill)">{{ amountText(bill) }}</text>
            </view>
          </view>
        </view>
        <view class="empty" v-if="groupedBills.length === 0">
          <image class="empty__photo" :src="emptyPhoto" mode="aspectFill" />
          <text class="empty__text">本月还没有记录</text>
          <text class="empty__tip">点底部「记账」写下第一笔</text>
        </view>
        <view class="bottom-holder" />
      </view>

      <view v-show="tab === 'stats'">
        <view class="card">
          <view class="card__head">
            <text class="card__title">{{ statType === '0' ? '支出构成' : '收入构成' }}</text>
            <view class="segment">
              <text class="segment__item" :class="expenseSegmentClass" @click="switchStatType('0')">支出</text>
              <text class="segment__item" :class="incomeSegmentClass" @click="switchStatType('1')">收入</text>
            </view>
          </view>
          <view class="donut-row" v-if="categoryStats.length">
            <view class="donut" :style="donutStyle">
              <view class="donut__hole">
                <text class="donut__label">合计</text>
                <text class="donut__value">{{ formatMoney(statTotal) }}</text>
              </view>
            </view>
            <view class="donut__legend">
              <view class="legend" v-for="item in topCategories" :key="item.categoryId">
                <view class="legend__dot" :style="dotStyle(item)" />
                <text class="legend__name">{{ item.categoryName }}</text>
                <text class="legend__percent">{{ item.percent }}%</text>
              </view>
            </view>
          </view>
          <view class="empty" v-else>
            <text class="empty__text">本期暂无数据</text>
          </view>
        </view>

        <view class="card">
          <view class="card__head">
            <text class="card__title">{{ statType === '0' ? '支出排行' : '收入排行' }}</text>
            <text class="card__action" @click="goCategoryManage">分类管理</text>
          </view>
          <view class="rank">
            <view class="rank__row" v-for="(item, index) in categoryStats" :key="item.categoryId"
                  :class="{ 'rank__row--last': index === categoryStats.length - 1 }">
              <image class="rank__photo" :src="rankPhoto(item)" mode="aspectFill" />
              <text class="rank__name">{{ item.categoryName }}</text>
              <view class="rank__bar">
                <view class="rank__fill" :style="rankFillStyle(item)" />
              </view>
              <text class="rank__amount">{{ formatMoney(item.amount) }}</text>
            </view>
          </view>
        </view>

        <view class="card">
          <view class="card__head">
            <text class="card__title">近半年趋势</text>
          </view>
          <view class="trend">
            <view class="trend__col" v-for="item in trends" :key="item.month">
              <view class="trend__bar" :style="trendStyle(item)" />
              <text class="trend__month">{{ item.month.slice(5) }}月</text>
            </view>
          </view>
        </view>
        <view class="bottom-holder" />
      </view>

      <view v-show="tab === 'asset'">
        <view class="asset-card">
          <text class="asset-card__label">净资产（元）</text>
          <text class="asset-card__value">{{ formatMoney(asset.netAsset) }}</text>
          <view class="asset-card__sub">
            <text class="asset-card__item">总资产 {{ formatMoney(asset.totalAsset) }}</text>
            <text class="asset-card__item asset-card__item--gap">负债 {{ formatMoney(asset.totalDebt) }}</text>
          </view>
        </view>
        <view class="card">
          <view class="card__head">
            <text class="card__title">账户</text>
            <text class="card__action" @click="goAccounts">管理</text>
          </view>
          <view class="account" v-for="(item, index) in asset.accounts" :key="item.accountId"
                :class="{ 'account--last': index === asset.accounts.length - 1 }">
            <view class="account__icon" :style="accountIconStyle(item)">
              <acc-icon :name="accountIcon(item)" :size="36" color="#FFFFFF" />
            </view>
            <view class="account__info">
              <text class="account__name">{{ item.accountName }}</text>
              <text class="account__meta">{{ accountTypeLabel(item.accountType) }} · 收 {{ formatMoney(item.income) }}</text>
            </view>
            <text class="account__balance" :class="{ 'account__balance--minus': item.balance < 0 }">
              {{ formatMoney(item.balance) }}
            </text>
          </view>
          <view class="empty" v-if="asset.accounts.length === 0">
            <text class="empty__text">还没有账户</text>
          </view>
        </view>
        <view class="bottom-holder" />
      </view>

      <view v-show="tab === 'mine'">
        <view class="profile">
          <image class="profile__avatar" :src="avatar" mode="aspectFill" />
          <view class="profile__info">
            <text class="profile__name">{{ nickName }}</text>
            <text class="profile__account">账号 {{ userName }}</text>
          </view>
        </view>
        <view class="card">
          <view class="cell" @click="goBudget">
            <acc-icon name="coins" :size="38" color="#1AA86C" />
            <text class="cell__label">预算</text>
            <text class="cell__value">{{ budgetText }}</text>
            <acc-icon name="forward" :size="28" color="#CBD1D9" />
          </view>
          <view class="cell" @click="goRecurring">
            <acc-icon name="repeat" :size="38" color="#1AA86C" />
            <text class="cell__label">周期记账</text>
            <acc-icon name="forward" :size="28" color="#CBD1D9" />
          </view>
          <view class="cell" @click="goCategoryManage">
            <acc-icon name="sliders" :size="38" color="#1AA86C" />
            <text class="cell__label">分类管理</text>
            <acc-icon name="forward" :size="28" color="#CBD1D9" />
          </view>
          <view class="cell" @click="goAccounts">
            <acc-icon name="wallet" :size="38" color="#1AA86C" />
            <text class="cell__label">资产管理</text>
            <acc-icon name="forward" :size="28" color="#CBD1D9" />
          </view>
          <view class="cell cell--last" @click="goLedger">
            <acc-icon name="people" :size="38" color="#1AA86C" />
            <text class="cell__label">账本与成员</text>
            <acc-icon name="forward" :size="28" color="#CBD1D9" />
          </view>
        </view>
        <view class="card">
          <view class="cell" @click="goSearch">
            <acc-icon name="search" :size="38" color="#1AA86C" />
            <text class="cell__label">搜索账单</text>
            <acc-icon name="forward" :size="28" color="#CBD1D9" />
          </view>
          <view class="cell" @click="refreshAll">
            <acc-icon name="refresh" :size="38" color="#1AA86C" />
            <text class="cell__label">刷新数据</text>
            <acc-icon name="forward" :size="28" color="#CBD1D9" />
          </view>
          <view class="cell cell--last" @click="logout">
            <acc-icon name="logout" :size="38" color="#E05252" />
            <text class="cell__label cell__label--danger">退出登录</text>
            <acc-icon name="forward" :size="28" color="#CBD1D9" />
          </view>
        </view>
        <view class="bottom-holder" />
      </view>
    </scroll-view>

    <view class="dock">
      <view class="dock__item" @click="switchTab('list')">
        <acc-icon name="list" :size="44" :color="tab === 'list' ? '#1AA86C' : '#9CA3AF'" />
        <text class="dock__text" :class="{ 'dock__text--active': tab === 'list' }">明细</text>
      </view>
      <view class="dock__item" @click="switchTab('stats')">
        <acc-icon name="chart" :size="44" :color="tab === 'stats' ? '#1AA86C' : '#9CA3AF'" />
        <text class="dock__text" :class="{ 'dock__text--active': tab === 'stats' }">统计</text>
      </view>
      <view class="dock__add" @click="goAdd">
        <view class="dock__add-btn">
          <acc-icon name="plus" :size="52" color="#FFFFFF" />
        </view>
      </view>
      <view class="dock__item" @click="switchTab('asset')">
        <acc-icon name="wallet" :size="44" :color="tab === 'asset' ? '#1AA86C' : '#9CA3AF'" />
        <text class="dock__text" :class="{ 'dock__text--active': tab === 'asset' }">资产</text>
      </view>
      <view class="dock__item" @click="switchTab('mine')">
        <acc-icon name="user" :size="44" :color="tab === 'mine' ? '#1AA86C' : '#9CA3AF'" />
        <text class="dock__text" :class="{ 'dock__text--active': tab === 'mine' }">我的</text>
      </view>
    </view>
  </view>
</template>
<script setup>
/**
 * 组件名称：account/index
 * 功能说明：记账首页，含明细、统计、资产、我的四个分页与底部记账入口
 * 研发时间：2026/10/28
 * 研发人员：郑朝军
 *
 * 变量说明：
 * @data {String}  tab           - 当前分页（list/stats/asset/mine）
 * @data {String}  statType      - 统计口径（0支出 1收入）
 * @data {Array}   bills         - 当月账单列表
 * @data {Object}  summary       - 当月收支汇总
 * @data {Array}   categoryStats - 分类占比统计
 * @data {Array}   trends        - 近半年趋势
 * @data {Object}  budget        - 当月预算
 * @data {Object}  asset         - 账户与资产汇总
 * @data {Object}  cursor        - 当前浏览年月
 * @data {String}  userName      - 登录账号
 * @data {String}  nickName      - 昵称
 * @data {String}  ledgerName    - 当前账本名称
 *
 * 事件说明：
 * @event changeMonth      - 切换浏览月份
 * @event switchStatType   - 切换统计口径
 * @event switchTab        - 切换分页并按需加载数据
 * @event refreshAll       - 刷新账本、用户与全部统计数据
 * @event loadBills        - 加载当月账单
 * @event loadSummary      - 加载当月收支汇总
 * @event loadStats        - 加载分类占比与排行
 * @event loadTrend        - 加载近半年趋势
 * @event loadAsset        - 加载账户与资产
 * @event loadBudget       - 加载当月预算
 * @event loadLedgerName   - 加载当前账本名称
 * @event rowPhoto         - 取账单行左侧图片
 * @event rankPhoto        - 取排行行左侧图片
 * @event billTitle        - 取账单主标题
 * @event billSub          - 取账单副标题
 * @event amountText       - 取带正负号的金额文案
 * @event amountClass      - 取金额样式类
 * @event accountIcon      - 取账户图标名
 * @event accountIconStyle - 取账户图标底色
 * @event trendStyle       - 取趋势柱高度样式
 * @event rankFillStyle    - 取排行条宽度样式
 * @event dotStyle         - 取图例圆点样式
 * @event editBill         - 进入账单编辑
 * @event onBillLongPress  - 长按账单弹出操作
 * @event goAdd            - 进入记账页
 * @event goAi             - 进入 AI 记账页
 * @event goSearch         - 进入搜索页
 * @event goLedger         - 进入账本页
 * @event goRecurring      - 进入周期记账页
 * @event goAccounts       - 进入资产管理页
 * @event goBudget         - 进入预算页
 * @event goCategoryManage - 进入分类管理页
 * @event logout           - 退出登录
 *
 * 插槽说明：
 */

/**
 * 修改时间       人员        说明
 * 2026/10/28     郑朝军      初始创建
 * 2026/10/28     郑朝军      按参考产品重做界面，改用 Unsplash 图片与线性图标
 */
import { ref, computed } from 'vue'
import { onShow } from '@dcloudio/uni-app'
import { getToken, getUser, clearAuth, getLedgerId } from '@/utils/account/http.js'
import { formatMoney, dateLabel, weekLabel, monthRange, accountTypeLabel } from '@/utils/account/format.js'
import { categoryPhoto, photoByKey, avatarPhoto } from '@/utils/account/photos.js'
import {
  getBillList,
  getSummary,
  getCategoryStat,
  getTrend,
  getAccountList,
  getBudget,
  getLedgerList,
  deleteBill
} from '@/utils/account/api.js'

const emptyPhoto = photoByKey('nature')
const avatar = avatarPhoto()

const now = new Date()
const tab = ref('list')
const statType = ref('0')
const bills = ref([])
const summary = ref({ totalIncome: 0, totalExpense: 0, balance: 0, billCount: 0 })
const categoryStats = ref([])
const trends = ref([])
const budget = ref({ totalAmount: 0, totalUsed: 0 })
const asset = ref({ accounts: [], totalAsset: 0, totalDebt: 0, netAsset: 0 })
const cursor = ref({ year: now.getFullYear(), month: now.getMonth() + 1 })
const userName = ref('')
const nickName = ref('')
const ledgerName = ref('我的账本')

const isOverview = computed(() => tab.value === 'list' || tab.value === 'stats')
const tabTitle = computed(() => (tab.value === 'asset' ? '资产' : '我的'))
const range = computed(() => monthRange(cursor.value.year, cursor.value.month))
const monthLabel = computed(() => `${cursor.value.year} 年 ${cursor.value.month} 月`)
const hasBudget = computed(() => Number(budget.value.totalAmount || 0) > 0)
const budgetRest = computed(() => Math.max(Number(budget.value.totalAmount || 0) - Number(budget.value.totalUsed || 0), 0))
const budgetFillClass = computed(() => (Number(budget.value.totalUsed || 0) > Number(budget.value.totalAmount || 0) ? 'budget__fill--over' : ''))
const budgetFillStyle = computed(() =>
{
  const total = Number(budget.value.totalAmount || 0)
  const used = Number(budget.value.totalUsed || 0)

  return { width: `${total ? Math.min(100, Math.round((used / total) * 100)) : 0}%` }
})
const budgetText = computed(() => (hasBudget.value ? `¥${formatMoney(budget.value.totalAmount)}` : '未设置'))
const statTotal = computed(() => categoryStats.value.reduce((sum, item) => sum + Number(item.amount || 0), 0))
const topCategories = computed(() => categoryStats.value.slice(0, 5))
const maxCategoryAmount = computed(() => Math.max(...categoryStats.value.map((item) => Number(item.amount || 0)), 1))
const maxTrend = computed(() => Math.max(...trends.value.map((item) => Number(item.expense || 0)), 1))
const expenseSegmentClass = computed(() => (statType.value === '0' ? 'segment__item--active' : ''))
const incomeSegmentClass = computed(() => (statType.value === '1' ? 'segment__item--active' : ''))

const donutStyle = computed(() =>
{
  const items = categoryStats.value.slice(0, 6)
  if (!items.length)
  {
    return { background: '#eef0f3' }
  }
  let start = 0
  const segments = items.map((item) =>
  {
    const end = start + Number(item.percent || 0)
    const segment = `${item.categoryColor || '#1AA86C'} ${start}% ${end}%`
    start = end

    return segment
  })
  if (start < 100)
  {
    segments.push(`#eef0f3 ${start}% 100%`)
  }

  return { background: `conic-gradient(${segments.join(', ')})` }
})

const groupedBills = computed(() =>
{
  const map = new Map()
  bills.value.forEach((bill) =>
  {
    const date = String(bill.billDate || '').slice(0, 10)
    if (!map.has(date))
    {
      map.set(date, { date, items: [], expense: 0, income: 0 })
    }
    const group = map.get(date)
    group.items.push(bill)
    if (bill.billType === '1')
    {
      group.income += Number(bill.amount || 0)
    }
    else if (bill.billType === '0')
    {
      group.expense += Number(bill.amount || 0)
    }
  })

  return Array.from(map.values()).map((group) => ({
    date: group.date,
    items: group.items,
    dateLabel: dateLabel(group.date),
    weekLabel: weekLabel(group.date),
    totalText: `支 ${formatMoney(group.expense)} · 收 ${formatMoney(group.income)}`
  }))
})

/**
 * 取账单行左侧图片：转账用转账图，其余按分类名匹配
 * @param {Object} bill 账单
 * @returns {String} 图片地址
 */
function rowPhoto(bill)
{
  if (bill.billType === '2')
  {
    return categoryPhoto('转账')
  }

  return categoryPhoto(bill.categoryName)
}

/**
 * 取排行行左侧图片
 * @param {Object} item 分类统计项
 * @returns {String} 图片地址
 */
function rankPhoto(item)
{
  return categoryPhoto(item.categoryName)
}

/**
 * 取账单主标题
 * @param {Object} bill 账单
 * @returns {String} 标题
 */
function billTitle(bill)
{
  if (bill.billType === '2')
  {
    return `${bill.accountName || '账户'} → ${bill.toAccountName || '账户'}`
  }

  return bill.categoryName || '未分类'
}

/**
 * 取账单副标题
 * @param {Object} bill 账单
 * @returns {String} 副标题
 */
function billSub(bill)
{
  const parts = []
  if (bill.remark)
  {
    parts.push(bill.remark)
  }
  if (bill.billType === '2')
  {
    parts.push('转账')
  }
  else if (bill.accountName)
  {
    parts.push(bill.accountName)
  }

  return parts.join(' · ') || '无备注'
}

/**
 * 取带正负号的金额文案
 * @param {Object} bill 账单
 * @returns {String} 金额文案
 */
function amountText(bill)
{
  const sign = bill.billType === '1' ? '+' : bill.billType === '2' ? '' : '-'

  return `${sign}${formatMoney(bill.amount)}`
}

/**
 * 取金额样式类
 * @param {Object} bill 账单
 * @returns {String} 样式类
 */
function amountClass(bill)
{
  if (bill.billType === '1')
  {
    return 'row__amount--income'
  }
  if (bill.billType === '2')
  {
    return 'row__amount--transfer'
  }

  return ''
}

/**
 * 取账户图标名
 * @param {Object} item 账户
 * @returns {String} 图标名
 */
function accountIcon(item)
{
  const map = { 2: 'coins', 3: 'coins', 4: 'invest', 5: 'transfer', 6: 'transfer' }

  return map[String(item.accountType)] || 'wallet'
}

/**
 * 取账户图标底色
 * @param {Object} item 账户
 * @returns {Object} 样式对象
 */
function accountIconStyle(item)
{
  return { background: item.color || '#1AA86C' }
}

/**
 * 取趋势柱高度样式
 * @param {Object} item 月份数据
 * @returns {Object} 样式对象
 */
function trendStyle(item)
{
  const height = Math.max(6, Math.round((Number(item.expense || 0) / maxTrend.value) * 100))

  return { height: `${height}%` }
}

/**
 * 取排行条宽度样式
 * @param {Object} item 分类统计项
 * @returns {Object} 样式对象
 */
function rankFillStyle(item)
{
  const width = Math.max(4, Math.round((Number(item.amount || 0) / maxCategoryAmount.value) * 100))

  return { width: `${width}%` }
}

/**
 * 取图例圆点样式
 * @param {Object} item 分类统计项
 * @returns {Object} 样式对象
 */
function dotStyle(item)
{
  return { background: item.categoryColor || '#1AA86C' }
}

/**
 * 加载当月账单
 * @returns {Promise<void>}
 */
async function loadBills()
{
  try
  {
    const res = await getBillList({
      pageNum: 1,
      pageSize: 200,
      beginDate: range.value.begin,
      endDate: range.value.end
    })
    bills.value = res.rows || []
  }
  catch (error)
  {
    bills.value = []
  }
}

/**
 * 加载当月收支汇总
 * @returns {Promise<void>}
 */
async function loadSummary()
{
  try
  {
    const res = await getSummary(range.value.begin, range.value.end)
    const payload = res.data || res || {}
    summary.value = {
      totalIncome: Number(payload.totalIncome || 0),
      totalExpense: Number(payload.totalExpense || 0),
      balance: Number(payload.balance || 0),
      billCount: Number(payload.billCount || 0)
    }
  }
  catch (error)
  {
    summary.value = { totalIncome: 0, totalExpense: 0, balance: 0, billCount: 0 }
  }
}

/**
 * 加载分类占比与排行
 * @returns {Promise<void>}
 */
async function loadStats()
{
  try
  {
    const res = await getCategoryStat(statType.value, range.value.begin, range.value.end)
    categoryStats.value = res.data || []
  }
  catch (error)
  {
    categoryStats.value = []
  }
}

/**
 * 加载近半年趋势
 * @returns {Promise<void>}
 */
async function loadTrend()
{
  try
  {
    const res = await getTrend(6)
    trends.value = res.data || []
  }
  catch (error)
  {
    trends.value = []
  }
}

/**
 * 加载账户与资产
 * @returns {Promise<void>}
 */
async function loadAsset()
{
  try
  {
    const res = await getAccountList()
    asset.value = res.data || { accounts: [], totalAsset: 0, totalDebt: 0, netAsset: 0 }
  }
  catch (error)
  {
    asset.value = { accounts: [], totalAsset: 0, totalDebt: 0, netAsset: 0 }
  }
}

/**
 * 加载当月预算
 * @returns {Promise<void>}
 */
async function loadBudget()
{
  try
  {
    const res = await getBudget(range.value.key)
    const payload = res.data || {}
    budget.value = { totalAmount: Number(payload.totalAmount || 0), totalUsed: Number(payload.totalUsed || 0) }
  }
  catch (error)
  {
    budget.value = { totalAmount: 0, totalUsed: 0 }
  }
}

/**
 * 加载当前账本名称
 * @returns {Promise<void>}
 */
async function loadLedgerName()
{
  try
  {
    const res = await getLedgerList()
    const list = res.data || []
    const current = Number(getLedgerId() || 0)
    const target = list.find((item) => item.ledgerId === current) || list[0]
    ledgerName.value = target ? target.ledgerName : '我的账本'
  }
  catch (error)
  {
    ledgerName.value = '我的账本'
  }
}

/**
 * 刷新账本、用户与全部统计数据
 * @returns {Promise<void>}
 */
async function refreshAll()
{
  await loadLedgerName()
  const user = getUser()
  if (user)
  {
    userName.value = user.userName || user.username || 'admin'
    nickName.value = user.nickName || userName.value
  }
  await Promise.all([loadBills(), loadSummary(), loadAsset(), loadBudget()])
  if (tab.value === 'stats')
  {
    await Promise.all([loadStats(), loadTrend()])
  }
}

/**
 * 切换浏览月份
 * @param {Number} step 偏移月份（-1 上一月，1 下一月）
 * @returns {Promise<void>}
 */
async function changeMonth(step)
{
  let { year, month } = cursor.value
  month += step
  if (month > 12)
  {
    month = 1
    year += 1
  }
  if (month < 1)
  {
    month = 12
    year -= 1
  }
  cursor.value = { year, month }
  await Promise.all([loadBills(), loadSummary(), loadBudget()])
  if (tab.value === 'stats')
  {
    await loadStats()
  }
}

/**
 * 切换统计口径
 * @param {String} type 0支出 1收入
 * @returns {Promise<void>}
 */
async function switchStatType(type)
{
  statType.value = type
  await loadStats()
}

/**
 * 切换分页并按需加载数据
 * @param {String} next 目标分页
 * @returns {Promise<void>}
 */
async function switchTab(next)
{
  tab.value = next
  if (next === 'stats')
  {
    await Promise.all([loadStats(), loadTrend()])
  }
  if (next === 'asset')
  {
    await loadAsset()
  }
}

/**
 * 进入账单编辑
 * @param {Object} bill 账单
 * @returns {void}
 */
function editBill(bill)
{
  uni.navigateTo({ url: `/pages/account/add?billId=${bill.billId}` })
}

/**
 * 长按账单弹出编辑与删除操作
 * @param {Object} bill 账单
 * @returns {void}
 */
function onBillLongPress(bill)
{
  uni.showActionSheet({
    itemList: ['编辑', '删除'],
    success: (res) =>
    {
      if (res.tapIndex === 0)
      {
        editBill(bill)

        return
      }
      uni.showModal({
        title: '删除账单',
        content: '删除后账户余额会同步调整，确定删除？',
        success: async (modal) =>
        {
          if (!modal.confirm)
          {
            return
          }
          try
          {
            await deleteBill(bill.billId)
            uni.showToast({ title: '已删除', icon: 'success' })
            await refreshAll()
          }
          catch (error)
          {
            uni.showToast({ title: '删除失败', icon: 'none' })
          }
        }
      })
    }
  })
}

/**
 * 进入记账页
 * @returns {void}
 */
function goAdd()
{
  uni.navigateTo({ url: '/pages/account/add' })
}

/**
 * 进入 AI 记账页
 * @returns {void}
 */
function goAi()
{
  uni.navigateTo({ url: '/pages/account/ai' })
}

/**
 * 进入搜索页
 * @returns {void}
 */
function goSearch()
{
  uni.navigateTo({ url: '/pages/account/search' })
}

/**
 * 进入账本页
 * @returns {void}
 */
function goLedger()
{
  uni.navigateTo({ url: '/pages/account/ledger' })
}

/**
 * 进入周期记账页
 * @returns {void}
 */
function goRecurring()
{
  uni.navigateTo({ url: '/pages/account/recurring' })
}

/**
 * 进入资产管理页
 * @returns {void}
 */
function goAccounts()
{
  uni.navigateTo({ url: '/pages/account/account' })
}

/**
 * 进入预算页
 * @returns {void}
 */
function goBudget()
{
  uni.navigateTo({ url: '/pages/account/budget' })
}

/**
 * 进入分类管理页
 * @returns {void}
 */
function goCategoryManage()
{
  uni.navigateTo({ url: `/pages/account/category?type=${statType.value}` })
}

/**
 * 退出登录
 * @returns {void}
 */
function logout()
{
  uni.showModal({
    title: '退出登录',
    content: '确定要退出当前账号吗？',
    success: (res) =>
    {
      if (!res.confirm)
      {
        return
      }
      clearAuth()
      uni.reLaunch({ url: '/pages/login/login' })
    }
  })
}

onShow(() =>
{
  if (!getToken())
  {
    uni.reLaunch({ url: '/pages/login/login' })

    return
  }
  refreshAll()
})
</script>
