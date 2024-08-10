const fs = require('fs');
const path = require('path');
const { parseExcel, createExcel } = require('./excel')
const { crawlLocation } = require('./fetch')

const fileName = fs.readdirSync(path.join(__dirname, './input'))[0];
const inputPath = path.join(__dirname, './input', fileName);
const outputPath = path.join(__dirname, './output', fileName.replace('.xlsx', '_output.xlsx'));

async function start() {
    const inputData = await parseExcel(inputPath) // 解析Excel，直接加载到内存
    const originalLocations = await crawlLocation(inputData) // 原始数据
    const chineseLocations = originalLocations.map(data => data?.replace(/[^\u4E00-\u9FFF]+/g, ',')) //中文数据
    await createExcel(outputPath, originalLocations, chineseLocations) // 创建Excel
}

start()

