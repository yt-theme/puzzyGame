module.exports = (mongoose) => {
    return mongoose.Schema({
        // 任务_id
        mission_id:         { type: String, require: true },
        // 用户_id
        account_id:         { type: String, require: true },
        // 分数
        score:              { type: Number, default: 0 },
        // 提交时间戳
        submit_time:        { type: Number, default: 0 },
    })
}