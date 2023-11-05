CREATE TABLE user(
    id INTEGER PRIMARY KEY AUTO_INCREMENT,
    name VARCHAR(250) NOT NULL,
    contactNumber VARCHAR(250) NOT NULL,
    email VARCHAR(50) NOT NULL,
    password VARCHAR(250) NOT NULL,
    status VARCHAR(50),
    role VARCHAR(50),
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    UNIQUE(email)
);

insert into user(name, contactNumber, email, password, status, role) values ('admin', '0041796843096', 'wboulhazayez@gmail.com', 'hagoromo12', 'true', 'admin');
insert into user(name, contactNumber, email, password, status, role) values ('Em', '', 'w@gmail.com', '123', 'false', 'user');