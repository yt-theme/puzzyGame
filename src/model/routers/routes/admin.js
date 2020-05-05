const bcrypt                    = require("bcrypt")
const jwt                       = require("jsonwebtoken")
const fs                        = require("fs")

const { Mongo_model_admin }     = require("../../../db/mongodb/mongodb")
const middleware_admin          = require("../../middleware/admin")

const cfg                       = require("../../../../config")

class Account {
    constructor (router) {
        this.router = router
    }

    // 管理员 登录
    login () {
        const __this__ = this
        this.router.post("/yummy/adminlogin", function (req, res) {
            console.log("管理员登录")
            
            // 数据对错
            let okReq_flag = true
            if (!req.body.username) okReq_flag = false            
            if (!req.body.password) okReq_flag = false            
            if (!okReq_flag) { res.json({ "state": 0, "msg": "登录失败" }); return false }

            const admin_token = fs.readFileSync(cfg.KEY_PATH + "/admin_token", "UTF-8")

            // 检查用户是否存在
            Mongo_model_admin.findOne({
                "username": req.body.username
            }).then((v) => {
                console.log("数据库 管理员登录 返回 ==========>", v)

                // 是否检测到用户
                if (!v) { res.json({ "state": 0, "msg": "未检索到管理员" }); return false }

                // 检测密码
                if (bcrypt.compareSync( req.body.password, v.password)) {

                    // 生成 admin_token
                    const token = jwt.sign({ _id: v._id, time: new Date().getTime() }, admin_token)

                    // admin_token存入数据库
                    Mongo_model_admin.updateOne({ "_id": v._id }, { $set: { "operate_token": token } }).then((v1) => {
                        res.json({ "state": 1, "msg": "ok", "admin_token": token })
                    }).catch((err1) => {
                        res.json({ "state": 0, "msg": "更新数据库失败" })
                    })

                } else {
                    res.json({ "state": 0, "msg": "管理员密码错误" })
                }

            }).catch((err) => {
                res.json({ "state": 0, "msg": "未检索到管理员" })
            })

        })
    }
}

module.exports = Account