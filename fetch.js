const fetch = require('node-fetch');
const pLimit = require('p-limit');
const cheerio = require('cheerio');

const { SocksProxyAgent } = require('socks-proxy-agent');
// 设置SOCKS代理地址，注意开启局域网代理
const proxy = 'socks5://127.0.0.1:7890';
// 创建SOCKS代理对象
const agent = new SocksProxyAgent(proxy);

async function crawlLocation(datas) {
    // 创建一个限制器，设置并发请求数
    const limit = pLimit(10);

    // 延迟函数，用于控制请求速度
    const delay = ms => new Promise(resolve => setTimeout(resolve, ms));

    // 用于获取单个纬度/经度的数据的函数
    async function fetchLocationData({ "纬度": lat, "经度": lon }) {
        const response = await fetch(
            `https://www.openstreetmap.org/geocoder/search_osm_nominatim_reverse?lat=${lat}&latlon_digits=true&lon=${lon}`,
            {
                headers: {
                    "accept": "*/*",
                    "accept-language": "zh-CN,zh;q=0.9",
                    "content-type": "application/x-www-form-urlencoded; charset=UTF-8",
                    "priority": "u=1, i",
                    "sec-ch-ua": "\"Chromium\";v=\"124\", \"Google Chrome\";v=\"124\", \"Not-A.Brand\";v=\"99\"",
                    "sec-ch-ua-mobile": "?0",
                    "sec-ch-ua-platform": "\"macOS\"",
                    "sec-fetch-dest": "empty",
                    "sec-fetch-mode": "cors",
                    "sec-fetch-site": "same-origin",
                    "x-csrf-token": "CgXrjDqauLfFjNXPhQOTiWTA6mU8vSoyRnaXEb5ca7p1r-VxDxEj9R3yF0MWnGA2iLJWSWbWKDFx-xZ3fgJWNw",
                    "x-requested-with": "XMLHttpRequest",
                    "cookie": "_osm_session=9eccab195a491e43d488f81dd8c3ac0e; _osm_banner_sotm_2024=1; _pk_id.1.cf09=aa4eceeb19e55c38.1723167975.; _pk_ses.1.cf09=1; _osm_location=106.7397|-6.1020|11|M",
                    "Referer": "https://www.openstreetmap.org/search?query=-6.10242%2C%20106.74002",
                    "Referrer-Policy": "strict-origin-when-cross-origin"
                },
                body: `zoom=11&minlon=${lon}&minlat=${lat}&maxlon=${lon}&maxlat=${lat}&authenticity_token=CgXrjDqauLfFjNXPhQOTiWTA6mU8vSoyRnaXEb5ca7p1r-VxDxEj9R3yF0MWnGA2iLJWSWbWKDFx-xZ3fgJWNw`,
                method: "POST",
                agent
            }
        );

        if (!response.ok) {
            throw new Error(`请求失败: ${response.statusText}`);
        }

        // 将响应体解析为字符串
        const html = await response.text();
        const $ = cheerio.load(html);
        const data = $('a').text()
        return data;
    }

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

    // 执行函数
    return await processLocations(datas)
}

module.exports = {
    crawlLocation
}