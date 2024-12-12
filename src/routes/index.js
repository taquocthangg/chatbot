import auth from "./auth.routes"
import bot from "./bot.routes"
import user from "./user.routes"

const initRoutes = (app) => {

    app.use('/api/v1/auth', auth)
    app.use('/api/v1/bot', bot)
    app.use('/api/v1/user', user)

    return app.use('/', (req, res) => {
        return res.send('Webcome to chatbot api v1')
    })
}

module.exports = initRoutes
