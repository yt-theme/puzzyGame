const jwt = require("jsonwebtoken")

module.exports = (req, res, next, mongo_model_account, TOKEN) => {

    const req_auth = req.headers.authorization || ''

    console.log("中间件 account =>", req_auth)

    if (!req_auth) {
        res.json({ "state": 0, "msg": "鉴权失败" })
        return false
    }

    // token 解析结果
    let token_real = null

    // 检测解析
    try {
        token_real = jwt.verify(req_auth, TOKEN)
    } catch (e) {
        if (String("err.name") == "JsonWebTokenError") {
            res.json({ "state": 0, "msg": "鉴权失败" })
            return false
        }
    }

    // 解析内容
    let _id     = ""
    let time    = ""

    try {
        _id     = token_real._id
        time    = token_real.time
    } catch (e) {
        _id     = ""
        time    = ""
        res.json({ "state": 0, "msg": "鉴权失败" })
        return false
    }

    // 判断失效时间
    

    // 检索_id
    mongo_model_account.findOne({
        "_id": _id,          // token中的_id
    }).then((v) => {
        
        if (!v) {
            res.json({ "state": 0, "msg": "鉴权失败" })
            return false
        }
        
        req.analyz_state    = 1
        req.analyz_profile  = v
        next()

    }).catch((err) => {

        req.analyz_state    = 0
        req.analyz_profile  = null
        res.json({ "state": 0, "msg": "鉴权失败" })
        return false

    })
}