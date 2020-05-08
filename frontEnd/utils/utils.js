function ajax (method, url, paramsObj, headerObj) {
    return new Promise ((resolve, reject) => {
        let xhttp = new XMLHttpRequest()
        // 格式化参数
        let params = formatParams(paramsObj)
        function formatParams (paramsObj) {
            let tmp_arr = []
            for (let kv in paramsObj) { tmp_arr.push(encodeURIComponent(kv) + "=" + encodeURIComponent(paramsObj[kv])) }
            return tmp_arr.join('&')
        }
        // 回调
        xhttp.onreadystatechange = callback
        // get
        if (method === 'get' || method === 'GET') {
            xhttp.open('GET', url + '?' + params, true)
            xhttp.send()
        // post
        } else if (method === 'post' || method === 'POST') {
            xhttp.open('POST', url, true)
            xhttp.setRequestHeader("Content-type", "application/x-www-form-urlencoded")
            for (let ite in headerObj) {
                xhttp.setRequestHeader(ite, headerObj[ite])
            }
            xhttp.send(params)
        }
        // 回调定义
        function callback() {
            if (xhttp.readyState == 4) {
                let s = xhttp.status
                if (s>= 200 && s< 300) { let resT = xhttp.responseText; let resX = xhttp.responseXML; resolve({ data: JSON.parse(resT) }) } 
                else                   { reject(status)                                                                                   }
            }
        }
    })
}

function timestamp_to_datetime (stamp) {
    let dateobj = new Date(stamp)
    return  dateobj.getFullYear() + "年" +
            (dateobj.getMonth() + 1) + "月" +
            (dateobj.getDate()) + "日 " +
            dateobj.getHours() + ":" +
            dateobj.getMinutes() + ":" +
            dateobj.getSeconds()
}