const express = require("express")
const router = express.Router()
const bodyParser = require("body-parser")

// 配置文件
const cfg = require("./config")

// 路由模型
const Router_model = require("./src/model/routers/routers")
// 数据库模型

class Server {
    constructor () {
        this.express = express
        this.router  = router
        this.app     = this.express()

        this.init()
    }

    // 初始化配置
    init () {
        // 服务器
        this.http_server = require("http").createServer(this.app)
        
        // express解析params
        this.app.use(bodyParser.json())
        this.app.use(bodyParser.urlencoded({ extended: false }))

        // 前端目录
        this.app.use("/frontend", this.express.static(cfg.FRONTEND_PATH))
        // 网站首页目录
        this.app.use("/", this.express.static(cfg.INDEX_PATH))
        // 上传目录
        this.app.use("/" + cfg.UPLOAD, this.express.static(cfg.UPLOAD_PATH))

        // 路由初始化
        new Router_model({ "app": this.app, "router": this.router })
    }

    // 启动
    start () {
        this.http_server.listen(cfg.HTTP_PORT, function () {
            console.log("server start =>", cfg.HTTP_PORT)
        })
    }
}

new Server().start()