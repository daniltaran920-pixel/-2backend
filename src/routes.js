const express = require('express')
const router = express.Router()
const db = require('./db')
const { logger } = require('./middleware')
const { route } = require('./app')

router.get(('/items'), async (req, res,) => {
    const items = await db('items')
    return res.status(200).json(items)
})

router.post('/addItem', async (req, res) => { //добавить предмет в список всех предметов
    try {
        const { name, price } = req.body
        if (!name || !price) {
            return res.status(400).json({ message: 'Заполните все поля' })
        }
        const existingItem = await db('items').where({ name }).first()
        if (existingItem) {
            return res.status(400).json({ message: 'Товар с таким именем уже есть' })
        }
        await db('items').insert({ name, price })
        return res.status(201).json({ message: 'Товар успешно добавлен' })
    } catch (err) {
        console.error(err)
        return res.status(500).json({ message: 'Внутренняя ошибка сервера' })
    }
})


router.delete(('/deleteItem'), async (req, res) => {
    try{
        const { id } = req.body
        if(!id) return res.status(400).json({message: "Товара с таким ID не существует"})
        const deletedItem = await db('items').where({ id }).del()

        return res.status(201).json({message: `Товар с ID ${id} успешно удален`})
    
    } catch (err) {
        console.log(error)
    }
})


router.post(('/change'), async (req, res) => {
    const { name, price, id} = req.body
    if(!id) return res.status(400).json('Введите ID')

    try{

        const updateCount = await db('items')
            .where({ id })
            .update({ name, price })

        if(updateCount === 0) {
            return res.status(404).json('Товара с таким ID не существует')
        }
        return res.status(200).json(`Товар с ID ${id} успешно изменен`)

    } catch (err) {
        console.log(err)
        return res.status(500).json('Ошибка сервера при обновление товара')
    }
})



module.exports = router;
