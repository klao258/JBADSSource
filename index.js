(() => {
    "use strict";

    const dataHost = "https://jbjtads.sso66s.cc"; // 数据接口域名
    /**
     *** 解密：const text = CryptoJS.AES.decrypt(encrypted, key).toString(CryptoJS.enc.Utf8);
     */

    let platform = "";
    if (window.location.host.includes("jbagency668")) {
        platform = "金貝飞投";
    } else if (window.location.host.includes("tsyl6666")) {
        platform = "天胜娱乐";
    }
    const validIds = [
        "001001001001", // 推广后台
        "001001001002", // 推广后台
    ];

    // 全局监听点击事件
    document.addEventListener(
        "click",
        function (e) {
            let timer = setTimeout(() => {
                clearTimeout(timer);
                timer = null;

                const selected = document.querySelector(
                    ".navTab-tab .selected"
                );
                const tabid = selected?.getAttribute("tabid");
                if (validIds.includes(tabid)) {
                    $("#buttonContainer").css("display", "flex");
                } else {
                    $("#buttonContainer").hide();
                }
            }, 100);
        },
        true
    );

    const createModel = () => {
        // 动态加载 Tabulator CSS
        const tabulatorCSS = document.createElement("link");
        tabulatorCSS.rel = "stylesheet";
        tabulatorCSS.href =
            "https://unpkg.com/tabulator-tables@5.5.0/dist/css/tabulator.min.css";
        document.head.appendChild(tabulatorCSS);

        // 动态加载 Tabulator JS
        const tabulatorScript = document.createElement("script");
        tabulatorScript.src =
            "https://unpkg.com/tabulator-tables@5.5.0/dist/js/tabulator.min.js";
        tabulatorScript.onload = () => {
            // Tabulator 资源加载完成后创建弹窗
            initPopup();
        };
        document.body.appendChild(tabulatorScript);

        function initPopup() {
            const style = document.createElement("style");
            style.textContent = `
                .my-popup-mask {
                    position: fixed; top: 0; left: 0; width: 100%; height: 100%;
                    background: rgba(0,0,0,0.5); display: none; justify-content: center; align-items: center; z-index: 9999;
                }
                .my-popup-content {
                    background: white; padding: 20px; border-radius: 8px; width: 80%; max-height: 90%;
                    display: flex; 
                    flex-direction: column;
                }
                .my-popup-header {
                    position: relative;
                    text-align: left;
                }
                .my-popup-header input {
                    padding: 2px 5px; width: 600px;
                }
                .my-popup-body {
                    flex: 1; overflow: auto;
                }
                .my-popup-close {
                    position: absolute; top: -16px; right: -16px; font-size: 32px; padding: 5px 10px; cursor: pointer;
                }
                .tabulator{
                    background-color: #FFFFFF !important;
                }
            `;
            document.head.appendChild(style);

            // 创建弹窗 DOM
            const popup = document.createElement("div");
            popup.className = "my-popup-mask";
            popup.innerHTML = `
                <div class="my-popup-content">
                    <div class="my-popup-header">
                        <input type="text" id="tab-search-input" placeholder="请输入 ucode，多个用英文逗号分隔" />
                        <button id="tab-search-btn">查询</button>
                        <div class="my-popup-close">×</div>
                    </div>
                    <div class="my-popup-body">
                        <div id="tabulator-table"></div>
                    </div>
                </div>
            `;
            document.body.appendChild(popup);

            // 关闭弹窗逻辑
            popup.querySelector(".my-popup-close").onclick = () =>
                (popup.style.display = "none");

            // 初始化表格
            const table = new Tabulator("#tabulator-table", {
                height: "300px",
                layout: "fitColumns",
                columns: [
                    { title: "用户昵称", field: "uname", width: "100" },
                    { title: "用户id", field: "ucode", width: "100" },
                    { title: "同设备个数", field: "devicesNum", width: "100" },
                    { title: "同设备明细", field: "devicesStr" },
                ],
                data: [], // 默认无数据
            });

            const formatData = (list) =>
                list.map((v) => ({
                    ...v,
                    ucode: v.ucode,
                    uname: v.uname || "",
                    devicesNum: v.devices?.length,
                    devicesStr: v.devices
                        .map((u) => `${u.uname || ""}(${u.ucode})`)
                        .join("、"),
                }));

            // 查询按钮点击逻辑
            const doSearch = async () => {
                const input = document
                    .getElementById("tab-search-input")
                    .value.trim();
                const ucodes = input
                    .replace(/，/g, ",")
                    .split(",")
                    .map((s) => s.trim())
                    .filter(Boolean);

                if (!ucodes?.length) return false;

                const list = [];
                for (const ucode of ucodes) {
                    // let {uname, id} = await searchUserId(ucode)
                    // if(!id) return false
                    let devices = await searchDevice(ucode);

                    list.push({
                        uname: devices[0]?.uname || "",
                        ucode,
                        devices,
                    });
                }
                table.setData(formatData(list));
            };

            const btn = document.getElementById("tab-search-btn");
            const input = document.getElementById("tab-search-input"); // 替换为你的输入框 id

            // 点击按钮事件
            btn.onclick = function () {
                doSearch(); // 你自定义的搜索函数
            };

            // 回车事件绑定在输入框上
            input.addEventListener("keydown", function (e) {
                if (e.key === "Enter") {
                    btn.click(); // 模拟点击按钮
                }
            });

            // 暴露一个方法用于显示弹窗
            window.showModel = () => {
                popup.style.display = "flex";
            };
        }
    };
    createModel();

    // 封装get请求
    const get = async (path, params = {}) => {
        try {
            const query = new URLSearchParams(params).toString();
            const res = await fetch(`${dataHost}${path}?${query}`);
            const data = await res.json(); // ⬅️ 这里必须 await
            if (data.code === 0) {
                return data;
            }
            return {};
        } catch (err) {
            return {};
        }
    };

    // 封装post请求
    const post = async (path, data) => {
        try {
            let res = await fetch(`${dataHost}${path}`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(data),
            });
            res = await res?.json();
            if (res.code === 0) {
                return res?.data || true;
            }
            return false;
        } catch (err) {
            return false;
        }
    };

    // 加密
    const encryptAESBrowser = (
        text,
        keyStr = "JBJT",
        ivStr = "0000000000000000"
    ) => {
        const key = CryptoJS.enc.Utf8.parse(keyStr);
        const iv = CryptoJS.enc.Utf8.parse(ivStr);

        const encrypted = CryptoJS.AES.encrypt(text, key, {
            iv: iv,
            mode: CryptoJS.mode.CBC,
            padding: CryptoJS.pad.Pkcs7,
        });

        return encrypted.toString(); // Base64 string
    };

    // 解密
    const decryptAES = (text, keyStr = "JBJT", ivStr = "0000000000000000") => {
        const key = CryptoJS.enc.Utf8.parse(keyStr);
        const iv = CryptoJS.enc.Utf8.parse(ivStr);

        const decrypted = CryptoJS.AES.decrypt(text, key, {
            iv: iv,
            mode: CryptoJS.mode.CBC,
            padding: CryptoJS.pad.Pkcs7,
        });

        return decrypted.toString(CryptoJS.enc.Utf8);
    };

    // 创建更新按钮
    const createView = () => {
        let uname = $("#header .headerNav .nav").text();
        let isLK = /TSADS|JBADS|老k/i.test(uname);
        console.log("isLK", isLK);

        // 创建容器
        const $container = $("<div>", {
            id: "buttonContainer",
        }).css({
            position: "fixed",
            top: "115px",
            right: "0",
            display: "none",
            flexWrap: "wrap",
            gap: "2px 5px",
            zIndex: 1,
        });

        // 所有按钮封装函数
        const createButton = (text, className, clickFn, auth = false) => {
            if (!isLK) {
                if (!auth) {
                    return false;
                }
            }

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
            createButton("同步到库", "cbtn", () => asyncDB(), false),
            createButton("按上级统计", "cbtn", () => getPcodeData(), false),
            createButton("按帖子统计", "cbtn", () => getAdsStatis(), false),
            // createButton("批量查同设备", "device", () => batchSearchDevice(), true),

            // createButton("同步DB", "dbBtn", () => updateDB()),
            // createButton("报表", "reportBtn", () => onReport()),
            // createButton("删除row", "delDBBtn", () => onDelRow()),
            // createButton("获取每日注册", "detailDBBtn", () => onDayDetial()),
        ];

        // 添加元素到容器
        $container.append(...buttons);

        // 添加到页面
        $("body").append($container);
    };
    createView();

    // 获取html
    const getHTML = (url) => {
        return new Promise((relove, reject) => {
            $.get(url, (data) => {
                let html = new DOMParser().parseFromString(data, "text/html");
                relove($(html));
            }).fail((err) => {
                relove(false);
            });
        });
    };

    // 根据用户ID获取用户名称
    const getUserInfo = async (ucode) => {
        const params = new URLSearchParams();
        params.append("ucode", ucode);
        params.append("type", "4");

        const keys = [
            "zdlucode",
            "uname",
            "upucode",
            "scztimes",
            "ecztimes",
            "ads",
            "status",
            "starttime",
            "endtime",
            "loginstarttime",
            "loginendtime",
        ];

        keys.forEach((key) => params.append(key, ""));

        const res = await fetch(`${window.location.origin}/cpuser`, {
            method: "POST",
            headers: {
                "Content-Type":
                    "application/x-www-form-urlencoded; charset=UTF-8",
            },
            body: params.toString(), // ⬅️ 转成 URL 编码字符串
            credentials: "include", // ⬅️ 如果你登录了需要携带 cookie
        });

        let html = await res.text();
        const parser = new DOMParser();
        const doc = parser.parseFromString(html, "text/html");
        const rows = doc.querySelectorAll(".pageContent .table tbody tr");

        if (rows.length === 0) return "";
        const uname = doc
            .querySelector(
                ".pageContent .table tbody tr:nth-child(1) td:nth-child(2)"
            )
            ?.textContent.trim();
        return { uname };
    };

    // 同步到库
    const asyncDB = async () => {
        console.log("准备同步到数据库");

        // 所有数据
        let userList = [];

        // 不在这个面板直接return
        const tableID = $(".navTab-tab .selected").attr("tabid");
        if (!validIds.includes(tableID)) return false;

        let main = null;
        $(".navTab-panel .page").each(function () {
            if ($(this).css("display") === "block") {
                main = $(this);
            }
        });

        // 获取所有的行
        let TRList = main.find(".grid .gridTbody tr");

        if (!TRList.length) return false;

        TRList.each(async (index, item) => {
            let _this = $(item);
            let children = $(item)?.children();
            let href = $(item).find('a[title="用户查看"]').attr("href");

            let uinfoUrl = `${window.location.origin}/${href}`;
            let uname = children?.eq(1)?.children()?.eq(0)?.text(); // 用户名
            let ucode = children?.eq(2)?.text(); // 用户id
            let upcode = children?.eq(4)?.text() || "-"; // 上级编码
            let upname = ""; // children?.eq(6)?.text()    // 上级名称
            let amount = children?.eq(7)?.text(); // 总充值

            userList.push({
                uinfoUrl,
                uname,
                ucode,
                upcode,
                upname,
                amount,
                _this,
            });
        });

        let users = [];
        userList?.map((v) => users.push({ platform, ucode: v.ucode }));

        const tmp = users.filter(
            (v) =>
                +v["amount"] > 200 &&
                ["53377", "64782", "64777"].includes(v.upcode)
        );
        console.log(tmp);

        let userRes = await post("/user/batch", { users }); // 自己 + 上级

        // 循环去库里查找，有找到更新ADS到视图， 更新总充值到库， 没有找到获取ADS值，在一起更新到库
        for (const item of userList) {
            let user = userRes.find((v) => v.ucode === item.ucode);
            if (userRes?.length && user) {
                // 已经存在的用户
                item["ads"] = user.ads || "";
                item["createDate"] = user.createDate || "";
                item["tgcode"] = user.tgcode || "";
                item["tgname"] = user.tgname || "";
                item["upname"] = user.upname || "";
                item["platform"] = user.platform || platform;
            } else {
                // 新用户
                item["platform"] = platform; // 平台
                let upinfo = await getUserInfo(item.upcode); // 找到上级信息
                item["upname"] = upinfo?.uname || "";

                let uinfohtml = await getHTML(item.uinfoUrl);
                const dls = $(uinfohtml).find(".pageFormContent dl").toArray();
                for (const dl of dls) {
                    const $dl = $(dl);
                    const label = $dl.find("dt")?.text();
                    const value = $dl.find("dd input")?.val();

                    if (label?.includes("注册时间")) {
                        item["createDate"] = value?.trim() || "";
                    } else if (label?.includes("机器人id")) {
                        item["tgcode"] = encryptAESBrowser(value?.trim() || "");
                    } else if (label?.includes("飞机@编码")) {
                        item["tgname"] = encryptAESBrowser(value?.trim() || "");
                    } else if (label?.includes("ads")) {
                        let ads = $dl.find("dd")?.text()?.trim();
                        if (ads?.length) {
                            item["ads"] = ads;
                        } else {
                            // 获取上级 HTML
                            const uphtml = await getHTML(
                                `${window.location.origin}/cpuser/view?ucode=${item.upcode}`
                            );
                            const uplist = $(uphtml)
                                .find(".pageFormContent dl")
                                .toArray();

                            for (const updl of uplist) {
                                const $updl = $(updl);
                                const uplabel = $updl.find("dt")?.text();
                                if (uplabel?.includes("ads")) {
                                    let ads = $updl.find("dd")?.text()?.trim();
                                    if (ads?.length) {
                                        item["ads"] = ads;
                                    } else {
                                        item["ads"] = `ADS-${item.upcode}`;
                                    }
                                    break;
                                }
                            }
                        }
                    }
                }
            }

            // 有找到更新ADS到视图，
            if (item["_this"].children()?.eq(1)?.children()?.length === 1) {
                if (item["ads"]?.length) {
                    item["_this"]
                        .children()
                        .eq(1)
                        .append(
                            `<div class="ads">${item["ads"]?.replace(
                                /ads-/gi,
                                ""
                            )}</div>`
                        );
                }
            }

            delete item["_this"];
            delete item["uinfoUrl"];
        }
        userList = userList.filter((v) => v.ads?.length);
        await post("/user/sync", { users: userList });
    };

    // 按上级统计数据
    const getPcodeData = async () => {
        const res = await get("/user/upcode");
        console.log("按上级统计数据", res?.data);

        const users = [];
        for (let obj of res.data) {
            if (obj["users"]?.length > 4000) {
                for (let row of obj["users"]) {
                    const tgcode = decryptAES(row.tgcode);
                    const tgname = decryptAES(row.tgname);
                    users.push({ ...row, tgcode, tgname });
                }
            }
        }
        console.log("users", users);

        // const result = [];
        // for (let i = 0; i < users.length; i += 1000) {
        //     result.push(users.slice(i, i + 1000));
        // }
        // for(let v of result){
        //     await post('/user/sync', { users: v })
        //     console.log('成功', v);
        // }
    };

    // 统计帖子注册充值数据
    const getAdsStatis = async () => {
        const res = await get("/user/getAdsStatis");
        console.log("按上级统计数据", res?.data);
    };

    // 查询同设备
    const batchSearchDevice = async () => {
        window.showModel();
    };

    // 查询同设备
    const searchUserId = async (code) => {
        const params = new URLSearchParams();
        params.append("pageNum", "1");
        params.append("ucode", code);
        params.append("type", "2");

        const keys = [
            "uname",
            "upucode",
            "level",
            "viplevel",
            "iscw",
            "ishaveback",
            "loginname",
            "email",
            "uanum",
            "jiangsmons",
            "jiangemons",
            "smons",
            "emons",
            "scztimes",
            "ecztimes",
            "winsmons",
            "winemons",
            "czurl",
            "txurl",
            "loginstarttime",
            "loginendtime",
            "remark",
            "status",
            "cantx",
            "starttime",
            "endtime",
        ];

        keys.forEach((key) => params.append(key, ""));

        const res = await fetch("http://jbht888.top/cpuser/index2", {
            method: "POST",
            headers: {
                "Content-Type":
                    "application/x-www-form-urlencoded; charset=UTF-8",
            },
            body: params.toString(), // ⬅️ 转成 URL 编码字符串
            credentials: "include", // ⬅️ 如果你登录了需要携带 cookie
        });

        let html = await res.text();
        const parser = new DOMParser();
        const doc = parser.parseFromString(html, "text/html");
        const rows = doc.querySelectorAll(".pageContent .table tbody tr");

        if (rows.length === 0) return "";
        const uname = doc
            .querySelector(
                ".pageContent .table tbody tr:nth-child(1) td:nth-child(2)"
            )
            ?.textContent.trim();

        const id = rows?.[0]?.getAttribute?.("rel") || "";
        return { uname, id };
    };
    const searchDevice = async (code) => {
        let timestamp = Date.now(); // 例如：1751961796751
        let url = `${window.location.origin}/cpuser/cpuservisit?ucode2=${code}&_=${timestamp}`;

        const res = await fetch(url);
        let html = await res.text();
        const parser = new DOMParser();
        const doc = parser.parseFromString(html, "text/html");
        const rows = doc?.querySelectorAll?.(".pageContent .table tbody tr");

        if (rows.length === 0) return []; // ❌ 无数据
        const result = [];
        rows.forEach((tr) => {
            const tds = tr.querySelectorAll("td");
            if (tds.length >= 6) {
                result.push({
                    uname: tds[1].innerText.trim(),
                    ucode: tds[2].innerText.trim(),
                    pcode: tds[4].innerText.trim(),
                });
            }
        });
        return result;
    };
})();
