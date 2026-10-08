const express = require('express')
const JWT_SECRET = process.env.JWT_SECRET
const router = express.Router()
const db = require('./db')
const { logger } = require('./middleware')
const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')
const { authMiddleware, checkRole, ROLES } = require('./middleware')


router.get(('/items'),  async (req, res,) => { //посмотреть
    const items = await db('items')
    return res.status(200).json(items)
})

router.post('/addItem', authMiddleware, checkRole([ROLES.ADMIN]),async (req, res) => { //добавить предмет в список всех предметов
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


router.delete(('/deleteItem'), authMiddleware, checkRole([ROLES.ADMIN, ROLES.SUPERADMIN]), async (req, res) => {// удалить
    try{
        const { id } = req.body
        if(!id) return res.status(400).json({message: "Товара с таким ID не существует"})
        const deletedItem = await db('items').where({ id }).del()

        return res.status(201).json({message: `Товар с ID ${id} успешно удален`})
    
    } catch (err) {
        console.log(error)
    }
})


router.post(('/change'), authMiddleware, checkRole([ROLES.ADMIN, ROLES.SUPERADMIN]),async (req, res) => { // изменить товар
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

// // регистрация
router.post('/auth/register', async (req, res) => {
  try {
    const { email, password } = req.body

    if (!email || !password) {
      return res.status(400).json({ message: 'Email и пароль должны быть заполнены' })
    }

    const existingUser = await db('users').where({ email }).first()
    if (existingUser) {
      return res.status(400).json({ message: 'Пользователь с такой почтой уже создан' })
    }

    const hashPassword = await bcrypt.hash(password, 10)

    await db('users').insert({
      email: email,
      password: hashPassword
    })

    return res.status(201).json({ message: 'Пользователь успешно создан' })
  } catch (err) {
    console.log(err)
    return res.status(500).json({ message: 'Ошибка сервера при регистрации' })
  }
})

// // логин
router.post('/auth/login', async (req, res) => {
  try {
    const { email, password } = req.body

    if (!email || !password) {
      return res.status(400).json({ message: 'Оба поля не должны быть пустыми' })
    }

    const user = await db('users').where({ email }).first()
    if (!user) {
      return res.status(404).json({ message: 'Пользователь с такой почтой не найден' })
    }

    const isCorrect = await bcrypt.compare(password, user.password)
    if (!isCorrect) {
      return res.status(400).json({ message: 'Неверный пароль или email' })
    }

    const token = jwt.sign(
      {
        id: user.id,
        role: user.role
      },
      JWT_SECRET,
      { expiresIn: '72h' }
    )

    return res.status(200).json({
      message: 'Вход успешно выполнен',
      token: token
    })

  } catch (err) {
    console.log(`Ошибка: ${err}`)
    return res.status(500).json({ message: 'Ошибка сервера при входе' })
  }
})




module.exports = router;
