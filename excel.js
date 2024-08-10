const ExcelJS = require('exceljs');
const workbook = new ExcelJS.Workbook();

// 解析 Excel 文件
async function parseExcel(filePath) {
  // 读取 Excel 文件
  await workbook.xlsx.readFile(filePath);
  // 获取第一个工作表
  const worksheet = workbook.getWorksheet(1);
  // 准备存储对象数组
  const dataArray = [];
  // 获取标题行
  const headers = worksheet.getRow(1).values;
  // 遍历每一行
  worksheet.eachRow((row, rowNumber) => {
    // 跳过标题行
    if (rowNumber === 1) return;
    // 创建一个对象来存储每行的数据
    const rowObject = {};
    // 将每个单元格的值与标题行结合
    row.eachCell((cell, colNumber) => {
      const header = headers[colNumber];
      rowObject[header] = cell.value;
    });
    // 添加到数据数组
    dataArray.push(rowObject);   
  });
  return dataArray;
}

// 生成 Excel 文件，追加两列数据
async function createExcel(outputPath, originalLocations, chineseLocations) {
  // 获取第一个工作表
  const worksheet = workbook.worksheets[0];
  // 获取原始列数
  const originalColumnCount = worksheet.columnCount;
  // 获取最后一列的宽度
  const lastColumn = worksheet.getColumn(originalColumnCount);
  const lastColumnWidth = lastColumn.width
  // 添加两列到工作表末尾
  worksheet.columns = [
    ...worksheet.columns,
    { key: 'newColumn1', header: '原始结果数据', width: 90 },
    { key: 'newColumn2', header: '中文数据', width: 43 }
  ];;

  // 设置新增列的数据
  worksheet.eachRow((row, rowNumber) => {
    // 获取最后一列的单元格样式
    const lastCellStyle = row.getCell(originalColumnCount).style;

    // 如果是标题行，设置标题单元格的样式
    if (rowNumber === 1) {
      const headerCell1 = row.getCell(originalColumnCount + 1);
      const headerCell2 = row.getCell(originalColumnCount + 2);

      headerCell1.style = { ...lastCellStyle };
      headerCell2.style = { ...lastCellStyle };

      return;
    }

    // 在新增列中填充数据
    const cell1 = row.getCell(originalColumnCount + 1);
    const cell2 = row.getCell(originalColumnCount + 2);
    cell1.value = originalLocations[rowNumber - 2]; // 在第一个新增列中填充
    cell2.value = chineseLocations[rowNumber - 2]; // 在第二个新增列中填充
    // 复制最后一列的样式到新列
    cell1.style = { ...lastCellStyle };
    cell2.style = { ...lastCellStyle };
  });
  // 将更改后的工作簿保存到新的Excel文件
  await workbook.xlsx.writeFile(outputPath);
}

module.exports = {
  parseExcel,
  createExcel
}