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

    // 封装get请求
    const get = async (path, params = {}) => {
        try {
            const query = new URLSearchParams(params).toString();
            const res = await fetch(`${dataHost}${path}?${query}`);
            const data = await res.json(); // ⬅️ 这里必须 await
            if (data.code === 0) {
                return (data?.data || []);
            }
            return []
        } catch (err) {
            return []
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
            let upcode = children?.eq(5)?.text()
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
                        item['tgcode'] = CryptoJS.AES.encrypt((value?.trim() || ''), key).toString()
                    } else if (label?.includes('飞机@编码')){
                        item['tgname'] = CryptoJS.AES.encrypt((value?.trim() || ''), key).toString()
                    } else if (label?.includes('ads')){
                        item['ads'] = $(this).find('dd')?.text()?.trim() || ''
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
})()