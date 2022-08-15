import pool from '../db';
import express from 'express'
const router = express.Router();


import {register, login, address,fetchDishes,fetchResturants,logout} from '../controller/user'
import {authenticateToken} from '../middleware/index'
import {validateRegister,validatelogin,validateAddress,validateDish,validateResturant} from '../middleware/validate'


router.post('/register', validateRegister, register)
router.post('/login',validatelogin, login)
router.post('/address',validateAddress, authenticateToken,address)
router.get('/fetch-resturants', authenticateToken, fetchResturants)
router.get('/:id/fetch-dishes', authenticateToken, fetchDishes)
router.post('/logout', authenticateToken, logout)

module.exports = router
