"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
const pool = require("../db");
const express = require("express");
require("dotenv").config();
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
module.exports.login = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const { email_id, password } = req.body;
    const cred = yield pool.query(`select * from credentials where email_id='${email_id}'`);
    let role_type = yield pool.query(`select * from roles where user_id='${cred.rows[0].user_id}' and role ='subadmin'`);
    if (role_type.rows.length == 0) {
        return res.status(403).send("You are not subadmin");
    }
    if (cred.rows.length === 0) {
        return res.status(400).send("Subadmin not found");
    }
    try {
        if (yield bcrypt.compare(password, cred.rows[0].password)) {
            let userID = yield pool.query(`select user_id from credentials where email_id='${email_id}'`);
            let storeUserId = yield pool.query(`insert into sessions(user_id) values ('${userID.rows[0].user_id}')`);
            let sessionId = yield pool.query(`select s_id from sessions where user_id='${userID.rows[0].user_id}'`);
            const newUserId = userID.rows[0].user_id;
            console.log(newUserId);
            //const insertUserRole = await pool.query(`insert into roles(user_id, role) values (${userID.rows[0].user_id},'subadmin')returning role`)
            const user_cred = {
                id: cred.rows[0].user_id,
                sessionID: sessionId.rows[0].s_id,
                role: role_type.rows[0].role,
            };
            const accessToken = jwt.sign(user_cred, process.env.ACCESS_TOKEN, {
                expiresIn: "15m",
            });
            res.json({ accessToken: accessToken });
        }
        else {
            res.status(401).send("Incorrect password given!");
        }
    }
    catch (err) {
        return next(err);
    }
});
module.exports.addResturant = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const { res_name, res_addr, geopoint } = req.body;
    const userId = req.user.id;
    try {
        yield pool.query(`insert into resturants (user_id,res_name,res_addr,geopoint) values ('${userId}','${res_name}','${res_addr}','${geopoint}')`);
        res.status(200).send("Resturant has been added!");
    }
    catch (err) {
        return next(err);
    }
});
module.exports.addDish = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const dish_name = req.body;
    const r_id = req.params.id;
    const userId = req.user.id;
    try {
        yield pool.query(`insert into dish(r_id,dish_name,user_id) values ('${r_id}','${dish_name}', ${userId})`);
        res.status(200).send("Dish has been added!");
    }
    catch (err) {
        return next(err);
    }
});
module.exports.fetchUser = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        let result = yield pool.query(`select name,email_id from credentials inner join roles on credentials.user_id=roles.user_id where roles.role ='user'and is_archieved='false'`);
        res.status(200).send(result);
    }
    catch (err) {
        return next(err);
    }
});
module.exports.createUser = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const { name, email_id, password } = req.body;
    const userId = req.user.id;
    try {
        const salt = yield bcrypt.genSalt();
        const hashedPassword = yield bcrypt.hash(password, salt);
        let result = yield pool.query(`insert into credentials (name,email_id,password,created_by) values('${name}','${email_id}','${hashedPassword}','${userId}') returning user_id`);
        //.catch(() => {
        //res.send('User already exists!')
        //})
        if (result === undefined)
            return;
        const newUserId = result.rows[0].user_id;
        //console.log(newUserId)
        const insertUserRole = yield pool.query(`insert into roles(user_id, role) values ('${newUserId}','user')`);
        //.catch(() =>{
        //res.send('Error occured. Try again.')
        //})
        if (insertUserRole === undefined)
            return;
        console.log("USER IS CREATED!");
        res.status(200).send({ name, email_id, password });
    }
    catch (err) {
        return next(err);
    }
});
module.exports.logout = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        let time = moment().format();
        let endtime_val = yield pool.query("update sessions set end_time=$1 where s_id=$2", [time, req.user.sessionID]);
        res.status(200).send("logged out seccessfully");
    }
    catch (err) {
        return next(err);
    }
});
