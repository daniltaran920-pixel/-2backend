require('dotenv').config()
const express = require ('express')
const db = require('./db')
const routes = require('./routes')
const { logger } = require('./middleware')

const app = express()

async function connection() {
    try {
        const hasTable = await db.schema.hasTable("items")
        if(!hasTable) {
            await db.schema.createTable('items', (table) => {
                table.integer('price')
                table.increments('id')
                table.string('name').unique()
            } )
            console.log('Все нужное успешно создано')
        }
    } catch (err) {
        console.log(err)
    } finally {
        console.log("Соединение с базой данных успешно установленно ")
    }

}

connection()

app.use(express.json())
app.use(logger)
app.use('/', routes)

module.exports = app
