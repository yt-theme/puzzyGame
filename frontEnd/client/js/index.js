let login_btn               = document.getElementById("login_btn")
let register_btn            = document.getElementById("register_btn")
let logout_btn              = document.getElementById("logout_btn")
let login_pop               = document.getElementById("login_pop")
let login_submit            = document.getElementById("login_submit")
let register_submit         = document.getElementById("register_submit")
let login_inner_title       = document.getElementById("login_inner_title")
let login_inner_username    = document.getElementById("login_inner_username")
let login_inner_password    = document.getElementById("login_inner_password")
let article_content         = document.getElementById("article_content")

let CURRENT_page = 1

window.onload = function () {
    if (localStorage.getItem("var_token")) {
        check_login()
    } else {
        query_today_data()
    }
}

// 显示登录框
function show_login_pop (mode) {
    if (mode == "register") {
        login_inner_title.innerHTML = "注册"
        login_submit.style.display  = "none"
        register_submit.style.display  = "flex"
    } else {
        login_inner_title.innerHTML = "登录"
        login_submit.style.display  = "flex"
        register_submit.style.display  = "none"
    }
    login_pop.style.display = "flex"
}

// 隐藏登录框
function close_login_pop () {
    login_pop.style.display = "none"
    login_inner_username.value = ""
    login_inner_password.value = ""
}

// 处理界面变为登录后的页面
function dealt_logined_UI () {
    login_btn.style.display    = "none"
    register_btn.style.display = "none"
    logout_btn.style.display   = "flex"
}

// 注册
function register () {
    let username = login_inner_username.value
    let password = login_inner_password.value
    ajax("POST", "/yummy/register", { username, password }).then((res) => {
        console.log("请求成功 =>", res)
        if (res.data.state == 1) {
            alert("注册成功,返回登录!")
            close_login_pop()
        } else {
            alert(res.data.msg)
        }
    }).catch((err) => {
        console.log("请求失败 =>", err)
        alert(err || "注册失败")
    })
}

// 登录
function login () {
    let username = login_inner_username.value
    let password = login_inner_password.value
    ajax("POST", "/yummy/login", { username, password }).then((res) => {
        console.log("请求成功 =>", res)
        if (res.data.state == 1) {
            localStorage.setItem("var_token", res.data.var_token)
            close_login_pop()
            dealt_logined_UI()
            query_today_data()

        } else {
            alert(res.data.msg)
        }
    }).catch((err) => {
        console.log("请求失败 =>", err)
        alert(err || "登录失败")
    })
}

// 注销
function do_logout () {
    if (confirm("确定注销?")) {
        localStorage.clear()
        location.reload()
    }
}

// 检查登录
function check_login () {
    const var_token = localStorage.getItem("var_token")
    ajax("POST", "/yummy/checklogin", {}, { "Authorization": var_token }).then((res) => {
        console.log("请求成功 =>", res)
        if (res.data.state == 1) {
            dealt_logined_UI()
            query_today_data()
        } else {
            alert(res.data.msg)
        }
    }).catch((err) => {
        console.log("请求失败 =>", err)
        alert(err || "检查登录失败")
    })
}


// #################################################################
//                          主体
// #################################################################
// 请求今日数据
function query_today_data () {
    ajax("POST", "/yummy/missionquerylast", {}).then((res) => {
        console.log("请求成功 =>", res)
        if (res.data.state == 1) {
            render_article_data(res.data.data)
        } else {
            alert(res.data.msg)
        }
    }).catch((err) => {
        console.log("请求失败 =>", err)
        alert(err || "查询失败")
    })
}

// 渲染文章数据
function render_article_data (arr, mode) {
    let tmp_html = ''
    arr.forEach((ite, ind) => {
        let update_t = new Date(ite.time)
        tmp_html = `
            <h2 class="article_content_title">${ite.title}</h2>
            <p class="article_content_time">${
                update_t.getFullYear() + "年" +
                (update_t.getMonth() + 1) + "月" +
                (update_t.getDate() + 1) + "日 " +
                update_t.getHours() + ":" +
                update_t.getMinutes() + ":" +
                update_t.getSeconds()
            }</p>
            <div class="article_content_article" readonly>${
                ite.article.replace(/\n/g, "<br/>")
                           .replace(/\r/g, "<br/>")
                           .replace(/ /g, "&nbsp")
            }</div>
            <!-- 提交答案区域 -->
            <div class="submit_answer align_cent">
                <label class="margin_r_11px">答案</label>
                <input class="answer_input margin_r_11px" id="answerinput_${ite._id}"/>
                <div class="answer_btn margin_r_11px" onclick="submit_answer('${ite._id}')">提交</div>
            </div>
        `
    })
    // 向后追加
    if (mode == "append") {
        article_content.innerHTML = article_content.innerHTML + tmp_html
    }
    // 向前追加
    else if (mode == "preappend") {
        article_content.innerHTML = tmp_html + article_content.innerHTML
    } else {
        article_content.innerHTML = tmp_html
    }
}

// 查询上一篇文件
function query_last () {
    let page = CURRENT_page + 1
    let size = 1
    ajax("POST", "/yummy/missionquery", { page, size }).then((res) => {
        console.log("请求成功 =>", res)
        if (res.data.state == 1) {
            render_article_data(res.data.data, "preappend")
            CURRENT_page += 1
        } else {
            alert(res.data.msg)
        }
    }).catch((err) => {
        console.log("请求失败 =>", err)
        alert(err || "查询失败")
    })
}

// 提交答案
function submit_answer (_id) {
    const var_token   = localStorage.getItem("var_token")
    if (!var_token) {
        show_login_pop("login")
        return false
    }
    // 当前输入框
    let input_val = document.getElementById("answerinput_" + _id).value
    if (!input_val) {
        alert("输入内容")
        return false
    }
    const answer      = input_val
    const mission_id  = _id
    ajax("POST", "/yummy/submitanswer", { answer, mission_id }, { "Authorization": var_token }).then((res) => {
        console.log("请求成功 =>", res)
        if (res.data.state == 1) {
            alert(res.data.msg)
        } else {
            if (res.data.msg == "鉴权失败") {
                show_login_pop("login")
            } else {
                alert(res.data.msg)
            }
        }
    }).catch((err) => {
        console.log("请求失败 =>", err)
        alert(err || "提交失败")
    })
}