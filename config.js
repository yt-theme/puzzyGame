const fs = require("fs")
const path = require("path")

// 管理员&&密码
const ADMIN_USERNAME = "admin"
const ADMIN_PASSWORD = "admin"

// 端口
const HTTP_PORT = 14488

// 数据库
// mongodb
const MONGODB_URL       = "0.0.0.0"
const MONGODB_PORT      = 27017
const MONGODB_DBNAME    = "puzzygame"


// 定义目录
const KEY = "key"
const UPLOAD = "upload"
const FRONTEND = "frontEnd"

// 密钥目录
const KEY_PATH      = path.join(__dirname, "./" + KEY)
// 上传文件目录
const UPLOAD_PATH   = path.join(__dirname, "./" + UPLOAD)
// 前端文件目录
const FRONTEND_PATH = path.join(__dirname, "./" + FRONTEND)

// ###############################################
//                  其它信息
// ###############################################
// 一天的结束
const DAY_END_T = { "h": 23, "m": 59, "s": 59 }

module.exports = {
    ADMIN_USERNAME,
    ADMIN_PASSWORD,
    HTTP_PORT,
    MONGODB_URL,
    MONGODB_PORT,
    MONGODB_DBNAME,
    UPLOAD,
    FRONTEND,
    KEY_PATH,
    UPLOAD_PATH,
    FRONTEND_PATH,
    DAY_END_T
}