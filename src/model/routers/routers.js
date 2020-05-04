const cfg = require("../../../config")

class Routers {
    constructor ({ app, router }) {
        this.app        = app
        this.router     = router

        this.init()
    }

    init () {
        const app       = this.app
        const router    = this.router

        app.all('*', (req, res, next) => {
            res.header('Access-Control-Allow-Origin', '*')
            res.header('Access-Control-Allow-Methods', 'GET,HEAD,OPTIONS,POST,PUT')
            res.header('Access-Control-Allow-Headers', 'Content-Type, Content-Length, Authorization, Accept, X-Requested-With , authorization')
            res.header('Access-Control-Allow-Credentials', true)
            next()
        })

        app.use("/", router)



        // #############################################################
        //                          用户帐号
        // #############################################################
        const account_route = new (require("./routes/account"))(router)
        // 注册 /yummy/register
        account_route.register()
        // 登录 /yummy/login
        account_route.login()
        // 检查登录 /yummy/checklogin
        account_route.checklogin()



        // #############################################################
        //                          任务
        // #############################################################
        // // 任务提交
        const mission_route = new (require("./routes/mission"))(router)
        // 新增 /yummy/missionadd
        mission_route.mission_add()
        // 检索最新 /yummy/missionquerylast
        mission_route.query_last()



        // #############################################################
        //                          帐号管理
        // #############################################################
        // // 用户管理
        // const manager_route = new (require("./routes/manager"))(router)
    }
}


module.exports = Routers