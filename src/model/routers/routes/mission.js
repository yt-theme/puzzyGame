const fs = require("fs")
const { Mongo_model_mission, Mongo_model_admin }   = require("../../../db/mongodb/mongodb")
const middleware_admin          = require("../../middleware/admin")
const cfg                       = require("../../../../config")


class Mission {
    constructor (router) {
        this.router = router
    }

    // 新增 需要管理员权限
    mission_add () {
        const admin_token = fs.readFileSync(cfg.KEY_PATH + "/admin_token", "UTF-8")
        this.router.post("/yummy/missionadd", (req, res, next) => { middleware_admin(req, res, next, Mongo_model_admin, admin_token) }, function (req, res) {
            console.log("新增任务 =>", req.body)

            if (req.analyz_state != 1) {
                res.json({ "state": 0, "msg": "鉴权失败" })
                return false
            }

            // 数据对错
            let okReq_flag = true

            if (!req.body.title)    okReq_flag = false
            if (!req.body.article)  okReq_flag = false
            if (!req.body.answer)   okReq_flag = false
            if (!req.body.score)    okReq_flag = false
            // if (!req.body.files)    okReq_flag = false

            if (!okReq_flag) {
                res.json({ "state": 0, "msg": "信息不完整" })
                return false
            }

            // 判断注册
            Mongo_model_mission.insertOne({
                "time":     new Date().getTime(),
                "title":    req.body.title,
                "article":  req.body.article,
                "answer":   req.body.answer,
                "score":    req.body.score,
                "files":    req.body.files,
            }).then((v) => {

                console.log("数据库 新增任务 返回 =======>", v)
                res.json({ "state": 1, "msg": "ok" })

            }).catch((err) => {

                res.json({ "state": 0, "msg": "新增任务失败" })

            })
        })
    }

    // 检索
    query () {
        this.router.post("/yummy/missionquery", function (req, res) {
            console.log("检索 =>", req.body)

            // 数据对错
            let okReq_flag = true

            if (!req.body.page)  okReq_flag = false
            if (!req.body.size)  okReq_flag = false

            if (!okReq_flag) {
                res.json({ "state": 0, "msg": "信息不完整" })
                return false
            }

            // 并发执行
            const PROMISE_page = Mongo_model_mission.findAsPage(
                // 查询条件
                {

                },
                // skip
                (Number(req.body.page) - 1) * Number(req.body.size),
                // limit
                Number(req.body.size),
                // 查询字段
                '',
                // 选项
                { "sort": { "_id": -1 } }
            )
            const PROMISE_count = Mongo_model_mission.findIdCount(
                {}
            )
            Promise.all([PROMISE_page, PROMISE_count]).then((v) => {
                res.json({ "state": 1, "msg": "ok", "data": v[0], "total": v[1]})
            }).catch((err) => {
                res.json({ "state": 0, "msg": "检索失败", "data": err})
            })
        })
    }

    // 检索最新
    query_last () {
        this.router.post("/yummy/missionquerylast", function (req, res) {
            console.log("检索最新 =>", req.body)

            Mongo_model_mission.find({}, null, { "sort": { "_id": -1 }, "limit": 1 }).then((v) => {
                console.log("检索最新值 =>", v)
                res.json({ "state": 1, "msg": "ok", "data": v })
            }).catch((err) => {
                res.json({ "state": 0, "msg": "检索最新任务失败" })
            })
        })
    }
}

module.exports = Mission