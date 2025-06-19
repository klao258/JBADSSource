(() => {
    "use strict";

    const dataHost = 'https://jbjtads.sso66s.cc'; // 数据接口域名

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

    $('body').on('click', 'button[type="submit"]', function () {
        console.log('提交按钮被点击了');
    });
})()