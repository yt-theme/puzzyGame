const mongoose          = require("mongoose")
const Mongodb_model     = require("./model/model")

// 配置文件
const cfg               = require("../../../config")

class Mongo {
    constructor () {
        mongoose.set("useCreateIndex", true)
    }

    connect(callback) {
        mongoose.connect(
            `mongodb://${cfg.MONGODB_URL}:${cfg.MONGODB_PORT}/${cfg.MONGODB_DBNAME}`,
            { 
                "useNewUrlParser": true,
                "useUnifiedTopology": true
            },
            (err) => {
                if (err) {
                    console.log("mongodb连接失败 =>", err)
                    return false
                }
                console.log("mongodb连接成功 =>")

                callback && callback()
            }
        )
    }

    // 帐号模型
    Mongo_model_account () {
        const collection_name   = "Account"
        const collection        = "account"
        const schema            = require("./schema/account")(mongoose)

        return new Mongodb_model({ mongoose, schema, collection_name, collection })
    }

    // 任务模型
    Mongo_model_mission () {
        const collection_name   = "Mission"
        const collection        = "mission"
        const schema            = require("./schema/mission")(mongoose)

        return new Mongodb_model({ mongoose, schema, collection_name, collection })
    }
}

const mongo = new Mongo()
mongo.connect()

module.exports = {
    "Mongo_model_account": mongo.Mongo_model_account(),
    "Mongo_model_mission": mongo.Mongo_model_mission()
}