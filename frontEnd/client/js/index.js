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
let user_sum_score          = document.getElementById("user_sum_score")
let user_sum_level          = document.getElementById("user_sum_level")

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
            show_login_pop("login")
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
            get_userinfo()
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
            set_user_info(res.data.data)
        } else {
            alert(res.data.msg)
        }
    }).catch((err) => {
        console.log("请求失败 =>", err)
        alert(err || "检查登录失败")
    })
}

// 获取用户信息
function get_userinfo () {
    const var_token = localStorage.getItem("var_token")
    ajax("POST", "/yummy/userinfo", {}, { "Authorization": var_token }).then((res) => {
        console.log("请求成功 =>", res)
        if (res.data.state == 1) {
            set_user_info(res.data.data)
        } else {
            alert(res.data.msg)
        }
    }).catch((err) => {
        console.log("请求失败 =>", err)
        alert(err || "获取用户信息失败")
    })
}

// 设置用户基本信息到网页
function set_user_info(obj) {
    user_sum_score.innerHTML = obj.score || 0
    user_sum_level.innerHTML = obj.level || "未开通等级"
}



// #################################################################
//                          主体
// #################################################################
// 请求今日数据
function query_today_data () {
    const var_token = localStorage.getItem("var_token") || ""
    ajax("POST", "/yummy/missionquerylast", {}, { "Authorization": var_token }).then((res) => {
        console.log("请求成功 =>", res)
        if (res.data.state == 1) {
            render_article_data(res.data.data, "normal", res.data.record)
            CURRENT_page = 1
        } else {
            alert(res.data.msg)
        }
    }).catch((err) => {
        console.log("请求失败 =>", err)
        alert(err || "查询失败")
    })
}

// 渲染文章数据
function render_article_data (arr, mode, record) {
    let tmp_html = ''
    arr.forEach((ite, ind) => {

        // 文章主体区域
        tmp_html = `
            <h2 class="article_content_title">${ite.title}</h2>
            <p class="article_content_time">${
                timestamp_to_datetime(ite.time)
            }</p>
            <div class="article_content_article" readonly>${
                ite.article.replace(/\r\n/g, "<br/>")
                           .replace(/\n/g, "<br/>")
                           .replace(/\r/g, "<br/>")
                           .replace(/ /g, "&nbsp")
            }</div>
            <!-- 提交答案区域 -->
            ${
                record
                ? 
                    `
                        <div class="submit_answer align_cent">
                            <label class="margin_r_11px">分数 <span>${record.score || 0}</span></label>
                            <label class="margin_r_11px">提交时间 <small>${timestamp_to_datetime(record.submit_time)}</small></label>
                        </div>
                    `
                : 
                    // 如果已过期
                    ite.is_overdue == 1
                    ?
                        
                        `
                            <div class="submit_answer align_cent">
                                <label class="margin_r_11px">已过期</label>
                            </div>
                        `
                    :

                        `
                            <div class="submit_answer align_cent">
                                <label class="margin_r_11px">答案</label>
                                <input class="answer_input margin_r_11px" id="answerinput_${ite._id}"/>
                                <div class="answer_btn margin_r_11px" onclick="submit_answer('${ite._id}')">提交</div>
                            </div>
                        `
            }
            
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
    const var_token = localStorage.getItem("var_token") || ""
    ajax("POST", "/yummy/missionquery", { page, size }, { "Authorization": var_token }).then((res) => {
        console.log("请求成功 =>", res)
        if (res.data.state == 1) {
            if (res.data.data.length == 0) {
                alert("已是最前一页")
                return false
            }
            render_article_data(res.data.data, "preappend", res.data.record)
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
            // 更新分数
            get_userinfo()
            // 重新检索
            query_today_data()
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