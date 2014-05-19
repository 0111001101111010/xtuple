#Postgres Object Relational Map System

##Use

PRE 4_5_X
In order to use any of the functionality provided by this project you must run the following sql statement: `select xt.js_init();`

POST
xt.js_init() is called as a plv8.start_proc function and no longer required to be called.


The main purpose of this project is to provide an Object Relational Map (ORM) structure and APIs to retreive and manipulate records as json objects, and to make function calls on the database.
