const jwt = require('jsonwebtoken')
const JWT_SECRET = process.env.JWT_SECRET

const ROLES = {
  USER: 'user',
  ADMIN: 'admin',
  SUPERADMIN: 'superadmin'
};


function logger(req, res, next){
    console.log(`[${req.method}] - [${req.url}]`)
    next()
}

function authMiddleware(req, res, next){
    const authHeader = req.headers['authorization']
    const token = authHeader && authHeader.split(' ')[1]

    if(!token) return res.status(401).json({message : 'Доступ запрещен. Вы не авторизированы'})

    try{
    
        const decoded = jwt.verify(token, JWT_SECRET)
        req.user = decoded
        next()
    } catch (err) {
        console.log(err)
    }
}

function checkRole(allowedRoles){
    return (req, res, next) => {
        if(!allowedRoles.includes(req.user.role)){
            return res.status(403).json("У вас нет прав на выполнение этого действие")
        }
        next()
    }
}

module.exports = {
    logger,
    authMiddleware,
    checkRole,
    ROLES
}