const bcrypt                    = require("bcrypt")
const jwt                       = require("jsonwebtoken")
const fs                        = require("fs")

const { Mongo_model_account }   = require("../../../db/mongodb/mongodb")
const middleware_account        = require("../../middleware/account")

const cfg                       = require("../../../../config")

class Account {
    constructor (router) {
        this.router = router

        this.var_token = fs.readFileSync(cfg.KEY_PATH + "/var_token", "UTF-8")
    }
    
    // 注册 /yummy/register
    register () {
        this.router.post("/yummy/register", function (req, res) {
            console.log("注册 =>", req.body)

            // 数据对错
            let okReq_flag = true

            if (!req.body.username) okReq_flag = false
            if (!req.body.password) okReq_flag = false

            if (!okReq_flag) {
                res.json({ "state": 0, "msg": "输入用户名和密码" })
                return false
            }

            // 判断注册
            Mongo_model_account.insertOne({
                "username": req.body.username,
                "password": req.body.password,
            }).then((v) => {

                console.log("数据库 注册 返回 =======>", v)
                res.json({ "state": 1, "msg": "ok" })

            }).catch((err) => {

                const msg = (err.code == 11000 ? "用户名已存在" : err)
                res.json({ "state": 0, "msg": msg })

            })
        })
    }

    // 登录 /yummy/login
    login () {
        const __this__ = this
        this.router.post("/yummy/login", function (req, res) {
            console.log("登录 =>", req.body)

            // 数据对错
            let okReq_flag = true

            if (!req.body.username) okReq_flag = false
            if (!req.body.password) okReq_flag = false

            if (!okReq_flag) {
                res.json({ "state": 0, "msg": "输入用户名和密码" })
                return false
            }

            // 检查用户是否存在
            Mongo_model_account.findOne({
                "username": req.body.username
            }).then((v) => {
                console.log("数据库 登录 返回 ==========>", v)

                // 是否检测到用户
                if (!v) {
                    res.json({ "state": 0, "msg": "未检索到用户" })
                    return false
                }

                // 检测密码
                if (bcrypt.compareSync( req.body.password, v.password)) {

                    // 生成 var_token
                    const token = jwt.sign({ _id: v._id, time: new Date().getTime() }, __this__.var_token)

                    // var_token存入数据库
                    Mongo_model_account.updateOne({ "_id": v._id }, { $set: { "var_token": token } }).then((v1) => {
                        res.json({ "state": 1, "msg": "ok", "var_token": token })
                    }).catch((err1) => {
                        res.json({ "state": 0, "msg": "更新数据库失败" })
                    })

                }

            }).catch((err) => {
                res.json({ "state": 0, "msg": "未检索到用户" })
            })
        })
    }

    // 检查登录 /yummy/checklogin
    checklogin () {
        this.router.post("/yummy/checklogin", (req, res, next) => { middleware_account(req, res, next, Mongo_model_account, this.var_token) }, function (req, res) {

            if (req.analyz_state != 1) return false

            res.json({ "state": 1, "msg": req.analyz_profile })
        })
    }
}

module.exports = Account