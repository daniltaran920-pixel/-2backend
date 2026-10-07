const app = require('./app')
const PORT = process.env.PORT

app.listen(PORT, () => {
    console.log(`Сервер запущен на порте ${PORT}`)
})
