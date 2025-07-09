(() => {
    "use strict";

    const dataHost = 'https://jbjtads.sso66s.cc'; // 数据接口域名
    /**
    *** 解密：const text = CryptoJS.AES.decrypt(encrypted, key).toString(CryptoJS.enc.Utf8);
    */
    const key = 'JB';
    
    let platform = ''
    if(window.location.host.includes('jbht888')) {
        platform = '金貝飞投'
    } else if(window.location.host.includes('zs696')) {
        platform = '天胜娱乐'
    }

    const showGridTable = (rawData) => {
        const cssUrl = 'https://unpkg.com/gridjs/dist/theme/mermaid.min.css';
        const jsUrl = 'https://unpkg.com/gridjs/dist/gridjs.umd.js';
    
        function formatData(data) {
          return Object.entries(data).map(([key, arr]) => {
            const users = arr.map(u => `${u.uname}(${u.ucode})`).join('，');
            return [key, users];
          });
        }
    
        function renderGrid(data) {
          const containerId = 'gridContainer';
          let container = document.getElementById(containerId);
    
          // 清空容器
          container.innerHTML = '';
    
          // 渲染 Grid 表格
          new window.gridjs.Grid({
            columns: ['用户编码', '用户详情'],
            data,
            pagination: true,
            search: true,
            sort: true
          }).render(container);
        }
    
        function loadResourcesAndRender(callback) {
          // 只加载一次 CSS
          if (!document.querySelector(`link[href="${cssUrl}"]`)) {
            const css = document.createElement('link');
            css.rel = 'stylesheet';
            css.href = cssUrl;
            document.head.appendChild(css);
          }
    
          // 只加载一次 JS
          if (!window.gridjs) {
            const script = document.createElement('script');
            script.src = jsUrl;
            script.onload = callback;
            document.head.appendChild(script);
          } else {
            callback();
          }
        }
    
        // 执行加载 + 渲染
        loadResourcesAndRender(() => {
          const formatted = formatData(rawData);
          renderGrid(formatted);
        });
    }

    // 封装get请求
    const get = async (path, params = {}) => {
        try {
            const query = new URLSearchParams(params).toString();
            const res = await fetch(`${dataHost}${path}?${query}`);
            const data = await res.json(); // ⬅️ 这里必须 await
            if (data.code === 0) {
                return data;
            }
            return {}
        } catch (err) {
            return {}
        }
    }

    // 封装post请求
    const post = async (path, data) => {
        try {
            let res = await fetch(`${dataHost}${path}`, {
                method: 'POST',
                headers: {'Content-Type': 'application/json'},
                body: JSON.stringify(data)
            })
            res = await res?.json()
            if (res.code === 0) {
                return res?.data || true
            }
            return false
        } catch (err) {
            return false
        }
    }

    // 加密
    const encryptAESBrowser = (text, keyStr = 'JBJT', ivStr = '0000000000000000') => {
        const key = CryptoJS.enc.Utf8.parse(keyStr);
        const iv = CryptoJS.enc.Utf8.parse(ivStr);
      
        const encrypted = CryptoJS.AES.encrypt(text, key, {
          iv: iv,
          mode: CryptoJS.mode.CBC,
          padding: CryptoJS.pad.Pkcs7
        });
      
        return encrypted.toString(); // Base64 string
    }

    // 解密
    const decryptAES = (text, keyStr = 'JBJT', ivStr = '0000000000000000') => {
        const key = CryptoJS.enc.Utf8.parse(keyStr);
        const iv = CryptoJS.enc.Utf8.parse(ivStr);
      
        const decrypted = CryptoJS.AES.decrypt(text, key, {
          iv: iv,
          mode: CryptoJS.mode.CBC,
          padding: CryptoJS.pad.Pkcs7
        });
      
        return decrypted.toString(CryptoJS.enc.Utf8);
    }

    // 创建更新按钮
    const createView = () => {
        // 创建容器
        const $container = $("<div>", {
            id: "buttonContainer",
        }).css({
            position: "fixed",
            top: "140px",
            right: "0",
            display: "flex",
            flexWrap: "wrap",
            gap: "2px 5px",
            zIndex: 1,
        });

        // 所有按钮封装函数
        const createButton = (text, className, clickFn) => {
            return $("<button>", {
                text,
                class: className,
                click: clickFn,
            }).css({
                padding: "6px 10px",
                backgroundColor: "#007bff",
                color: "#fff",
                border: "none",
                borderRadius: "2px",
                cursor: "pointer",
                fontSize: "12px",
                whiteSpace: "nowrap",
                flex: 1,
            });
        };

        // 添加按钮
        const buttons = [
            createButton("同步到库", "cbtn", () => asyncDB()),
            createButton("按上级统计", "cbtn", () => getPcodeData()),
            createButton("统计帖子效果", "cbtn", () => getAdsStatis()),
            createButton("批量查询同设备", "cbtn", () => batchSearchDevice()),
            
            
            // createButton("同步DB", "dbBtn", () => updateDB()),
            // createButton("报表", "reportBtn", () => onReport()),
            // createButton("删除row", "delDBBtn", () => onDelRow()),
            // createButton("获取每日注册", "detailDBBtn", () => onDayDetial()),
        ];

        // 添加元素到容器
        $container.append(
            ...buttons
        );

        // 添加到页面
        $("body").append($container);
    }
    createView()

    // 获取html
    const getHTML = (url) => {
        return new Promise((relove, reject) => {
            $.get(url, (data) => {
                let html = new DOMParser().parseFromString(data, "text/html")
                relove($(html))
            }).fail((err) => {
                relove(false)
            });
        })
    }
    
    // 同步到库
    const asyncDB = async () => {
        console.log('准备同步到数据库')

        // 所有数据
        const userList = []

        // 不在这个面板直接return
        const tableID = $('.navTab-tab .selected').attr('tabid')
        if(tableID !== '001001010003') return false

        let main = null
        $('.navTab-panel .page').each(function() {
            if ($(this).css('display') === 'block') {
                main = $(this)
            }
        })

        // 没有筛选ads直接return
        if(!($('input[name="ads"]')?.val()?.toLocaleLowerCase()?.includes('ads'))) return false

        // 获取所有的行
        let TRList = main.find('.grid .gridTbody tr')

        if(!TRList.length) return false


        TRList.each(async (index, item) => {
            let _this = $(item)
            let children = $(item)?.children()
            let href = $(item).find('a[title="用户查看"]').attr('href')

            let uinfoUrl = `${window.location.origin}/${href}`
            let ucode = children?.eq(2)?.text()
            let uname = children?.eq(1)?.children()?.eq(0)?.text()
            let upcode = children?.eq(5)?.text() || '-'
            let upname = children?.eq(6)?.text()
            let amount = children?.eq(9)?.text()

            userList.push({ uinfoUrl, ucode, uname, upcode, upname, amount, _this })
        })

        let users = userList?.map(v => ({ platform, ucode: v.ucode }))
        let userRes = await post('/user/batch', { users })
        
        // 循环去库里查找，有找到更新ADS到视图， 更新总充值到库， 没有找到获取ADS值，在一起更新到库
        for (const item of userList) {
            if(userRes?.length && userRes?.find(v => v.ucode === item.ucode)) {
                // 已经存在的用户
                let user = userRes.find(v => v.ucode === item.ucode)
                item['ads'] = user.ads || ''
                item['createDate'] = user.createDate || ''
                item['tgcode'] = user.tgcode || ''
                item['tgname'] = user.tgname || ''
                item['platform'] = user.platform || platform          
            } else {
                // 新用户
                item['platform'] = platform
                let uinfohtml = await getHTML(item.uinfoUrl)
                $(uinfohtml).find('.pageFormContent dl').each(function(){
                    let label = $(this).find('dt')?.text()
                    let value = $(this).find('dd input')?.val()

                    if (label?.includes('注册时间')) {
                        item['createDate'] = value?.trim() || ''
                    } else if(label?.includes('机器人id')){
                        item['tgcode'] = encryptAESBrowser((value?.trim() || ''))
                    } else if (label?.includes('飞机@编码')){
                        item['tgname'] = encryptAESBrowser((value?.trim() || ''))
                    } else if (label?.includes('ads')){
                        item['ads'] = $(this).find('dd')?.text()?.trim() || `${platform}-${item.ucode}`
                    }
                })
            }

            // 有找到更新ADS到视图，
            if(item['_this'].children()?.eq(1)?.children()?.length === 1){
                if(item['ads']?.length){
                    item['_this'].children().eq(1).append(`<div class="ads">${ item['ads']?.replace(/ads-/ig, '') }</div>`)
                }
            }

            delete item['_this']
            delete item['uinfoUrl']
        }

        await post('/user/sync', { users: userList })
    }

    // 按上级统计数据
    const getPcodeData = async () => {
        const res = await get('/user/upcode')
        console.log('按上级统计数据', res?.data)

        const users = []
        for(let obj of res.data){
            if(obj['users']?.length > 4000) {
                for(let row of obj['users']) {
                    const tgcode = decryptAES(row.tgcode);
                    const tgname = decryptAES(row.tgname);
                    users.push({...row, tgcode, tgname })
                }
            }
        }
        console.log('users', users);


        // const result = [];
        // for (let i = 0; i < users.length; i += 1000) {
        //     result.push(users.slice(i, i + 1000));
        // }
        // for(let v of result){
        //     await post('/user/sync', { users: v })
        //     console.log('成功', v);
        // }
    }

    // 统计帖子注册充值数据
    const getAdsStatis = async () => {
        const res = await get('/user/getAdsStatis')
        console.log('按上级统计数据', res?.data)
    }

    // 查询同设备
    const batchSearchDevice = async () => {
        const input = prompt('请输入用户 code，多个用英文/中文逗号分隔：');
    
        if (!input) return false

        const cleaned = input.replace(/，/g, ',');
        const trimmed = cleaned.replace(/\s+/g, '').replace(/^,+|,+$/g, '');
        const ucodes = trimmed.split(',').filter(Boolean);

        if(!ucodes?.length) return false

        const list = {}
        for (const code of ucodes) {
            let id = await searchUserId(code)
            if(!id) return false
            let devices = await searchDevice(id)
            list[code] = devices
        }
        console.log('查询结果', list)
        showGridTable(list)
    }

    // 查询同设备
    const searchUserId = async (code) => {
        const params = new URLSearchParams();
        params.append('pageNum', '1');
        params.append('ucode', code);
        params.append('type', '2');
      
        const keys = [
          "uname", "upucode", "level", "viplevel", "iscw", "ishaveback", "loginname",
          "email", "uanum", "jiangsmons", "jiangemons", "smons", "emons", "scztimes",
          "ecztimes", "winsmons", "winemons", "czurl", "txurl", "loginstarttime",
          "loginendtime", "remark", "status", "cantx", "starttime", "endtime"
        ];
      
        keys.forEach(key => params.append(key, ''));
      
        const res = await fetch('http://jbht888.top/cpuser/index2', {
          method: 'POST',
          headers: {
            "Content-Type": "application/x-www-form-urlencoded; charset=UTF-8"
          },
          body: params.toString(), // ⬅️ 转成 URL 编码字符串
          credentials: "include" // ⬅️ 如果你登录了需要携带 cookie
        });
      
        let html = await res.text();
        const parser = new DOMParser();
        const doc = parser.parseFromString(html, "text/html");
        const rows = doc.querySelectorAll(".pageContent .table tbody tr");


        if (rows.length === 0) return ''
        const id = rows?.[0]?.getAttribute?.("rel") || '';
        return id
    };
    const searchDevice = async (id) => {
        let timestamp = Date.now(); // 例如：1751961796751
        let url = `http://jbht888.top/cpuser/cpuservisit?id2=${id}&_=${timestamp}`

        const res = await fetch(url);
        let html = await res.text();
        const parser = new DOMParser();
        const doc = parser.parseFromString(html, "text/html");
        const rows = doc?.querySelectorAll?.(".pageContent .table tbody tr");

        console.log(rows)

        if (rows.length === 0) return []; // ❌ 无数据
        const result = [];
        rows.forEach(tr => {
            const tds = tr.querySelectorAll("td");
            if (tds.length >= 6) {
            result.push({
                uname: tds[1].innerText.trim(),
                ucode: tds[2].innerText.trim(),
                pname: tds[4].innerText.trim(),
                pcode: tds[5].innerText.trim()
            });
            }
        });
        return result
    }
})()