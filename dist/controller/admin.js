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
const pool = Promise.resolve().then(() => require("../db"));
const express = Promise.resolve().then(() => require("express"));
Promise.resolve().then(() => require("dotenv")).config();
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
module.exports.login = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const { email_id, password } = req.body;
    const cred = yield pool.query(`select * from credentials where email_id='${email_id}'`);
    let role_type = yield pool.query(`select * from roles where user_id='${cred.rows[0].user_id}' and role ='admin'`);
    if (role_type.rows.length == 0) {
        return res.status(403).send("You are not admin");
    }
    if (cred.rows.length === 0) {
        return res.status(400).send("Admin not found");
    }
    try {
        if (yield bcrypt.compare(password, cred.rows[0].password)) {
            let userID = yield pool.query(`select user_id from credentials where email_id='${email_id}'`);
            yield pool.query(`insert into sessions(user_id) values ('${userID.rows[0].user_id}')`);
            let sessionId = yield pool.query(`select s_id from sessions where user_id='${userID.rows[0].user_id}'`);
            const user_cred = {
                id: cred.rows[0].user_id,
                sessionID: sessionId.rows[0].s_id,
                role: role_type.rows[0].role,
            };
            const accessToken = jwt.sign(user_cred, process.env.ACCESS_TOKEN, {
                expiresIn: "15m",
            });
            res.status(200).json({ accessToken: accessToken, message: "good" });
        }
        else {
            res.status(401).send("Incorrect password given.");
        }
    }
    catch (err) {
        return next(error);
    }
});
module.exports.addResturant = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const { res_name, res_addr, geopoint } = req.body;
    const userId = req.user.id;
    try {
        yield pool.query(`insert into resturants(user_id,res_name,res_addr,geopoint) values ('${userId}','${res_name}','${res_addr}','${geopoint}')`);
        res.status(200).send("resturant address is added successfuly");
    }
    catch (err) {
        //res.status(500).send(err)
        return next(error);
    }
});
module.exports.addDish = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const { dish_name } = req.body;
    const r_id = req.params.id;
    const userId = req.user.id;
    console.log(dish_name);
    console.log(r_id);
    console.log(userId);
    try {
        yield pool.query(`insert into dish(r_id,dish_name,user_id) values ('${r_id}','${dish_name}', ${userId})`);
        res.status(200).send("Dish is added successfuly");
    }
    catch (err) {
        return next(error);
    }
});
module.exports.createSubadmin = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const { name, email_id, password } = req.body;
    const userId = req.user.id;
    try {
        let checkExistence = yield pool.query(`select * from credentials where user_id='${userId}'`);
        if (checkExistence === 0) {
            const salt = yield bcrypt.genSalt();
            const hashedPassword = yield bcrypt.hash(password, salt);
            let result = yield pool.query(`insert into credentials (name,email_id,password,created_by) values('${name}','${email_id}','${hashedPassword}','${userId}') returning user_id`);
            console.log(result);
            if (result === undefined)
                return res.status(500).send("couldnt create something went wrong!");
            const newUserId = result.rows[0].user_id;
            console.log(newUserId);
            const insertUserRole = yield pool.query(`insert into roles(user_id, role) values ('${newUserId}','subadmin')`);
            if (insertUserRole === undefined)
                return res
                    .status(500)
                    .send("couldnt insert role. Something went wrong!");
            console.log("SUBADMIN IS CREATED!");
            res.status(200).send({ name, email_id, password });
        }
        else {
            let checkRole = yield pool.query(`select * from roles where user_id='${userId}'`);
            if (checkRole.rows[0].role != "subadmin") {
                const insertUserRole = yield pool.query(`insert into roles(user_id, role) values ('${userId}','subadmin')`);
                if (insertUserRole === undefined)
                    return res
                        .status(500)
                        .send("couldnt insert role. Something went wrong!");
                console.log("SUBADMIN IS CREATED!");
                res.status(200).send({ name, email_id, password });
            }
        }
    }
    catch (err) {
        //res.status(500).send(err)
        return next(err);
    }
});
module.exports.createUser = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const { name, email_id, password } = req.body;
    const userId = req.user.id;
    try {
        let checkExistence = yield pool.query(`select * from credentials where email_id='${email_id}'`);
        console.log(checkExistence);
        if (checkExistence.rows.length === 0) {
            const salt = yield bcrypt.genSalt();
            const hashedPassword = yield bcrypt.hash(password, salt);
            let result = yield pool.query(`insert into credentials (name,email_id,password,created_by) values('${name}','${email_id}','${hashedPassword}','${userId}') returning user_id`);
            console.log(result);
            if (result === undefined)
                return res.status(500).send("couldnt create something went wrong!");
            const newUserId = result.rows[0].user_id;
            console.log(newUserId);
            const insertUserRole = yield pool.query(`insert into roles(user_id, role) values ('${newUserId}','user')`);
            if (insertUserRole === undefined)
                return res
                    .status(500)
                    .send("couldnt insert role. Something went wrong!");
            console.log("USER IS CREATED!");
            res.status(200).send({ name, email_id, password });
        }
        else {
            res.send("already exists");
        }
    }
    catch (err) {
        //res.status(500).send(err)
        return next(err);
    }
});
module.exports.fetchSubadmin = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        let result = yield pool.query(`select name,email_id from credentials inner join roles on credentials.user_id=roles.user_id where roles.role ='subadmin'and is_archieved='false'`);
        res.status(200).send(result);
    }
    catch (err) {
        //console.log(err)
        //res.status(500).send(err)
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
module.exports.fetchAddress = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const user_id = req.params.id;
    try {
        let result = yield pool.query(`select addr,geopoint from address where user_id='${user_id}'`);
        res.status(200).send(result);
    }
    catch (err) {
        return next(err);
    }
});
module.exports.logout = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        let time = moment().format();
        yield pool.query("update sessions set end_time=$1 where s_id=$2", [
            time,
            req.user.sessionID,
        ]);
        res.status(200).send("logged out seccessfully");
    }
    catch (err) {
        //res.status(403).send('cannot logout, check again.')
        //console.log(err)
        return next(err);
    }
});
