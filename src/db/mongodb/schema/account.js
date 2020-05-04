const bcrypt = require("bcrypt")

module.exports = (mongoose) => {
    return mongoose.Schema({
        // 用户名
        username: { type: String, require: true, unique: true },
        // 密码
        password: { type: String, require: true,
            // 密码加密存储
            set (val) { return bcrypt.hashSync(val, 10) }
        },
        // 用户提交任务口令 每次用户密码登录之后刷新
        var_token: { type: String }
    })
}