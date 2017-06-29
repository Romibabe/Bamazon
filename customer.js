var mysql = require("mysql");
var Table = require("cli-table");
var inquirer = require("inquirer");
var colors = require('colors');
var keys = require("./keys.js");   //where my password is stored  
var orderTotal = 0;



var connection = mysql.createConnection({
    host     : 'localhost',
    port     :  3306,
    user     : 'root',                      //change to your user name if it is not root
    password : "",          //change to your password or set up a keys.js file
    database : 'bamazon'                    
});



connection.connect(function(err) {          //set up connection
    if (err) throw err;
    
});

//function that displays the name of the store
function logTitle() {
 
   

	console.log("");
	console.log(colors.green('_______________________________________________________________________________________________________'));
	console.log("");
  console.log(colors.green("-------------------------------------------------Bamazon Super Mart------------------------------------"));
	 
	console.log("");
	console.log(colors.green('_______________________________________________________________________________________________________'));
	console.log("");
}

logTitle();

//function that prints a table of current items available
function showItemTable() {
    connection.query('SELECT * FROM products', function(err, results) {  //query all from the products table
            if (err) throw err;
            var table = new Table({   //instantiate a new table
                head: [colors.cyan('id'), colors.cyan('item'), colors.cyan('price'), colors.cyan('quantity')],
                colWidths: [5, 70, 13, 10]
            });
            for (var i = 0; i < results.length; i++){   //loop through all records of the db table
            table.push(   //push each record from the db table to the cli table
                [(JSON.parse(JSON.stringify(results))[i]["item_id"]), (JSON.parse(JSON.stringify(results))[i]["product_name"]),
                ("$ "+JSON.parse(JSON.stringify(results))[i]["price"]), (JSON.parse(JSON.stringify(results))[i]["stock_quantity"])]);
  			}
        console.log(colors.green('_______________________________________________________________________________________________________'));
        console.log("\n" + table.toString());  //prints the constructed cli-table to screen
        console.log(colors.green('_______________________________________________________________________________________________________'));
        console.log("");
    });
}

showItemTable();

//function to run through a customer purchase
function customerBuy(){
	inquirer.prompt([
			{
			  type: 'input',
			  message: 'What is the id # of the item you would like to purchase?',
			  name: 'itemID',
        validate: function(value) {       //validation to make sure user enters a number
          if (isNaN(value) === false) {
            return true;
          }
          return false;
        }
			},
			{
			  type: 'input',
			  message: 'What is the quantity you would like to buy?',
			  name: 'quantity',
        validate: function(value) {      //validation to make sure user enters a number
          if (isNaN(value) === false) {
            return true;
          }
          return false;
        }
			}
		])
  .then(function(answer){
      var itemID = answer.itemID;            //store the users answer of id # as var itemID
			var quantity = answer.quantity;			   //store the users answer of purchase qty as var quantity
      //connect to db and select the record from products table with an item_id = the user answer
			connection.query('SELECT * FROM products WHERE item_id=?', [itemID], function(err, results){
				if (err) throw err;
				var stock_quantity = results[0].stock_quantity;           //store the stock qty of the record queried as var stock_quantity
				if (stock_quantity < quantity) {                          //if user orders more than available qty screen show appropriate message
					console.log(colors.red("Sorry, we don't have the stock to fill that request. Please order at or below the quantity listed"));
          setTimeout(customerBuy, 1000);                          //recall the CustomerBuy function
				} else{                                                   //if user order quantity can be fullfilled...
					stock_quantity -= quantity;                             //subtract the users purchase qty from the store stock qty

          var totalPrice = quantity * results[0].price;           //store the totalPrice by multiplying quantity by the price of record queried
					var totalSales = totalPrice + results[0].product_sales; //get and store the totalSales by adding totalPrice and the product_sales of record queried
					var department = results[0].department_name;            //store the department of the record queried as var department

          console.log(colors.cyan("\nYour line item total on this product: $" + (quantity * results[0].price).toFixed(2)));  //print the order total $ to the user

          orderTotal += (parseFloat(totalPrice));                 //add the product line price to the total order price to use in update message
          console.log(colors.cyan("\nYour order total of all products this session: ") + colors.yellow("$"+orderTotal.toFixed(2))+"\n");

          //connect to db and update the stock_quantity to the post order qty
          connection.query('UPDATE products SET ? WHERE item_id=?', [{stock_quantity: stock_quantity}, itemID], function(err, results){
						if (err) throw err;
					});
          

          //nested inquirer to keep the customer ordering
          inquirer.prompt([
            {
              type: "confirm",
              message: "Would you like to order another item?",
              name: "yesOrNo",
              default: true
            }
          ]).then(function(data) {
					       if (data.yesOrNo) {  //if the answer is true then...
                   showItemTable();   // show item table for refrence
                   setTimeout(customerBuy, 1500); //recall the customerBuy function
                 } else {  //if the answer is no.....
                   console.log(colors.green("Thank you for using Bamazon")); //goodbye message
                   process.exit(0);  //ends the app processes and exits to command prompt
                 }
          });
				}
			});
		});
}


setTimeout(customerBuy, 500); // calls the customerBuy function giving time for the list to print.
