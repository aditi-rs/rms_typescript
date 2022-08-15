import pool from '../db';
import express from 'express'
const router = express.Router();


import {login,addDish,addResturant,createUser,createSubadmin,fetchUser, fetchSubadmin,fetchAddress} from '../controller/admin'

import { checkAdmin } from '../middleware/checkAdmin'
import {authenticateToken} from '../middleware/index'

import {validateRegister,validatelogin,validateAddress,validateDish,validateResturant} from '../middleware/validate'


router.post("/login", validatelogin, login);
router.post(
  "/add-resturant",
  validateResturant,
  authenticateToken,
  checkAdmin,
  addResturant
);
router.post(
  "/:id/add-dish",
  validateDish,
  authenticateToken,
  checkAdmin,
  addDish
);
router.post(
  "/create-subadmin",
  validateRegister,
  authenticateToken,
  checkAdmin,
  createSubadmin
);
router.post(
  "/create-user",
  validateRegister,
  authenticateToken,
  checkAdmin,
  createUser
);
router.post(
  "/fetch-subadmin",
  authenticateToken,
  checkAdmin,
  fetchSubadmin
);
router.post("/fetch-user", authenticateToken, checkAdmin, fetchUser);
router.post(
  "/fetch-address",
  authenticateToken,
  checkAdmin,
  fetchAddress
);

export default router
