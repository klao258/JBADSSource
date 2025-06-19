// ==UserScript==
// @name         JB旗下数据源脚本
// @namespace    https://klao258.github.io/
// @version      2025.06.19-19:44:37
// @description  JB旗下ADS数据源 
// @author       老k
// @match        http://jbht888.top/login#001001010003
// @match        https://zs696.cn/login#001001010003
// @icon         https://www.google.com/s2/favicons?sz=64&domain=telegram.org
// @updateURL    https://klao258.github.io/JBADSSource/tg-ads.user.js
// @downloadURL  https://klao258.github.io/JBADSSource/tg-ads.user.js
// @grant        GM_addStyle
// @grant        none
// @run-at       document-start
// ==/UserScript==

(async function () {
    'use strict';

    console.log(`✅ JB数据源脚本已加载，当前版本： ${ GM_info.script.version }`);
    
    // ===== 🔄 检查远程是否有新版本 =====
    const CURRENT_VERSION = GM_info.script.version;
    const REMOTE_URL = "https://klao258.github.io/JBADSSource/tg-ads.user.js";
    window.dataHost = 'https://jbjtads.sso66s.cc'; // 数据接口域名

    (async function checkForUpdate() {
        try {
        const text = await (await fetch(REMOTE_URL + '?t=' + Date.now())).text();
        const match = text.match(/@version\s+([^\n]+)/);
        if (match && match[1] && match[1].trim() !== CURRENT_VERSION.trim()) {
            showUpdatePopup(match[1].trim());
        }
        } catch (e) {
        console.warn("🚫 检查版本更新失败：", e);
        }
    })();

    // ===== 💬 弹窗提示新版本 =====
    function showUpdatePopup(newVersion) {
        const div = document.createElement("div");
        div.innerHTML = `
        <div style="position:fixed;top:20px;right:20px;background:#222;color:#fff;padding:10px 16px;border-radius:8px;font-size:14px;z-index:9999;box-shadow:0 0 8px #000;">
            🔄 脚本有新版本：${newVersion}<br>
            <button id="update-script-btn" style="margin-top:8px;padding:6px 12px;border:none;border-radius:4px;background:#4caf50;color:#fff;cursor:pointer;">立即更新</button>
        </div>
        `;
        document.body.appendChild(div);
        document.getElementById("update-script-btn").onclick = () => {
        window.open(REMOTE_URL, "_blank");
        };
    }

    // 封装get请求
    const get = async (path, params = {}) => {
        try {
            const query = new URLSearchParams(params).toString();
            const res = await fetch(`${window.dataHost}${path}?${query}`);
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
            let res = await fetch(`${window.dataHost}${path}`, {
                method: 'POST',
                headers: {'Content-Type': 'application/json'},
                body: JSON.stringify(data)
            })
            const data = await res?.json()
            if (data.code === 0) {
                return true
            }
            return false
        } catch (err) {
            return false
        }
    }

})();
  