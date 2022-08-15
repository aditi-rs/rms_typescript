/* Replace with your SQL commands */
CREATE TABLE credentials
(
    user_id  serial PRIMARY KEY,
    name     varchar(50) not null,
    email_id varchar     not null,
    password varchar     not null,
    is_archieved boolean default false
);
CREATE TYPE role_type AS ENUM ('admin', 'subadmin', 'user');
CREATE TABLE roles
(
    user_id int REFERENCES credentials (user_id),
    PRIMARY KEY (user_id,role),
    role    role_type not null,
    is_archieved boolean default false
); 
CREATE TABLE address
(
    user_id      int REFERENCES credentials (user_id),
    addr         varchar,
    PRIMARY KEY (user_id, addr),
    geopoint     point not null,
    is_archieved boolean default false
);
CREATE TABLE resturants
(
    r_id         serial PRIMARY KEY,
    res_name     varchar(50) not null,
    res_addr     varchar not null,
    geopoint     point       not null,
    is_archieved boolean default false
);
CREATE TABLE dish
(
    r_id         int REFERENCES resturants (r_id),
    dish_name    varchar,
    PRIMARY KEY (r_id, dish_name),
    is_archieved boolean default false
);
CREATE TABLE sessions
(
    user_id      int REFERENCES credentials (user_id),
    s_id         serial PRIMARY KEY,
    start_time   TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    end_time     TIMESTAMP,
    is_archieved boolean                  default false
);

