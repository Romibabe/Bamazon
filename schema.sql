CREATE DATABASE Bamazon;
USE Bamazon;

CREATE TABLE products (
	item_id INT AUTO_INCREMENT,
	product_name VARCHAR(35) NOT NULL,
	department_name VARCHAR(25) NOT NULL,
	price DECIMAL(10, 2),
	stock_quantity INT(5),
	PRIMARY KEY (item_id)
);

CREATE TABLE departments(
	department_id INTEGER(11) AUTO_INCREMENT NOT NULL primary key,
    department_name VARCHAR(30) NOT NULL,
    over_head_costs DECIMAL(10,2) NOT NULL,
    total_sales DECIMAL(10,2) NOT NULL
);