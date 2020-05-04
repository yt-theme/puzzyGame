module.exports = (mongoose) => {
    return mongoose.Schema({
        /*
            任务数据
        */
        // 时间戳
        time:       { type: Number, require: true },
        // 标题
        title:      { type: String, require: true },
        // 正文
        article:    { type: String, require: true },
        // 答案表 逗号分隔: 000,123
        answer:     { type: String, require: true },
        // 分数表 逗号分隔 分数值与答案表对应: 50,100
        score:      { type: String, require: true },
        // 附加文件 逗号分隔 存储域名之后的路径: upload/aaa.jpg,upload/bbb.jpg
        files:      { type: String }
    })
}