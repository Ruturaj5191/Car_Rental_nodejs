var mysql=require("mysql");
var util=require("util");


var conn=mysql.createConnection({
    "user":"root",
    "password":"",
    "host":"localhost",
    "database":"carrental_node",
});

var exe=util.promisify(conn.query).bind(conn);

module.exports=exe;
