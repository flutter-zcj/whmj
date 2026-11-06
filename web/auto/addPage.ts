const fs = require('fs')

const pagesStr = fs.readFileSync('./src/pages.json', 'utf-8');
const pagesJson = JSON.parse(pagesStr);

// tabBar页面
const tabBarPages = pagesJson.pages.map((i) => {
  return {
    type: 'tabBarPage',
    name: i.name,
    path: `/${i.path}`,
    title: i.style.navigationBarTitleText
  };
});
// 二级页面
let subPages = [];
if(pagesJson.subPackages)
{
  subPages = pagesJson.subPackages.flatMap((i) => {
    return i.pages.map((x) => {
      return {
        type: 'subPage',
        name: x.name,
        path: `/${i.root}/${x.path}`,
        title: x.style.navigationBarTitleText
      };
    });
  });
}

// 当前已有页面
const pages = [...tabBarPages, ...subPages];
// 当前已创建文件
const filesList = fs.readdirSync('./src/pages');
// 获取需要新增的页面  =>取差集
const newPages = pages.filter((i) => !filesList.includes(i.name));
// 添加新路由
function addPages(pages) 
{
  const currentDate = new Date();
  const year = currentDate.getFullYear();
  const month = currentDate.getMonth() + 1; // 月份是从 0 开始计数的，因此要加1
  const day = currentDate.getDate();
  
  for (const page of pages) 
  {
    const { name, title } = page;
    const dirPath = `./src/pages/${name}`;
    fs.mkdirSync(dirPath);
    const filePath = `${dirPath}/${name}.vue`;
    const createStream = fs.createWriteStream(filePath);

    const template = `<style lang='scss' scoped>
  // 1、定位：position, display, float, left, right, top, bottom, overflow, clear, z-index
  // 2、自身：width, height, padding, border, margin, background
  // 3、文字：font-family, font-size, font-style, font-weight, font-varient, color, letter-spacing, color, text-align
  // 4、文本：text-align, vertical-align, text-wrap, text-transform, text-indent, text-decoration, letter-spacing, word-spacing, white-space, text-overflow
  // 5、其他：content, box-shadow, border-radius, transform
  .flex{display: flex;flex-direction:column; height: 100%;}
</style>

<template>
  <view>${title}</view>
</template>

<script>
/* 插件-* */
 
/**
 * 修改记录:
 * ${year}-${month}-${day}  郑朝军        
 */
export default
{ 
  data()
  {
    return {      
    }
  },
  created()
  {
    
  },
  mounted()
  {
  },
  methods:
  { 
  }
}
</script>
`;
    createStream.write(template);
    createStream.end();
    console.log('\x1B[34m', `pages ${name} created successfully.`);
  }
  console.log('\x1B[32m%s\x1B[39m', '\n All files are created successfully.\n');
}

addPages(newPages);
