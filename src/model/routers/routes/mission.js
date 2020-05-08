const fs = require("fs")
const { Mongo_model_mission, Mongo_model_admin, Mongo_model_account, Mongo_model_account_record }   = require("../../../db/mongodb/mongodb")
const middleware_admin          = require("../../middleware/admin")
const middleware_account        = require("../../middleware/account")
const cfg                       = require("../../../../config")


class Mission {
    constructor (router) {
        this.router = router
        this.var_token = fs.readFileSync(cfg.KEY_PATH + "/var_token", "UTF-8")
    }

    // 新增 需要管理员权限
    mission_add () {
        const admin_token = fs.readFileSync(cfg.KEY_PATH + "/admin_token", "UTF-8")
        this.router.post("/yummy/missionadd", (req, res, next) => { middleware_admin(req, res, next, Mongo_model_admin, admin_token) }, async (req, res) => {
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

            // 变更最近一个数据过期状态
            let findLastDue_result = await Mongo_model_mission.find({}, ["_id"], { "sort": { "_id": -1 }, "limit": 1 })
            if (!findLastDue_result) {
                res.json({ "state": 0, "msg": "检索任务状态失败" })
                return false
            }
            if (!(findLastDue_result[0] && findLastDue_result[0]["_id"])) {

            } else {
                let updateDue_result = await Mongo_model_mission.updateOne({ "_id": findLastDue_result[0]["_id"] }, { $set: { "is_overdue": 1 } })
                if (!updateDue_result) {
                    res.json({ "state": 0, "msg": "修改任务状态失败2" })
                    return false
                }
            }

            // 插入数据
            let insert_result = await Mongo_model_mission.insertOne({
                "time":     new Date().getTime(),
                "title":    req.body.title,
                "article":  req.body.article,
                "answer":   req.body.answer,
                "score":    req.body.score,
                "files":    req.body.files,
            })
            if (insert_result) {
                res.json({ "state": 1, "msg": "ok" })
                return false
            } else {
                res.json({ "state": 0, "msg": "新增任务失败" })
                return false
            }
        })
    }

    // 检索
    query () {
        this.router.post("/yummy/missionquery", (req, res, next) => { middleware_account(req, res, next, Mongo_model_account, this.var_token) }, function (req, res) {
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
            Promise.all([PROMISE_page, PROMISE_count]).then(async (v) => {

                // ####################################################
                //          如果有token并检测 用户有没有提交过此任务
                // ####################################################
                // if (req.analyz_state == 1) {
                //     let reocrd_dat = await Mongo_model_account.findOne({ "_id": req.analyz_profile._id, "missons": { "$elemMatch": { "mission_id": v[0]._id } } })
                //     console.log("reocrd_dat =>", reocrd_dat)
                // }

                // ####################################################
                //          用户有没有提交过此任务
                // #################################################### 
                let reocrd_dat = null

                console.log("query ======>", v)
                if (req.analyz_profile && req.analyz_profile._id && v[0] && v[0][0] && v[0][0]._id) {
                    reocrd_dat = await Mongo_model_account_record.findOne({
                        $and:[{ "account_id": req.analyz_profile._id || "" }, {"mission_id": v[0][0]._id }]
                    })

                    console.log("reocrd_dat =>", reocrd_dat)

                }


                res.json({ "state": 1, "msg": "ok", "data": v[0], "total": v[1], "record": reocrd_dat})
            }).catch((err) => {
                console.log("mission query 失败 =>", err)
                res.json({ "state": 0, "msg": "检索失败", "data": err})
            })
        })
    }

    // 检索最新
    query_last () {
        this.router.post("/yummy/missionquerylast", (req, res, next) => { middleware_account(req, res, next, Mongo_model_account, this.var_token) }, function (req, res) {
            console.log("检索最新 =>", req.body)

            Mongo_model_mission.find({}, null, { "sort": { "_id": -1 }, "limit": 1 }).then(async (v) => {
                console.log("检索最新值 =>", v)
                
                let mission_id = ((v[0]&&v[0]._id) ? v[0]._id : '')

                // ####################################################
                //          用户有没有提交过此任务
                // #################################################### 
                let reocrd_dat = null
                if (req.analyz_profile && req.analyz_profile._id) {
                    reocrd_dat = await Mongo_model_account_record.findOne({$and:[{ "account_id": req.analyz_profile._id}, {"mission_id": mission_id }]})

                    console.log("reocrd_dat =>", reocrd_dat, req.analyz_profile, mission_id)

                }

                res.json({ "state": 1, "msg": "ok", "data": v, "record": reocrd_dat })
            }).catch((err) => {
                console.log("检索最新任务失败 =>", err)
                res.json({ "state": 0, "msg": "检索最新任务失败" })
            })
        })
    }

    // ############################################################
    //                             核心
    // ############################################################

    // 提交答案 需要验证用户token
    submit_answer () {
        const __this__ = this
        this.router.post("/yummy/submitanswer", (req, res, next) => { middleware_account(req, res, next, Mongo_model_account, this.var_token) }, async function (req, res) {

            if (req.analyz_state != 1) {
                res.json({ "state": 0, "msg": "鉴权失败" })
                return false
            }

            // 数据对错
            let okReq_flag = true

            if (!req.body.answer)       okReq_flag = false
            if (!req.body.mission_id)   okReq_flag = false

            if (!okReq_flag) {
                res.json({ "state": 0, "msg": "需要答案和任务id" })
                return false
            }

            /* #################################################################################################
                                                        只能提交最新任务
            ################################################################################################# */ 
            // 1.检索最新的任务的_id
            let last_id_arr = await Mongo_model_mission.find({}, null, { "sort": { "_id": -1 }, "limit": 1 })
            if (!last_id_arr) {
                res.json({ "state": 0, "msg": "检索最新任务失败" })
                return false
            }
            if (last_id_arr[0]._id != req.body.mission_id) {
                res.json({ "state": 0, "msg": "不能提交以往任务" })
                return false
            }


            /* #################################################################################################

                            判断当天是否已提交过 0点之后算第二天 即距下一个0点剩余24小时以内则算当天

            ################################################################################################# */
            // const last_submit = new Date(req.analyz_profile.last_submit)
            const curr_time   = new Date()
            const day_end     = cfg.DAY_END_T || { "h": 23, "m": 59, "s": 59 }

            // const last_t = { 
            //     "Y": last_submit.getFullYear(), 
            //     "M": last_submit.getMonth()+1, 
            //     "D": last_submit.getDate(), 
            //     "h": last_submit.getHours(), 
            //     "m": last_submit.getMinutes(), 
            //     "s": last_submit.getSeconds()
            // }
            const curr_t = { 
                "Y": curr_time.getFullYear(), 
                "M": curr_time.getMonth()+1,
                "D": curr_time.getDate(), 
                "h": curr_time.getHours(), 
                "m": curr_time.getMinutes(), 
                "s": curr_time.getSeconds()
            }

            // 判断当前提交过的条件是 1提交时间在前一天的23:59:59之后
            // 当前的23:59:59的时间戳
            const cur_day_end_t = new Date(`${curr_t.Y}-${curr_t.M}-${curr_t.D} ${day_end.h}:${day_end.m}:${day_end.s}`).getTime()
            // 当前的前一天 也就是减去60*60*24*1000
            const last_day_end_t = cur_day_end_t - 86400000
            // 如果提交时间大于等于last_day_end_t证明已提交过 否则未提交
            /*
                -#####      #
                -        # 
                -   #
            */
            // 如果已提交过
            if (req.analyz_profile.last_submit >= last_day_end_t) {
                res.json({ "state": 0, "msg": "今日已提交过任务, 等下一期吧" })
                return false
            }


            // 用户得分&&等级
            __this__._analysis_answer(req.body.answer, req.body.mission_id, req.analyz_profile.score, (result) => {
                console.log("答案解析返回 =>", result)

                if (!result) {
                    res.json({ "state": 0, "msg": "答案错误" })
                    return false
                }

                // 更新用户数据
                let PROMISE_accdata = Mongo_model_account.updateOne({  "_id": req.analyz_profile._id }, {  $set: {  "score": result.score_sum, "level": result.level, "last_submit": curr_time } })
                // 更改用户记录数据
                let PROMISE_accreco = Mongo_model_account_record.insertOne({ "account_id": req.analyz_profile._id, "mission_id": req.body.mission_id, "score": result.score, "submit_time": curr_time })
                
                Promise.all([PROMISE_accdata, PROMISE_accreco]).then((v) => {
                    console.log("用户提交返回 =>", v)
                    Mongo_model_account.findOne({ "_id": req.analyz_profile._id }).then((v1) => {
                        res.json({ "state": 1, "msg": "提交任务成功", "data": v1 })
                        return false
                    }).catch((err1) => {
                        res.json({ "state": 1, "msg": "提交任务成功但是查询问题", "data": err1 })
                        return false
                    })
                }).catch((err) => {
                    console.log("用户提交任务失败 =>", err)
                    res.json({ "state": 0, "msg": "提交任务失败" })
                    return false
                })
            })
        })
    }

    // 解析答案
    _analysis_answer (answer, mission_id, user_last_score, callback) {
        Mongo_model_mission.findOne({ "_id": mission_id }).then((v) => {

            let db_answer_arr = v.answer.split(",")
            let db_score_arr  = v.score.split(",").map((ite) => { return Number(ite) })

            if (db_answer_arr.includes(String(answer))) {
                let score = 0
                for (let i=0; i<db_answer_arr.length; i++) {
                    if (answer == db_answer_arr[i]) {
                        score = db_score_arr[i]
                        break
                    }
                }
                callback({ "score": score, "level": "", "score_sum": score + user_last_score })
                return false
            } else {
                callback(false)
                return false
            }
        }).catch((err) => {
            console.log("解析答案报错 =>", err)
            callback(false)
            return false
        })
    }
}

module.exports = Mission