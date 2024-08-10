const ExcelJS = require('exceljs');
const path = require('path');

// 生成随机的纬度
function getRandomLatitude() {
  return (Math.random() * 180 - 90).toFixed(6);
}

// 生成随机的经度
function getRandomLongitude() {
  return (Math.random() * 360 - 180).toFixed(6);
}

async function generateExcel(filePath) {
  // 创建一个新的工作簿和工作表
  const workbook = new ExcelJS.Workbook();
  const worksheet = workbook.addWorksheet('Sheet1');

  // 添加标题行
  worksheet.columns = [
    { header: 'ID', key: 'id', width: 10 },
    { header: '纬度', key: 'latitude', width: 15 },
    { header: '经度', key: 'longitude', width: 15 }
  ];

  // 生成 3000 行数据
  for (let i = 1; i <= 300; i++) {
    worksheet.addRow({
      id: i,
      latitude: getRandomLatitude(),
      longitude: getRandomLongitude()
    });
  }

  // 保存到文件
  await workbook.xlsx.writeFile(filePath);
}

// 生成 Excel 文件
generateExcel(path.join(__dirname,'test.xlsx'));
