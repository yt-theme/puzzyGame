const mongoose          = require("mongoose")
const Mongodb_model     = require("./model/model")
const fs                = require("fs")

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

    // 管理员数据初始化
    admin_init (Mongo_model) {
        let admin_token = fs.readFileSync(cfg.KEY_PATH + "/admin_token", "UTF-8")
        // 默认管理员
        Mongo_model.insertOne({
            "username": cfg.ADMIN_USERNAME,
            "password": cfg.ADMIN_PASSWORD,
            "operate_token": admin_token,
            "power": 0
        }).then((v) => {
            console.log("管理员帐号初始化完成 =>", v)
        }).catch((err) => {
            console.log("管理员帐号初始化失败 =>", err.code == 11000 ? "已存在" : err)
        })
    }

    // 管理员帐号模型
    Mongo_model_admin () {
        const collection_name   = "Admin"
        const collection        = "admin"
        const schema            = require("./schema/admin")(mongoose)

        return new Mongodb_model({ mongoose, schema, collection_name, collection })
    }

    // 用户帐号模型
    Mongo_model_account () {
        const collection_name   = "Account"
        const collection        = "account"
        const schema            = require("./schema/account")(mongoose)

        return new Mongodb_model({ mongoose, schema, collection_name, collection })
    }

    // 用户记录模型
    Mongo_model_account_record () {
        const collection_name   = "Account_record"
        const collection        = "account_record"
        const schema            = require("./schema/account_record")(mongoose)

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

// 管理员帐号 初始化操作
const mongo_model_admin = mongo.Mongo_model_admin()
mongo.admin_init(mongo_model_admin)

module.exports = {
    "Mongo_model_admin":            mongo_model_admin,
    "Mongo_model_account":          mongo.Mongo_model_account(),
    "Mongo_model_account_record":   mongo.Mongo_model_account_record(),
    "Mongo_model_mission":          mongo.Mongo_model_mission()
}