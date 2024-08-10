### Node位置信息爬虫，支持解析Excel文件、根据经纬度抓取位置信息、生成新的Excel文件
```shell
1. npm install  下载相关依赖
2. node index.js  启动爬虫
```
##### 配置代理
位置信息抓取网站：https://www.openstreetmap.org/ 需要配置代理才能访问
```javascript
// 设置SOCKS代理地址，注意开启局域网代理
const proxy = 'socks5://127.0.0.1:7890';
// 创建SOCKS代理对象
const agent = new SocksProxyAgent(proxy);
```
##### 限制10并发、延时1秒
```javascript
// 创建一个限制器，设置并发请求数
const limit = pLimit(10);
// 延迟函数，用于控制请求速度
const delay = ms => new Promise(resolve => setTimeout(resolve, ms));

// 处理所有位置的函数
async function processLocations(locations) {
    const batch = [];

    for (const location of locations) {
        // 包装fetch调用，并添加延迟
        const req =  limit(async () => {
            await delay(1000);
            try {
                const data = await fetchLocationData(location);
                console.log(`纬度: ${location["纬度"]}, 经度: ${location["经度"]}, 位置: ${data}`)
                return data;
            } catch (error) {
                console.error(`抓取数据出错 纬度: ${location["纬度"]}, 经度: ${location["经度"]} 错误:${error}`);
            }
        });

        batch.push(req);
    }

    return await Promise.all(batch);
}
```
