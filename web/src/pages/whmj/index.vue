<style lang="scss" scoped>
$wood: #432714;
$wood-light: #6B4322;
$wood-deep: #2C180C;
$gold: #F3C76A;
$gold-light: #FFE9B4;
$gold-deep: #A9752A;
$cream: #FFF6E2;
$ink: #2A2018;
$red: #B4342A;
$line: rgba(255, 214, 140, 0.45);
.page { position: relative; width: 100%; height: 100%; overflow: hidden; background: #7E9080; }
.bg-fill { position: absolute; left: 0; top: 0; width: 100%; height: 100%; filter: blur(10px) saturate(1.06) brightness(0.94); transform: scale(1.06); }
.bg-fill__veil { position: absolute; left: 0; top: 0; width: 100%; height: 100%; background: rgba(30, 40, 32, 0.42); }
.layer { position: absolute; left: 0; top: 0; width: 1334px; height: 750px; transform-origin: 0 0; }
.bg { position: absolute; left: 0; top: 0; width: 1334px; height: 750px; }
.bg__shade { position: absolute; left: 0; top: 0; width: 1334px; height: 750px; background: linear-gradient(180deg, rgba(46, 34, 20, 0.42) 0%, rgba(46, 34, 20, 0.06) 22%, rgba(30, 24, 14, 0.12) 70%, rgba(30, 24, 14, 0.5) 100%); }
.topbar { position: absolute; left: 0; top: 0; display: flex; flex-direction: row; align-items: center; width: 1334px; height: 108px; padding: 0 16px; box-sizing: border-box; background: linear-gradient(180deg, rgba(50, 30, 16, 0.95) 0%, rgba(66, 40, 21, 0.92) 62%, rgba(50, 30, 16, 0.86) 100%); border-bottom: 2px solid rgba(243, 199, 106, 0.62); box-shadow: 0 4px 14px rgba(20, 12, 6, 0.42); }
.user { position: relative; display: flex; flex-direction: row; align-items: center; width: 236px; height: 84px; }
.user__head { position: relative; width: 76px; height: 76px; border: 3px solid $gold; border-radius: 38px; box-shadow: 0 2px 8px rgba(0, 0, 0, 0.34); }
.user__meta { position: relative; display: flex; flex-direction: column; margin-left: 12px; }
.user__nick { position: relative; font-size: 21px; font-weight: 700; line-height: 26px; color: $gold-light; text-shadow: 0 1px 3px rgba(0, 0, 0, 0.5); }
.user__id { position: relative; margin-top: 4px; font-size: 13px; line-height: 16px; color: rgba(255, 246, 226, 0.62); }
.wallet { position: relative; display: flex; flex-direction: row; align-items: center; width: 158px; height: 46px; margin-right: 12px; padding: 0 4px 0 6px; box-sizing: border-box; background: linear-gradient(180deg, rgba(24, 14, 7, 0.72) 0%, rgba(40, 24, 12, 0.72) 100%); border: 1px solid $line; border-radius: 23px; }
.wallet__ico { position: relative; width: 34px; height: 34px; }
.wallet__num { position: relative; flex: 1; margin-left: 2px; font-size: 18px; font-weight: 700; color: $gold-light; text-align: center; }
.wallet__add { position: relative; display: flex; align-items: center; justify-content: center; width: 28px; height: 28px; background: linear-gradient(160deg, #8CE6B6 0%, #2E9E6C 100%); border-radius: 14px; }
.wallet__plus { position: relative; font-size: 20px; font-weight: 700; line-height: 28px; color: #12402C; text-align: center; }
.notice { position: relative; display: flex; flex-direction: row; align-items: center; width: 470px; height: 36px; margin-left: 6px; overflow: hidden; background: linear-gradient(180deg, rgba(16, 9, 4, 0.66) 0%, rgba(32, 19, 9, 0.66) 100%); border: 1px solid rgba(243, 199, 106, 0.5); border-radius: 18px; }
.notice__bar { position: absolute; left: 2px; top: 3px; width: 30px; height: 30px; }
.notice__text { position: relative; margin-left: 40px; font-size: 15px; line-height: 36px; color: #FFE9B4; white-space: nowrap; }
.tools { position: relative; display: flex; flex-direction: row; margin-left: auto; }
.tools__btn { position: relative; display: flex; align-items: center; justify-content: center; width: 52px; height: 52px; margin-left: 12px; background: linear-gradient(160deg, rgba(122, 78, 38, 0.9) 0%, rgba(66, 40, 21, 0.9) 100%); border: 2px solid rgba(243, 199, 106, 0.62); border-radius: 26px; }
.tools__ico { position: relative; width: 26px; height: 26px; }
.tools__dot { position: absolute; right: 3px; top: 3px; width: 10px; height: 10px; background: #FF5A4E; border: 1px solid #FFFFFF; border-radius: 5px; }
.hero { position: absolute; top: 372px; width: 208px; height: 264px; }
.hero--left { position: absolute; left: 2px; }
.main { position: absolute; left: 236px; top: 196px; display: flex; flex-direction: column; width: 474px; height: 424px; padding: 0 22px; box-sizing: border-box; background: linear-gradient(180deg, rgba(58, 35, 18, 0.96) 0%, rgba(38, 22, 11, 0.96) 100%); border: 3px solid $gold; border-radius: 22px; box-shadow: 0 10px 30px rgba(16, 10, 4, 0.55), inset 0 0 0 2px rgba(120, 74, 30, 0.72); }
.main__head { position: relative; display: flex; flex-direction: column; align-items: center; height: 100px; padding-top: 12px; box-sizing: border-box; }
.main__title { position: relative; font-size: 42px; font-weight: 700; letter-spacing: 6px; color: $gold-light; text-shadow: 0 3px 0 #7A4A16, 0 5px 12px rgba(0, 0, 0, 0.5); }
.main__sub { position: relative; margin-top: 6px; padding: 3px 14px; background: rgba(180, 52, 42, 0.9); border: 1px solid rgba(255, 226, 168, 0.7); border-radius: 11px; font-size: 14px; letter-spacing: 1px; color: $cream; }
.main__tiles { position: relative; height: 156px; }
.main__tile { position: absolute; left: 50%; top: 26px; width: 80px; height: 116px; }
.main__tile--a { position: absolute; margin-left: -124px; transform: rotate(-8deg) translateY(10px); }
.main__tile--b { position: absolute; z-index: 2; margin-left: -40px; }
.main__tile--c { position: absolute; margin-left: 44px; transform: rotate(8deg) translateY(10px); }
.main__ops { position: relative; display: flex; flex-direction: row; justify-content: center; margin-top: 6px; }
.main__btn { position: relative; display: flex; align-items: center; justify-content: center; width: 196px; height: 64px; margin: 0 8px; }
.main__btn-bg { position: absolute; left: 0; top: 0; width: 196px; height: 64px; }
.main__tip { position: relative; margin-top: 16px; font-size: 13px; line-height: 20px; color: rgba(255, 232, 188, 0.68); text-align: center; }
.more { position: absolute; left: 728px; top: 196px; display: flex; flex-direction: row; flex-wrap: wrap; width: 556px; }
.more__card { position: relative; display: flex; flex-direction: row; align-items: center; width: 266px; height: 128px; margin: 0 12px 12px 0; padding: 0 10px 0 14px; box-sizing: border-box; background: linear-gradient(160deg, rgba(255, 250, 236, 0.94) 0%, rgba(238, 222, 194, 0.94) 100%); border: 2px solid rgba(150, 102, 44, 0.85); border-radius: 16px; box-shadow: 0 4px 12px rgba(24, 14, 6, 0.34); }
.more__card--lock { position: relative; opacity: 0.72; background: linear-gradient(160deg, rgba(232, 228, 218, 0.94) 0%, rgba(200, 196, 186, 0.94) 100%); border-color: rgba(120, 116, 108, 0.8); }
.more__tiles { position: relative; display: flex; flex-direction: row; align-items: center; justify-content: center; width: 104px; height: 96px; }
.more__tile { position: relative; width: 46px; height: 66px; }
.more__tile--a { position: relative; transform: rotate(-10deg); }
.more__tile--b { position: relative; margin-left: -20px; transform: rotate(6deg) translateY(4px); }
.more__meta { position: relative; display: flex; flex-direction: column; flex: 1; margin-left: 6px; }
.more__name { position: relative; font-size: 20px; font-weight: 700; color: #3E2610; }
.more__desc { position: relative; margin-top: 4px; font-size: 12px; line-height: 16px; color: rgba(62, 38, 16, 0.66); }
.more__badge { position: absolute; right: 8px; top: 8px; padding: 1px 8px; background: linear-gradient(160deg, #FF8B66 0%, #C4302A 100%); border: 1px solid rgba(255, 244, 214, 0.9); border-radius: 9px; font-size: 11px; font-weight: 700; color: $cream; }
.more__lock { position: absolute; right: 10px; bottom: 9px; display: flex; align-items: center; justify-content: center; width: 86px; height: 22px; background: rgba(56, 50, 42, 0.74); border-radius: 11px; }
.more__lockText { position: relative; font-size: 12px; letter-spacing: 1px; color: rgba(255, 248, 232, 0.92); }
.dock { position: absolute; left: 0; bottom: 0; display: flex; flex-direction: row; align-items: center; justify-content: space-around; width: 1334px; height: 96px; padding: 0 240px; box-sizing: border-box; background: linear-gradient(180deg, rgba(46, 27, 13, 0.94) 0%, rgba(30, 17, 8, 0.97) 100%); border-top: 2px solid rgba(243, 199, 106, 0.66); box-shadow: 0 -4px 16px rgba(18, 10, 4, 0.5); }
.dock__item { position: relative; display: flex; flex-direction: column; align-items: center; justify-content: center; width: 96px; height: 84px; }
.dock__ico { position: relative; width: 34px; height: 34px; }
.dock__text { position: relative; margin-top: 4px; font-size: 15px; color: rgba(255, 246, 226, 0.86); }
.dock__item--on .dock__text { position: relative; color: $gold-light; font-weight: 700; }
.sheet { position: absolute; z-index: 20; left: 0; top: 0; display: flex; align-items: center; justify-content: center; width: 1334px; height: 750px; background: rgba(14, 10, 6, 0.66); }
.sheet__panel { position: relative; display: flex; flex-direction: column; align-items: center; width: 980px; height: 620px; padding-top: 92px; box-sizing: border-box; background: linear-gradient(180deg, rgba(58, 35, 18, 0.98) 0%, rgba(34, 20, 10, 0.98) 100%); border: 3px solid $gold; border-radius: 20px; box-shadow: 0 16px 46px rgba(0, 0, 0, 0.5); }
.sheet__title { position: absolute; left: 50%; top: -34px; margin-left: -140px; width: 280px; height: 68px; line-height: 68px; background: linear-gradient(180deg, #FFE29A 0%, #C48A2E 100%); border: 3px solid #FFF3D2; border-radius: 34px; font-size: 28px; font-weight: 700; letter-spacing: 6px; color: #4A2C08; text-align: center; box-shadow: 0 6px 16px rgba(0, 0, 0, 0.38); }
.sheet__close { position: absolute; right: 14px; top: 14px; display: flex; align-items: center; justify-content: center; width: 46px; height: 46px; background: linear-gradient(160deg, #FF8B66 0%, #B4342A 100%); border: 2px solid #FFE9C4; border-radius: 23px; font-size: 26px; font-weight: 700; line-height: 42px; color: #FFFFFF; text-align: center; }
.sheet__body { position: relative; display: flex; flex-direction: row; width: 940px; height: 496px; }
.tabs { position: relative; display: flex; flex-direction: column; width: 158px; padding-top: 6px; box-sizing: border-box; }
.tabs__item { position: relative; display: flex; flex-direction: row; align-items: center; height: 64px; margin-bottom: 14px; padding-left: 16px; box-sizing: border-box; background: linear-gradient(160deg, #FFE29A 0%, #C48A2E 100%); border: 2px solid #FFF3D2; border-radius: 14px; }
.tabs__item--off { position: relative; background: linear-gradient(160deg, rgba(122, 78, 38, 0.9) 0%, rgba(66, 40, 21, 0.9) 100%); border-color: rgba(243, 199, 106, 0.5); }
.tabs__ico { position: relative; width: 26px; height: 26px; }
.tabs__text { position: relative; margin-left: 8px; font-size: 21px; font-weight: 700; color: #4A2C08; }
.tabs__item--off .tabs__text { position: relative; color: rgba(255, 246, 226, 0.86); }
.packs { position: relative; display: flex; flex-direction: row; flex-wrap: wrap; align-content: flex-start; width: 770px; padding-left: 20px; box-sizing: border-box; }
.pack { position: relative; display: flex; flex-direction: column; align-items: center; width: 224px; height: 214px; margin: 0 16px 18px 0; padding-top: 16px; box-sizing: border-box; background: linear-gradient(180deg, rgba(255, 248, 232, 0.96) 0%, rgba(232, 212, 180, 0.96) 100%); border: 3px solid $gold; border-radius: 16px; }
.pack__tag { position: absolute; left: 50%; top: -13px; margin-left: -58px; width: 116px; height: 24px; background: linear-gradient(160deg, #FF8B66 0%, #C4302A 100%); border: 1px solid rgba(255, 244, 214, 0.9); border-radius: 6px; font-size: 13px; line-height: 22px; color: $cream; text-align: center; }
.pack__name { position: relative; font-size: 20px; font-weight: 700; color: #3E2610; }
.pack__coin { position: relative; width: 92px; height: 74px; margin-top: 6px; }
.pack__price { position: relative; display: flex; flex-direction: row; align-items: center; justify-content: center; width: 100%; height: 42px; background: rgba(120, 74, 30, 0.16); }
.pack__gem { position: relative; width: 22px; height: 22px; }
.pack__num { position: relative; margin-left: 4px; font-size: 20px; font-weight: 700; color: #8A4B12; }
.dlg { position: absolute; z-index: 30; left: 0; top: 0; display: flex; align-items: center; justify-content: center; width: 1334px; height: 750px; background: rgba(14, 10, 6, 0.66); }
.dlg__panel { position: relative; display: flex; flex-direction: column; width: 780px; padding: 0 0 26px; box-sizing: border-box; background: linear-gradient(180deg, rgba(255, 250, 238, 0.98) 0%, rgba(238, 224, 200, 0.98) 100%); border: 3px solid $gold; border-radius: 18px; box-shadow: 0 16px 46px rgba(0, 0, 0, 0.45); }
.dlg__head { position: relative; display: flex; align-items: center; justify-content: center; width: 100%; height: 64px; background: linear-gradient(180deg, #7A4A20 0%, #4A2C12 100%); border-radius: 14px 14px 0 0; }
.dlg__title { position: relative; font-size: 25px; font-weight: 700; letter-spacing: 3px; color: $gold-light; }
.dlg__close { position: absolute; right: 12px; top: 11px; display: flex; align-items: center; justify-content: center; width: 38px; height: 38px; background: linear-gradient(160deg, #FF8B66 0%, #B4342A 100%); border: 2px solid #FFE9C4; border-radius: 19px; font-size: 22px; font-weight: 700; line-height: 34px; color: #FFFFFF; text-align: center; }
.dlg__body { position: relative; padding: 20px 34px 0; }
.dlg__p { position: relative; margin-bottom: 8px; font-size: 17px; line-height: 30px; color: #3A2A18; }
.dlg__sign { position: relative; margin-top: 6px; font-size: 15px; color: #8A7658; text-align: right; }
.dlg__btn { position: relative; display: flex; align-items: center; justify-content: center; width: 260px; height: 62px; margin: 20px auto 0; background: linear-gradient(180deg, #FFE29A 0%, #C48A2E 100%); border: 3px solid #FFF3D2; border-radius: 31px; font-size: 21px; font-weight: 700; color: #4A2C08; box-shadow: 0 5px 14px rgba(60, 34, 10, 0.34); }
.dlg__age { position: absolute; right: 76px; top: 14px; display: flex; flex-direction: column; align-items: center; justify-content: center; width: 64px; height: 64px; background: #F5A623; border: 2px solid #FFFFFF; border-radius: 12px; }
.dlg__age-num { position: relative; font-size: 22px; font-weight: 700; line-height: 22px; color: #FFFFFF; }
.dlg__age-tip { position: relative; font-size: 10px; color: #FFF3D6; }
.join { position: relative; display: flex; flex-direction: column; align-items: center; width: 620px; padding: 40px 0 30px; box-sizing: border-box; background: linear-gradient(180deg, rgba(58, 35, 18, 0.98) 0%, rgba(34, 20, 10, 0.98) 100%); border: 3px solid $gold; border-radius: 20px; }
.join__title { position: relative; font-size: 28px; font-weight: 700; letter-spacing: 4px; color: $gold-light; }
.join__input { position: relative; width: 420px; height: 64px; margin-top: 24px; padding: 0 20px; box-sizing: border-box; background: rgba(255, 248, 232, 0.96); border: 2px solid $gold-deep; border-radius: 12px; font-size: 24px; letter-spacing: 6px; color: #3A2A18; text-align: center; }
.join__ops { position: relative; display: flex; flex-direction: row; margin-top: 26px; }
.join__btn { position: relative; display: flex; align-items: center; justify-content: center; width: 180px; height: 58px; margin: 0 12px; border-radius: 29px; font-size: 20px; font-weight: 700; }
.join__btn--no { position: relative; background: rgba(255, 246, 226, 0.16); border: 1px solid $line; color: $cream; }
.join__btn--yes { position: relative; background: linear-gradient(180deg, #FFE29A 0%, #C48A2E 100%); border: 2px solid #FFF3D2; color: #4A2C08; }
.privacy { position: relative; display: flex; flex-direction: column; width: 820px; padding-bottom: 24px; box-sizing: border-box; background: rgba(250, 244, 230, 0.98); border: 3px solid $gold; border-radius: 16px; box-shadow: 0 16px 46px rgba(0, 0, 0, 0.45); }
.privacy__head { position: relative; display: flex; align-items: center; justify-content: center; width: 100%; height: 66px; background: linear-gradient(180deg, #7A4A20 0%, #4A2C12 100%); border-radius: 13px 13px 0 0; }
.privacy__title { position: relative; font-size: 27px; font-weight: 700; letter-spacing: 4px; color: $gold-light; }
.privacy__body { position: relative; padding: 22px 34px 0; }
.privacy__text { position: relative; font-size: 17px; line-height: 32px; color: #3A2A18; }
.privacy__link { position: relative; margin-top: 14px; font-size: 16px; color: #3A2A18; text-align: center; }
.privacy__em { position: relative; color: #B4342A; text-decoration: underline; }
.privacy__ops { position: relative; display: flex; flex-direction: row; justify-content: center; margin-top: 20px; }
.privacy__btn { position: relative; display: flex; align-items: center; justify-content: center; width: 170px; height: 56px; margin: 0 24px; border-radius: 28px; font-size: 21px; font-weight: 700; }
.privacy__btn--no { position: relative; background: linear-gradient(160deg, #D8D2C4 0%, #A9A192 100%); color: #453417; }
.privacy__btn--yes { position: relative; background: linear-gradient(180deg, #FFE29A 0%, #C48A2E 100%); border: 2px solid #FFF3D2; color: #4A2C08; }
.toast { position: absolute; z-index: 60; left: 50%; top: 420px; margin-left: -190px; display: flex; align-items: center; justify-content: center; width: 380px; height: 58px; background: rgba(28, 18, 10, 0.9); border: 1px solid $line; border-radius: 29px; font-size: 18px; color: $cream; }
</style>

<template>
  <view class="page">
    <image class="bg-fill" :src="bgImage" mode="aspectFill" />
    <view class="bg-fill__veil"></view>
    <view class="layer" :style="rootStyle">
      <image class="bg" :src="bgImage" mode="aspectFill" />
      <view class="bg__shade"></view>

      <view class="topbar">
        <view class="user" @click="logout">
          <image class="user__head" :src="avatar" mode="aspectFill" />
          <view class="user__meta">
            <text class="user__nick">{{ profile.nick }}</text>
            <text class="user__id">ID {{ profile.uid }}</text>
          </view>
        </view>
        <view class="wallet" @click="openSheet('shop')">
          <image class="wallet__ico" :src="coinImage" mode="aspectFit" />
          <text class="wallet__num">{{ goldText }}</text>
          <view class="wallet__add"><text class="wallet__plus">+</text></view>
        </view>
        <view class="wallet" @click="openSheet('shop')">
          <image class="wallet__ico" :src="gemImage" mode="aspectFit" />
          <text class="wallet__num">{{ profile.diamond }}</text>
          <view class="wallet__add"><text class="wallet__plus">+</text></view>
        </view>
        <view class="notice">
          <image class="notice__bar" :src="noticeBar" mode="aspectFit" />
          <text class="notice__text">{{ noticeText }}</text>
        </view>
        <view class="tools">
          <view class="tools__btn" @click="openSheet('notice')">
            <image class="tools__ico" :src="icon('book')" mode="aspectFit" />
          </view>
          <view class="tools__btn" @click="openSheet('mail')">
            <image class="tools__ico" :src="icon('mail')" mode="aspectFit" />
            <view class="tools__dot"></view>
          </view>
        </view>
      </view>

      <image class="hero hero--left" :src="heroLeft" mode="aspectFit" />

      <view class="main">
        <view class="main__head">
          <text class="main__title">武汉麻将</text>
          <text class="main__sub">红中赖子杠 · 二五八将</text>
        </view>
        <view class="main__tiles">
          <image class="main__tile main__tile--a" :src="tileImage('w', 9)" mode="aspectFit" />
          <image class="main__tile main__tile--b" :src="tileImage('t', 5)" mode="aspectFit" />
          <image class="main__tile main__tile--c" :src="tileImage('z', 1)" mode="aspectFit" />
        </view>
        <view class="main__ops">
          <view class="main__btn" @click="quickStart">
            <image class="main__btn-bg" :src="btnCreate" mode="aspectFit" />
          </view>
          <view class="main__btn" @click="openJoin">
            <image class="main__btn-bg" :src="btnJoin" mode="aspectFit" />
          </view>
        </view>
        <text class="main__tip">开口才能胡 · 留皮子不能胡 · 封顶 6 番</text>
      </view>

      <view class="more">
        <view
          class="more__card"
          :class="item.open ? '' : 'more__card--lock'"
          v-for="item in moreGames"
          :key="item.key"
          @click="enterGame(item)">
          <view class="more__tiles">
            <image class="more__tile more__tile--a" :src="tileImage(item.tiles[0], item.tiles[1])" mode="aspectFit" />
            <image class="more__tile more__tile--b" :src="tileImage(item.tiles[2], item.tiles[3])" mode="aspectFit" />
          </view>
          <view class="more__meta">
            <text class="more__name">{{ item.name }}</text>
            <text class="more__desc">{{ item.desc }}</text>
          </view>
          <text class="more__badge" v-if="item.badge">{{ item.badge }}</text>
          <view class="more__lock" v-if="!item.open">
            <text class="more__lockText">即将上线</text>
          </view>
        </view>
      </view>

      <view class="dock">
        <view class="dock__item" @click="openSheet('feedback')">
          <image class="dock__ico" :src="icon('task')" mode="aspectFit" />
          <text class="dock__text">反馈</text>
        </view>
        <view class="dock__item" @click="openSheet('welfare')">
          <image class="dock__ico" :src="icon('gift')" mode="aspectFit" />
          <text class="dock__text">福利</text>
        </view>
        <view class="dock__item" @click="openSheet('exchange')">
          <image class="dock__ico" :src="icon('redpack')" mode="aspectFit" />
          <text class="dock__text">兑换</text>
        </view>
        <view class="dock__item" @click="openSheet('bag')">
          <image class="dock__ico" :src="icon('bag')" mode="aspectFit" />
          <text class="dock__text">背包</text>
        </view>
        <view class="dock__item dock__item--on" @click="openSheet('shop')">
          <image class="dock__ico" :src="icon('shopcart')" mode="aspectFit" />
          <text class="dock__text">商城</text>
        </view>
      </view>

      <view class="sheet" v-if="sheet === 'shop'">
        <view class="sheet__panel">
          <text class="sheet__title">商城</text>
          <view class="sheet__close" @click="closeSheet">×</view>
          <view class="sheet__body">
            <view class="tabs">
              <view
                class="tabs__item"
                :class="shopTab === index ? '' : 'tabs__item--off'"
                v-for="(tab, index) in shopTabs"
                :key="tab.key"
                @click="shopTab = index">
                <image class="tabs__ico" :src="icon(tab.icon)" mode="aspectFit" />
                <text class="tabs__text">{{ tab.name }}</text>
              </view>
            </view>
            <view class="packs">
              <view class="pack" v-for="pack in currentPacks" :key="pack.name" @click="buy(pack)">
                <text class="pack__tag">{{ pack.tag }}</text>
                <text class="pack__name">{{ pack.name }}</text>
                <image class="pack__coin" :src="coinPileImage" mode="aspectFit" />
                <view class="pack__price">
                  <image class="pack__gem" :src="gemImage" mode="aspectFit" />
                  <text class="pack__num">{{ pack.price }}</text>
                </view>
              </view>
            </view>
          </view>
        </view>
      </view>

      <view class="dlg" v-if="sheet === 'privacy'">
        <view class="privacy">
          <view class="privacy__head">
            <text class="privacy__title">个人信息保护指引</text>
          </view>
          <view class="privacy__body">
            <text class="privacy__text">欢迎使用本产品！我们将根据《用户协议》和《隐私权政策》以及《儿童隐私保护声明》，来帮您了解我们在收集、使用、存储和共享您个人信息的情况以及您享有的相关权利。根据《常见类型移动互联网应用程序必要个人信息范围规定》，本 App 属于“网络游戏类”，主要功能为“网络游戏产品和服务”，必要个人信息为：“注册用户移动电话号码”。请您在使用我们的服务前仔细阅读《用户协议》及《隐私政策》。</text>
            <text class="privacy__link">您可通过阅读完整的<text class="privacy__em">《服务协议》</text>和<text class="privacy__em">《隐私政策》</text>来了解详细信息</text>
            <view class="privacy__ops">
              <view class="privacy__btn privacy__btn--no" @click="rejectPrivacy"><text>拒绝</text></view>
              <view class="privacy__btn privacy__btn--yes" @click="acceptPrivacy"><text>同意</text></view>
            </view>
          </view>
        </view>
      </view>

      <view class="dlg" v-if="sheet === 'notice'">
        <view class="dlg__panel">
          <view class="dlg__head">
            <text class="dlg__title">防作弊 / 禁止赌博声明</text>
            <view class="dlg__close" @click="closeSheet">×</view>
          </view>
          <view class="dlg__body">
            <text class="dlg__p">亲爱的玩家：</text>
            <text class="dlg__p">武汉赖子麻将一直致力于打造一个公平、公正、绿色健康的游戏环境。为保证玩家利益，运营团队全面打击非正常游戏行为。</text>
            <text class="dlg__p">一、非正常游戏行为包括但不限于：利用游戏漏洞谋取利益、破坏公平秩序；在游戏内直接或变相非法倒卖金币；传播淫秽色情、赌博、暴力或教唆犯罪信息。</text>
            <text class="dlg__p">二、本游戏仅供娱乐休闲使用，不得利用本游戏从事赌博及其他违法违规行为。</text>
            <text class="dlg__sign">武汉赖子麻将运营团队</text>
          </view>
          <view class="dlg__btn" @click="closeSheet">我知道了</view>
        </view>
      </view>

      <view class="dlg" v-if="sheet === 'age'">
        <view class="dlg__panel">
          <view class="dlg__head">
            <text class="dlg__title">《防止未成年人沉迷网络游戏公告》</text>
            <view class="dlg__close" @click="closeSheet">×</view>
          </view>
          <view class="dlg__age">
            <text class="dlg__age-num">16+</text>
            <text class="dlg__age-tip">适龄提示</text>
          </view>
          <view class="dlg__body">
            <text class="dlg__p">根据国家新闻出版署《关于进一步严格管理切实防止未成年人沉迷网络游戏的通知》，本游戏仅面向年满 16 周岁的用户提供，并严格落实实名认证与时段时长限制。</text>
            <text class="dlg__p">未完成实名认证的账号将无法进入游戏。请合理安排游戏时间，享受健康生活。</text>
          </view>
          <view class="dlg__btn" @click="closeSheet">实名登录</view>
        </view>
      </view>

      <view class="dlg" v-if="sheet === 'join'">
        <view class="join">
          <text class="join__title">输入房号</text>
          <input class="join__input" v-model="joinRoomId" type="number" placeholder="请输入 6 位房号" />
          <view class="join__ops">
            <view class="join__btn join__btn--no" @click="closeSheet"><text>取消</text></view>
            <view class="join__btn join__btn--yes" @click="joinRoom"><text>进入房间</text></view>
          </view>
        </view>
      </view>

      <view class="toast" v-if="toastText">{{ toastText }}</view>
    </view>
  </view>
</template>

<script>
/**
 * 组件名称：whmjLobby
 * 功能说明：武汉赖子麻将大厅，横屏 1334×750 设计网格，承载玩家信息、玩法入口、建桌与入房、底部导航与商城面板
 * 研发时间：2026/11/06
 * 研发人员：郑朝军
 * 变量说明：profile 玩家资料；games 玩法入口；sheet 当前弹层；shopTab 商城页签；joinRoomId 入房房号
 * 事件说明：quickStart 建桌开局；joinRoom 按房号入房；enterGame 进入玩法；openSheet 打开弹层；buy 模拟购买
 * 插槽说明：无
 * 修改时间       人员        说明
 * 2026/11/06     郑朝军      初始创建
 * 2026/11/07     郑朝军      改用原版 UI 素材重做大厅，拆分建桌与入房
 */
import { ASSET_BASE } from '@/utils/whmj/const.js'
import { login, register, fetchProfile, fetchRecords } from '@/utils/whmj/api.js'
import { clearAuth, getToken, getUser, setUser } from '@/utils/whmj/http.js'
import socket from '@/utils/whmj/socket.js'
import audio from '@/utils/whmj/audio.js'

/** 生成目录，与 tools/gen_whmj_art.py 的输出保持一致 */
const GEN = `${ASSET_BASE}/gen`

/** 参考素材目录，取自开源项目的 UI 资源 */
const XL = `${ASSET_BASE}/xl`

/** 隐私指引确认标记，确认过就不再弹 */
const PRIVACY_KEY = 'whmj_privacy_ok'

export default
{
  data()
  {
    return {
      profile: { uid: 0, nick: '游客', gold: 0, diamond: 0 },
      games: [
        { key: 'whmj', name: '武汉麻将', desc: '红中赖子杠', badge: '热门', open: true, tiles: ['w', 9, 'z', 1] },
        { key: 'scmj', name: '四川麻将', desc: '血战到底', badge: '新', open: false, tiles: ['b', 3, 'b', 8] },
        { key: 'tlj', name: '拖拉机', desc: '八十分双扣', badge: '', open: false, tiles: ['w', 7, 'w', 8] },
        { key: 'ddz1', name: '斗地主', desc: '经典三人局', badge: '', open: false, tiles: ['t', 2, 't', 9] },
        { key: 'kwx', name: '卡五星', desc: '湖北快节奏', badge: '热门', open: false, tiles: ['b', 1, 'w', 5] },
        { key: 'hh', name: '晃晃', desc: '轻松休闲', badge: '', open: false, tiles: ['t', 1, 't', 9] },
        { key: 'pdk', name: '跑得快', desc: '16 张快打', badge: '', open: false, tiles: ['w', 3, 'w', 6] }
      ],
      shopTabs: [
        { key: 'gold', name: '金币', icon: 'shopcart' },
        { key: 'gem', name: '钻石', icon: 'chest' },
        { key: 'item', name: '道具', icon: 'gift' }
      ],
      goldPacks: [
        { name: '8万金币', tag: '送2万金币', price: 8 },
        { name: '36万金币', tag: '送10万金币', price: 30 },
        { name: '108万金币', tag: '送30万金币', price: 88 },
        { name: '208万金币', tag: '送60万金币', price: 168 },
        { name: '338万金币', tag: '送100万金币', price: 268 },
        { name: '500万金币', tag: '送150万金币', price: 388 }
      ],
      gemPacks: [
        { name: '60钻石', tag: '首充双倍', price: 6 },
        { name: '300钻石', tag: '热销', price: 30 },
        { name: '680钻石', tag: '超值', price: 68 },
        { name: '1280钻石', tag: '豪华', price: 128 }
      ],
      itemPacks: [
        { name: '记牌器x10', tag: '实用', price: 20 },
        { name: '鲜花x99', tag: '人气', price: 30 },
        { name: '表情包', tag: '限定', price: 50 }
      ],
      sheet: '',
      shopTab: 0,
      records: [],
      joinRoomId: '',
      toastText: '',
      busy: false,
      uiScale: 1,
      uiLeft: 0,
      uiTop: 0
    }
  },

  computed:
  {
    /** 舞台缩放样式 */
    rootStyle()
    {
      return `transform:scale(${this.uiScale});left:${this.uiLeft}px;top:${this.uiTop}px`
    },

    /** 大厅背景 */
    bgImage()
    {
      return `${XL}/hall/bg.png`
    },

    /** 公告条底板 */
    noticeBar()
    {
      return `${XL}/hall/gonggao.png`
    },

    /** 公告滚动文案 */
    noticeText()
    {
      return '红中赖子杠 · 二五八做将 · 开口才能胡'
    },

    /** 左侧立绘 */
    heroLeft()
    {
      return `${XL}/hall/left.png`
    },

    /** 建桌按钮 */
    btnCreate()
    {
      return `${XL}/hall/btn_create.png`
    },

    /** 入房按钮 */
    btnJoin()
    {
      return `${XL}/hall/btn_join.png`
    },

    /** 商城帘头 */
    shopHead()
    {
      return `${GEN}/ui/shop_head.png`
    },

    /** 金币图标 */
    coinImage()
    {
      return `${GEN}/ui/coin.png`
    },

    /** 金币堆图标，商城礼包专用 */
    coinPileImage()
    {
      return `${GEN}/ui/coin_pile.png`
    },

    /** 钻石图标 */
    gemImage()
    {
      return `${GEN}/ui/gem.png`
    },

    /** 头像，缺省用默认头像兜底 */
    avatar()
    {
      return this.profile.avatar || `${XL}/hall/head.png`
    },

    /** 金币展示，超过一万折算为万 */
    goldText()
    {
      const value = Number(this.profile.gold) || 0

      if (value >= 10000)
      {
        return `${(value / 10000).toFixed(1)}万`
      }

      return String(value)
    },

    /** 除武汉麻将外的其余玩法 */
    moreGames()
    {
      return this.games.slice(1)
    },

    /** 当前页签的商品 */
    currentPacks()
    {
      if (this.shopTab === 1)
      {
        return this.gemPacks
      }

      if (this.shopTab === 2)
      {
        return this.itemPacks
      }

      return this.goldPacks
    }
  },

  onLoad()
  {
    this.bootstrap()

    if (!uni.getStorageSync(PRIVACY_KEY))
    {
      this.sheet = 'privacy'
    }
  },

  onReady()
  {
    this.computeScale()

    this.onResize = () => this.computeScale()
    window.addEventListener('resize', this.onResize)
    window.addEventListener('orientationchange', this.onResize)
  },

  onUnload()
  {
    if (this.onResize)
    {
      window.removeEventListener('resize', this.onResize)
      window.removeEventListener('orientationchange', this.onResize)
      this.onResize = null
    }

    if (this.toastTimer)
    {
      clearTimeout(this.toastTimer)
      this.toastTimer = null
    }
  },

  methods:
  {
    /**
     * 取静态图标路径
     * @param {String} name 图标名
     * @returns {String} 图标完整地址
     */
    icon(name)
    {
      return `${ASSET_BASE}/icon/${name}.svg`
    },

    /**
     * 取牌面图路径
     * @param {String} suit 花色键，w 万 / b 筒 / t 条 / z 红中
     * @param {Number} rank 点数，红中固定 1
     * @returns {String} 牌面地址
     */
    tileImage(suit, rank)
    {
      if (suit === 'z')
      {
        return `${XL}/tile/z1.png`
      }

      return `${XL}/tile/${suit}${rank}.png`
    },

    /** 按窗口尺寸缩放设计网格，竖屏时与根元素旋转后的容器宽高保持一致 */
    computeScale()
    {
      const vw = window.innerWidth
      const vh = window.innerHeight
      const rotated = vh > vw
      const cw = rotated ? vh : vw
      const ch = rotated ? vw : vh
      const scale = Math.min(cw / 1334, ch / 750)

      this.uiScale = Math.round(scale * 10000) / 10000
      this.uiLeft = Math.round((cw - 1334 * scale) / 2)
      this.uiTop = Math.round((ch - 750 * scale) / 2)
    },

    /** 首屏引导：无登录态先游客注册，再拉资料 */
    async bootstrap()
    {
      try
      {
        if (!getToken())
        {
          await this.guestLogin()
        }

        await this.loadProfile()
        await this.ensureSocket()
      }
      catch (err)
      {
        this.toast(err.message || '网络异常，请稍后重试')
      }
    },

    /** 游客自动注册并登录 */
    async guestLogin()
    {
      const name = `guest${Math.floor(Math.random() * 900000 + 100000)}`

      try
      {
        await register(name, '123456', `游客${name.slice(-4)}`)
      }
      catch (err)
      {
        await login(name, '123456')
      }
    },

    /** 拉取个人资料 */
    async loadProfile()
    {
      const data = (await fetchProfile()) || {}
      const cached = getUser() || {}

      this.profile = {
        uid: data.id || cached.uid || 0,
        nick: data.nick || cached.nick || '游客',
        avatar: data.avatar || cached.avatar || '',
        gold: Number(data.score || 0),
        diamond: Number(data.diamond || 0)
      }

      setUser({ ...cached, ...this.profile, token: getToken() })
    },

    /** 确保长连接可用 */
    async ensureSocket()
    {
      if (!socket.connected)
      {
        await socket.connect(getToken())
      }
    },

    /** 建一桌新房间，先进房间等待页，由房主决定加几个电脑再开局 */
    async quickStart()
    {
      if (this.busy)
      {
        return
      }

      audio.play('click')
      this.busy = true

      try
      {
        await this.ensureSocket()
        const res = await socket.request('whmj.lobby.createRoom', { base: 1 })

        socket.setRoom(res.roomId)
        uni.navigateTo({ url: `/pages/whmj/room?roomId=${res.roomId}` })
      }
      catch (err)
      {
        this.toast(err.message || '创建房间失败')
      }
      finally
      {
        this.busy = false
      }
    },

    /** 打开输入房号弹层 */
    openJoin()
    {
      audio.play('click')
      socket.setRoom('')
      this.sheet = 'join'
    },

    /** 按房号进入已有房间 */
    async joinRoom()
    {
      const roomId = String(this.joinRoomId || '').trim()

      if (!/^\d{4,8}$/.test(roomId))
      {
        this.toast('房号应为 4 到 8 位数字')
        return
      }

      if (this.busy)
      {
        return
      }

      audio.play('click')
      this.busy = true

      try
      {
        await this.ensureSocket()
        await socket.request('whmj.lobby.joinRoom', { roomId })

        socket.setRoom(roomId)
        this.sheet = ''
        uni.navigateTo({ url: `/pages/whmj/room?roomId=${roomId}` })
      }
      catch (err)
      {
        this.toast(err.message || '房间不存在或已开局')
      }
      finally
      {
        this.busy = false
      }
    },

    /**
     * 进入玩法
     * @param {Object} item 玩法项
     */
    async enterGame(item)
    {
      if (!item.open)
      {
        audio.play('click')
        this.toast(`${item.name}即将上线，敬请期待`)
        return
      }

      await this.quickStart()
    },

    /**
     * 打开弹层
     * @param {String} key 弹层标识
     */
    async openSheet(key)
    {
      audio.play('click')

      if (key === 'mail')
      {
        await this.loadRecords()
      }

      if (key === 'setting')
      {
        this.toast('音效已开启，可在牌桌内切换')
        return
      }

      if (key === 'feedback' || key === 'welfare' || key === 'exchange' || key === 'bag')
      {
        this.toast('功能开发中，敬请期待')
        return
      }

      this.sheet = key
    },

    /** 同意隐私指引，继续走实名提示 */
    acceptPrivacy()
    {
      audio.play('click')
      uni.setStorageSync(PRIVACY_KEY, 1)
      this.sheet = 'age'
    },

    /** 拒绝隐私指引：给出说明并停留，不进入游戏流程 */
    rejectPrivacy()
    {
      audio.play('click')
      this.toast('不同意将无法使用本产品，可稍后重新选择')
    },

    /** 关闭弹层 */
    closeSheet()
    {
      audio.play('click')
      this.sheet = ''
    },

    /** 拉取最近战绩并展示 */
    async loadRecords()
    {
      try
      {
        this.records = await fetchRecords()
      }
      catch (err)
      {
        this.records = []
      }

      if (!this.records.length)
      {
        this.toast('暂无新邮件，先去打一局吧')
        return
      }

      const last = this.records[0]
      this.toast(`最近战绩：${last.score >= 0 ? '+' : ''}${last.score} 分`)
    },

    /**
     * 模拟购买
     * @param {Object} pack 商品
     */
    buy(pack)
    {
      audio.play('click')
      this.toast(`已选择「${pack.name}」，支付通道暂未接入`)
    },

    /**
     * 展示提示
     * @param {String} text 文案
     */
    toast(text)
    {
      this.toastText = text

      if (this.toastTimer)
      {
        clearTimeout(this.toastTimer)
      }

      this.toastTimer = setTimeout(() =>
      {
        this.toastText = ''
      }, 1800)
    },

    /** 退出登录并回到登录页 */
    logout()
    {
      audio.play('click')
      clearAuth()
      socket.destroy()
      uni.reLaunch({ url: '/pages/whmj/login' })
    }
  }
}
</script>
