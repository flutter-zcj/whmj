/**
 * 记账系统图片资源
 * 图片来源 Unsplash，已按展示尺寸裁剪后内置到 static 目录，保证首屏不依赖外网
 */
import foodImage from '@/static/account/food.jpg'
import mealImage from '@/static/account/meal.jpg'
import coffeeImage from '@/static/account/coffee.jpg'
import snackImage from '@/static/account/snack.jpg'
import marketImage from '@/static/account/market.jpg'
import shoppingImage from '@/static/account/shopping.jpg'
import clothesImage from '@/static/account/clothes.jpg'
import transportImage from '@/static/account/transport.jpg'
import bikeImage from '@/static/account/bike.jpg'
import travelImage from '@/static/account/travel.jpg'
import homeImage from '@/static/account/home.jpg'
import rentImage from '@/static/account/rent.jpg'
import kitchenImage from '@/static/account/kitchen.jpg'
import funImage from '@/static/account/fun.jpg'
import medicalImage from '@/static/account/medical.jpg'
import studyImage from '@/static/account/study.jpg'
import giftImage from '@/static/account/gift.jpg'
import petImage from '@/static/account/pet.jpg'
import sportImage from '@/static/account/sport.jpg'
import moneyImage from '@/static/account/money.jpg'
import payImage from '@/static/account/pay.jpg'
import salaryImage from '@/static/account/salary.jpg'
import investImage from '@/static/account/invest.jpg'
import workImage from '@/static/account/work.jpg'
import natureImage from '@/static/account/nature.jpg'
import seaImage from '@/static/account/sea.jpg'
import fieldImage from '@/static/account/field.jpg'
import avatarImage from '@/static/account/avatar.jpg'
import heroImage from '@/static/account/hero.jpg'

const PHOTO_FILES = {
  food: foodImage,
  meal: mealImage,
  coffee: coffeeImage,
  snack: snackImage,
  market: marketImage,
  shopping: shoppingImage,
  clothes: clothesImage,
  transport: transportImage,
  bike: bikeImage,
  travel: travelImage,
  home: homeImage,
  rent: rentImage,
  kitchen: kitchenImage,
  fun: funImage,
  medical: medicalImage,
  study: studyImage,
  gift: giftImage,
  pet: petImage,
  sport: sportImage,
  money: moneyImage,
  pay: payImage,
  salary: salaryImage,
  invest: investImage,
  work: workImage,
  nature: natureImage,
  sea: seaImage,
  field: fieldImage
}

const NAME_RULES = [
  { keys: ['餐', '饭', '吃', '美食', '外卖', '食堂'], photo: 'food' },
  { keys: ['零食', '蛋糕', '甜品', '面包'], photo: 'snack' },
  { keys: ['咖啡', '奶茶', '饮料', '酒吧'], photo: 'coffee' },
  { keys: ['买菜', '超市', '生鲜', '水果'], photo: 'market' },
  { keys: ['购物', '网购', '数码', '家电'], photo: 'shopping' },
  { keys: ['衣服', '服装', '鞋', '化妆', '美容'], photo: 'clothes' },
  { keys: ['交通', '打车', '地铁', '公交', '油', '停车'], photo: 'transport' },
  { keys: ['骑行', '单车', '摩托'], photo: 'bike' },
  { keys: ['旅行', '旅游', '机票', '酒店'], photo: 'sea' },
  { keys: ['居住', '房租', '物业', '水电', '燃气'], photo: 'home' },
  { keys: ['房贷', '装修', '家具'], photo: 'rent' },
  { keys: ['日用', '清洁', '家居'], photo: 'kitchen' },
  { keys: ['娱乐', '游戏', '电影', '唱歌', 'KTV'], photo: 'fun' },
  { keys: ['医疗', '药', '看病', '体检', '保险'], photo: 'medical' },
  { keys: ['学习', '书', '培训', '教育', '考试'], photo: 'study' },
  { keys: ['人情', '礼物', '送礼', '红包', '请客'], photo: 'gift' },
  { keys: ['宠物', '猫', '狗'], photo: 'pet' },
  { keys: ['运动', '健身', '游泳', '球'], photo: 'sport' },
  { keys: ['通讯', '话费', '流量', '宽带'], photo: 'pay' },
  { keys: ['工资', '薪水', '薪资'], photo: 'salary' },
  { keys: ['奖金', '年终', '分红'], photo: 'money' },
  { keys: ['理财', '基金', '股票', '利息', '收益'], photo: 'invest' },
  { keys: ['兼职', '外快', '副业', '报销'], photo: 'work' },
  { keys: ['退款', '转账', '还款'], photo: 'pay' }
]

/**
 * 按分类名取图片地址
 * @param {String} categoryName 分类名称
 * @returns {String} 图片地址
 */
export function categoryPhoto(categoryName)
{
  const name = String(categoryName || '')
  const matched = NAME_RULES.find((rule) => rule.keys.some((key) => name.includes(key)))

  return PHOTO_FILES[matched ? matched.photo : 'money']
}

/**
 * 按固定键取图片地址
 * @param {String} key 图片键
 * @returns {String} 图片地址
 */
export function photoByKey(key)
{
  return PHOTO_FILES[key] || PHOTO_FILES.money
}

/**
 * 首页头部背景图
 * @returns {String} 图片地址
 */
export function heroPhoto()
{
  return heroImage
}

/**
 * 用户头像
 * @returns {String} 图片地址
 */
export function avatarPhoto()
{
  return avatarImage
}

/**
 * 账本封面，按索引轮换
 * @param {Number} index 账本序号
 * @returns {String} 图片地址
 */
export function ledgerCover(index = 0)
{
  const keys = ['nature', 'field', 'sea', 'meal', 'fun']

  return photoByKey(keys[index % keys.length])
}

/**
 * 空状态插图
 * @returns {String} 图片地址
 */
export function emptyPhoto()
{
  return PHOTO_FILES.nature
}
