import pool from '../db';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken'
import {Request,Response,NextFunction} from 'express';

interface userDetail { 
  email_id:string,
  password:any
}

interface payload{

  id : string,
  sessionID : string,
}

interface addrDetail { 
  addr:string,
  geopoint:string
}

interface otherDetail{
  name : string,
  email_id : string,
  password : string
}


export const register = async (req : Request,res:Response,next:NextFunction) => {
  const { name, email_id, password } : otherDetail = req.body;
  const client = await pool.connect();
  try {
    await client.query("BEGIN");
    const salt = await bcrypt.genSalt();
    const hashedPassword = await bcrypt.hash(password, salt);

    let result = await client.query(
      `insert into credentials (name,email_id,password) values('${name}','${email_id}','${hashedPassword}') returning user_id`
    );
    if (result === undefined)
      return res.status(500).send("you couldnt register!");

    const newUserId = result.rows[0].user_id;
    const insertUserRole = await client.query(
      `insert into roles(user_id, role) values ('${newUserId}','user'})`
    );
    if (insertUserRole === undefined)
      return res.status(500).send("you could not add role");

    console.log("PERSON IS REGISTERED!");
    res.status(200).send({ name, email_id, password });
  } catch (err) {
    //res.status(500).send(err)
    await client.query("ROLLBACK");
    return next(err);
  } finally {
    client.release();
  }
};
export const login = async (req : Request,res:Response,next:NextFunction) => {
  const { email_id, password }: userDetail = req.body;
  const cred = await pool.query(
    `select * from credentials where email_id='${email_id}'`
  );

  if (cred.rows.length === 0) {
    return res.status(400).send("User not found");
  }
  try {
    if (await bcrypt.compare(password, cred.rows[0].password)) {
      let userID = await pool.query(
        `select user_id from credentials where email_id='${email_id}'`
      );
      let storeUserId = await pool.query(
        `insert into sessions(user_id) values ('${userID.rows[0].user_id}')`
      );
      let sessionId = await pool.query(
        `select s_id from sessions where user_id='${userID.rows[0].user_id}'`
      );
      const user_cred : payload= {
        id: cred.rows[0].user_id,
        sessionID: sessionId.rows[0].s_id,
      };

      const accessToken = jwt.sign(user_cred, process.env.ACCESS_TOKEN, {
        expiresIn: "15m",
      });
      res.json({ accessToken: accessToken });
    } else {
      res.status(401).send("Incorrect password given.");
    }
  } catch (err) {
    return next(err);
  }
}
export const address = async (req : Request,res:Response,next:NextFunction) => {
  const { addr, geopoint } : addrDetail = req.body;

  const userId = req.user.id;

  try {
    await pool.query(
      "insert into address (user_id,addr,geopoint) values($1,$2,$3) ",
      [userId, addr, geopoint]
    );
    res.status(200).send("address is successfully added");
  } catch (err) {
    //res.status(500).send(err)
    return next(err);
  }
};

export const fetchResturants = async (req : Request,res:Response,next:NextFunction) => {
  try {
    let { offset = 0, limit = 5 } = req.query;
    let result = await pool.query(
      `select res_name,res_addr,geopoint from resturants where is_archieved='false' limit ${limit} offset ${offset}`
    );
    res.status(200).send(result.rows);
  } catch (err) {
    console.log(err);
    //res.status(500).send(err)
    return next(err);
  }
};
export const fetchDishes = async (req : Request,res:Response,next:NextFunction) => {
  const r_id : string = req.params.id;
  try {
    let { offset = 0, limit = 5 } = req.query;
    let result = await pool.query(
      `select dish_name from dish where r_id='${r_id}' and is_archieved='false' limit ${limit} offset ${offset}`
    );
    res.status(200).send(result.rows);
  } catch (err) {
    //res.status(500).send(err)
    return next(err);
  }
};

export const logout = async (req : Request,res:Response,next:NextFunction) => {
  try {
    let time = moment().format();

    await pool.query("update sessions set end_time=$1 where s_id=$2", [
      time,
      req.user.sessionID,
    ]);
    res.status(200).send("logged out seccessfully");
  } catch (err) {
    return next(err);
  }
};
