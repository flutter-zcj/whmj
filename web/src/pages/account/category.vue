<style lang="scss" scoped>
.page { box-sizing: border-box; min-height: 100vh; padding: 24rpx; background: #f5f6f8; }
.tabs { display: flex; padding: 6rpx; background: #fff; border-radius: 999rpx; margin-bottom: 20rpx; }
.tab { flex: 1; padding: 14rpx 0; font-size: 26rpx; color: #6b6f78; text-align: center; border-radius: 999rpx; }
.tab.active { background: #1aa86c; font-weight: 600; color: #fff; }
.grid { display: flex; flex-wrap: wrap; padding: 20rpx 0; background: #fff; border-radius: 20rpx; }
.cell { display: flex; flex-direction: column; align-items: center; gap: 10rpx; width: 25%; padding: 16rpx 0; }
.cell-icon { display: flex; align-items: center; justify-content: center; width: 88rpx; height: 88rpx; border-radius: 50%; }
.cell-icon.add { background: #f3f4f6; }
.cell-photo { width: 88rpx; height: 88rpx; background: #f3f4f6; border-radius: 50%; }
.cell-name { font-size: 21rpx; color: #5c626b; }
.tip { padding: 24rpx 8rpx; font-size: 21rpx; line-height: 1.7; color: #a2a7af; }
.sheet-mask { position: fixed; display: flex; left: 0; right: 0; top: 0; bottom: 0; z-index: 999; align-items: flex-end; background: rgba(0, 0, 0, 0.35); }
.sheet-panel { box-sizing: border-box; width: 100%; max-height: 80vh; padding: 24rpx 28rpx calc(28rpx + env(safe-area-inset-bottom)); background: #fff; border-radius: 24rpx 24rpx 0 0; overflow-y: auto; }
.sheet-panel-head { display: flex; align-items: center; justify-content: space-between; margin-bottom: 12rpx; }
.sheet-panel-title { font-size: 30rpx; font-weight: 600; color: #23262b; }
.sheet-panel-close { padding: 8rpx; font-size: 28rpx; color: #a8adb5; }
.field { display: flex; align-items: center; gap: 16rpx; padding: 20rpx 0; border-bottom: 1rpx solid #f5f6f8; }
.field-label { width: 110rpx; font-size: 26rpx; color: #5c626b; }
.field-input { flex: 1; font-size: 27rpx; color: #23262b; }
.color-list { display: flex; flex: 1; flex-wrap: wrap; gap: 14rpx; }
.color { width: 48rpx; height: 48rpx; border: 3rpx solid transparent; border-radius: 50%; }
.color.active { border-color: #23262b; }
.sheet-panel-actions { display: flex; gap: 16rpx; margin-top: 24rpx; }
.btn-primary { flex: 2; height: 88rpx; border: none; background: #1aa86c; font-size: 28rpx; line-height: 88rpx; color: #fff; border-radius: 999rpx; }
.btn-ghost { flex: 1; height: 88rpx; border: none; background: #f3f4f6; font-size: 28rpx; line-height: 88rpx; color: #d9534f; border-radius: 999rpx; }
.btn-primary::after, .btn-ghost::after { border: none; }
</style>
<template>
  <view class="page">
    <view class="tabs">
      <text
        v-for="item in typeOptions"
        :key="item.value"
        class="tab"
        :class="{ active: categoryType === item.value }"
        @click="switchType(item.value)"
      >{{ item.label }}</text>
    </view>

    <view class="grid">
      <view
        v-for="item in categories"
        :key="item.categoryId"
        class="cell"
        @click="openEditor(item)"
        @longpress="onLongPress(item)"
      >
        <image class="cell-photo" :src="categoryImage(item)" mode="aspectFill" />
        <text class="cell-name">{{ item.categoryName }}</text>
      </view>
      <view class="cell" @click="openEditor(null)">
        <view class="cell-icon add"><acc-icon name="plus" :size="40" color="#9CA3AF" /></view>
        <text class="cell-name">新增</text>
      </view>
    </view>

    <view class="tip">点击编辑，长按删除。删除分类不会删除账单，相关账单会转为「未分类」。</view>

    <!-- 编辑弹层 -->
    <view v-if="editor" class="sheet-mask" @click="closeEditor">
      <view class="sheet-panel" @click.stop>
        <view class="sheet-panel-head">
          <text class="sheet-panel-title">{{ form.categoryId ? '编辑分类' : '新增分类' }}</text>
          <view class="sheet-panel-close" @click="closeEditor"><acc-icon name="close" :size="28" color="#A8ADB5" /></view>
        </view>

        <view class="field">
          <text class="field-label">名称</text>
          <input v-model="form.categoryName" class="field-input" placeholder="如：餐饮、打车" maxlength="8" />
        </view>


        <view class="field">
          <text class="field-label">颜色</text>
          <view class="color-list">
            <view
              v-for="item in colors"
              :key="item"
              class="color"
              :class="{ active: form.color === item }"
              :style="{ backgroundColor: item }"
              @click="form.color = item"
            />
          </view>
        </view>

        <view class="sheet-panel-actions">
          <button v-if="form.categoryId" class="btn-ghost" @click="removeCategory(form.categoryId)">删除</button>
          <button class="btn-primary" :loading="saving" @click="submit">保存</button>
        </view>
      </view>
    </view>
  </view>
</template>
<script setup>
import { ref } from 'vue'
import { onLoad, onShow } from '@dcloudio/uni-app'
import { categoryPhoto } from '@/utils/account/photos.js'
import { getCategoryList, addCategory, updateCategory, deleteCategory } from '@/utils/account/api.js'

const typeOptions = [
  { label: '支出分类', value: '0' },
  { label: '收入分类', value: '1' }
]

const colors = ['#FF7043', '#42A5F5', '#AB47BC', '#8D6E63', '#FFA726', '#EF5350', '#26A69A', '#EC407A', '#5C6BC0', '#90A4AE']

const categoryType = ref('0')
const categories = ref([])
const editor = ref(false)
const saving = ref(false)
const form = ref(emptyForm())

function emptyForm()
{
  return {
    categoryId: null,
    categoryName: '',
    icon: '📦',
    color: '#1AA86C'
  }
}

function hexToRgba(hex, alpha)
{
  const value = (hex || '#1AA86C').replace('#', '')
  const full = value.length === 3 ? value.split('').map((c) => c + c).join('') : value

  return `rgba(${parseInt(full.slice(0, 2), 16)}, ${parseInt(full.slice(2, 4), 16)}, ${parseInt(full.slice(4, 6), 16)}, ${alpha})`
}

async function load()
{
  try
  {
    const res = await getCategoryList(categoryType.value)
    categories.value = res.data || []
  }
  catch (e)
  {
    categories.value = []
  }
}

function switchType(value)
{
  categoryType.value = value
  load()
}

function openEditor(item)
{
  form.value = item
    ? { categoryId: item.categoryId, categoryName: item.categoryName, icon: item.icon || '📦', color: item.color || '#1AA86C' }
    : emptyForm()
  editor.value = true
}

function closeEditor()
{
  editor.value = false
}

async function submit()
{
  if (!form.value.categoryName.trim())
  {
    uni.showToast({ title: '请输入分类名称', icon: 'none' })
    return
  }
  const payload = {
    categoryName: form.value.categoryName.trim(),
    categoryType: categoryType.value,
    icon: form.value.icon,
    color: form.value.color
  }
  if (form.value.categoryId)
  {
    payload.categoryId = form.value.categoryId
  }
  saving.value = true
  try
  {
    if (payload.categoryId)
    {
      await updateCategory(payload)
    }
    else
    {
      await addCategory(payload)
    }
    uni.showToast({ title: '已保存', icon: 'success' })
    closeEditor()
    load()
  }
  catch (e)
  {
    // 错误提示已在请求层处理
  }
  finally
  {
    saving.value = false
  }
}

function onLongPress(item)
{
  uni.showModal(
  {
    title: '删除分类',
    content: `确定删除「${item.categoryName}」？该分类下的账单会转为未分类。`,
    success: (res) =>
    {
      if (res.confirm)
      {
        removeCategory(item.categoryId)
      }
    }
  })
}

async function removeCategory(categoryId)
{
  try
  {
    const res = await deleteCategory(categoryId)
    uni.showToast({ title: res.msg || '已删除', icon: 'none' })
    closeEditor()
    load()
  }
  catch (e)
  {
    // 错误提示已在请求层处理
  }
}

onLoad((options) =>
{
  if (options && options.type)
  {
    categoryType.value = options.type
  }
})

/**
 * 取分类图片地址
 * @param {Object} item 分类
 * @returns {String} 图片地址
 */
function categoryImage(item)
{
  return categoryPhoto(item.categoryName)
}

onShow(() =>
{
  load()
})
</script>
