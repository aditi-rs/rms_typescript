import pool from '../db';
import express from 'express'
const router = express.Router();


import {login,addDish,addResturant,createUser, fetchUser} from '../controller/subadmin'

import { checksubAdmin } from '../middleware/checkSubAdmin'
import {authenticateToken} from '../middleware/index'
import {validateRegister,validatelogin,validateAddress,validateDish,validateResturant} from '../middleware/validate'


router.post('/login', validatelogin, login)
router.post('/add-resturant',validateResturant, authenticateToken, checksubAdmin, addResturant)
router.post('/:id/add-dish', validateDish,authenticateToken, checksubAdmin, addDish)
router.post('/create-user', validatelogin, authenticateToken, checksubAdmin, createUser)
router.post('/fetch-user', authenticateToken, checksubAdmin, fetchUser)





export default router;
