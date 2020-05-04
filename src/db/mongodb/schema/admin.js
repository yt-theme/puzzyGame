const bcrypt = require("bcrypt")

module.exports = (mongoose) => {
    return mongoose.Schema({
        // 用户名
        username:       { type: String, require: true, unique: true },
        // 密码
        password:       { type: String, require: true,
                            // 密码加密存储
                            set (val) { return bcrypt.hashSync(val, 10) }
                        },
        // 管理员操作token
        operate_token:  { type: String, require: true },
        // 管理员权限 0上帝有删除权限 1普通管理员无删除权限
        power:          { type: Number, require: true }
    })
}