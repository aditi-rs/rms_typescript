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
const moment = require("moment");
module.exports.register = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const { name, email_id, password } = req.body;
    const client = yield pool.connect();
    try {
        yield client.query("BEGIN");
        const salt = yield bcrypt.genSalt();
        const hashedPassword = yield bcrypt.hash(password, salt);
        let result = yield client.query(`insert into credentials (name,email_id,password) values('${name}','${email_id}','${hashedPassword}') returning user_id`);
        if (result === undefined)
            return res.status(500).send("you couldnt register!");
        const newUserId = result.rows[0].user_id;
        const insertUserRole = yield client.query(`insert into roles(user_id, role) values ('${newUserId}',${ROLE_USER})`);
        if (insertUserRole === undefined)
            return res.status(500).send("you could not add role");
        console.log("PERSON IS REGISTERED!");
        res.status(200).send({ name, email_id, password });
    }
    catch (err) {
        //res.status(500).send(err)
        yield client.query("ROLLBACK");
        return next(err);
    }
    finally {
        client.release();
    }
});
module.exports.login = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const { email_id, password } = req.body;
    const cred = yield pool.query(`select * from credentials where email_id='${email_id}'`);
    if (cred.rows.length === 0) {
        return res.status(400).send("User not found");
    }
    try {
        if (yield bcrypt.compare(password, cred.rows[0].password)) {
            let userID = yield pool.query(`select user_id from credentials where email_id='${email_id}'`);
            let storeUserId = yield pool.query(`insert into sessions(user_id) values ('${userID.rows[0].user_id}')`);
            let sessionId = yield pool.query(`select s_id from sessions where user_id='${userID.rows[0].user_id}'`);
            const user_cred = {
                id: cred.rows[0].user_id,
                sessionID: sessionId.rows[0].s_id,
            };
            const accessToken = jwt.sign(user_cred, process.env.ACCESS_TOKEN, {
                expiresIn: "15m",
            });
            res.json({ accessToken: accessToken });
        }
        else {
            res.status(401).send("Incorrect password given.");
        }
    }
    catch (err) {
        return next(err);
    }
});
module.exports.address = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const { addr, geopoint } = req.body;
    const userId = req.user.id;
    try {
        yield pool.query("insert into address (user_id,addr,geopoint) values($1,$2,$3) ", [userId, addr, geopoint]);
        res.status(200).send("address is successfully added");
    }
    catch (err) {
        //res.status(500).send(err)
        return next(err);
    }
});
module.exports.fetchResturants = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        let { offset = 0, limit = 5 } = req.query;
        let result = yield pool.query(`select res_name,res_addr,geopoint from resturants where is_archieved='false' limit ${limit} offset ${offset}`);
        res.status(200).send(result.rows);
    }
    catch (err) {
        console.log(err);
        //res.status(500).send(err)
        return next(err);
    }
});
module.exports.fetchDishes = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const r_id = req.params.id;
    try {
        let { offset = 0, limit = 5 } = req.query;
        let result = yield pool.query(`select dish_name from dish where r_id='${r_id}' and is_archieved='false' limit ${limit} offset ${offset}`);
        res.status(200).send(result.rows);
    }
    catch (err) {
        //res.status(500).send(err)
        return next(err);
    }
});
module.exports.logout = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        // let now = moment();
        // let time = now.date() + now.hour() + ':' + now.minutes() + ':' + now.seconds();
        // time = time + ((now.hour()) >= 12 ? ' PM' : ' AM');
        // console.log(time)
        let time = moment().format();
        yield pool.query("update sessions set end_time=$1 where s_id=$2", [
            time,
            req.user.sessionID,
        ]);
        res.status(200).send("logged out seccessfully");
    }
    catch (err) {
        return next(err);
    }
});
