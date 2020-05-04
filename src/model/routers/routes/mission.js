const { Mongo_model_mission }   = require("../../../db/mongodb/mongodb")

class Mission {
    constructor (router) {
        this.router = router
    }

    // 新增
    mission_add () {
        this.router.post("/yummy/missionadd", function (req, res) {
            console.log("新增任务 =>", req.body)

            // 数据对错
            let okReq_flag = true

            if (!req.body.title)    okReq_flag = false
            if (!req.body.article)  okReq_flag = false
            if (!req.body.answer)   okReq_flag = false
            if (!req.body.score)    okReq_flag = false
            if (!req.body.files)    okReq_flag = false

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