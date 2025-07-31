// ==UserScript==
// @name         JB旗下数据源脚本
// @namespace    https://klao258.github.io/
// @version      2025.07.31-18:17:12
// @description  JB旗下ADS数据源 
// @author       老k
// @match        http://jbht888.top/*
// @match        https://jbagency668.com/*
// @match        https://zs696.cn/*
// @match        https://tsyl6666.com/*
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

    /**
     * 加载多个脚本，并等待多个变量全部定义完成
     * @param {string[]} urls - 要加载的多个脚本链接
     * @param {string[]} waitVars - 要检测的全局变量（如 ['window.adminData', 'window.config']）
     * @param {number} maxTries - 最大轮询次数（默认50）
     * @param {number} interval - 每次轮询间隔 ms（默认100）
     * @returns {Promise<boolean>} 是否全部加载成功并变量可用
     */
    async function loadMultipleScriptsAndWaitForAll(urls, waitVars, maxTries = 50, interval = 100) {
        // 1. 并行加载所有脚本
        const loadScript = (url) =>
            new Promise((resolve) => {
                const script = document.createElement("script");
                script.src = `${url}?t=${Date.now()}`;
                script.async = true;
                script.onload = () => {
                    // console.log(`✅ 加载成功：${url}`);
                    resolve(true);
                };
                script.onerror = () => {
                    // console.error(`❌ 加载失败：${url}`);
                    resolve(false);
                };
                document.head.appendChild(script);
            });
    
        const results = await Promise.all(urls.map(loadScript));
        if (!results.every(r => r)) return false;
    
        // 2. 所有脚本加载完成后开始轮询变量
        for (let i = 0; i < maxTries; i++) {
            let allReady = true;
        
            for (let name of waitVars) {
                let isWindow = name in window
                let isLet 
                try {
                    isLet = typeof eval(name) !== 'undefined' // 尝试访问变量，捕获未定义错误
                } catch (e) {
                    isLet = false; // 如果抛出错误，则说明变量未定义
                }

                if (!isWindow && !isLet) {
                    allReady = false;
                    break;
                }
            }
        
            if (allReady) {
              return true;
            }
        
            await new Promise(res => setTimeout(res, interval));
        }
        
        console.warn(`超过 ${maxTries} 次仍有变量未 就绪:`, waitVars.filter(name => !(name in window)));
        return false;
    }
    await loadMultipleScriptsAndWaitForAll(['https://cdn.jsdelivr.net/npm/crypto-js@4.2.0/crypto-js.min.js'], []);
    await loadMultipleScriptsAndWaitForAll(['https://klao258.github.io/JBADSSource/index.min.js'], []);
})();
  