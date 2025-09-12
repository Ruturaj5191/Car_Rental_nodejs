var express=require("express");
var bodyparser=require("body-parser");
var upload=require("express-fileupload");
var session=require("express-session");
var user_routes=require("./routes/user_routes")
var admin_routes=require("./routes/admin_routes");
var app=express();

app.use(bodyparser.urlencoded({extended:true}));
app.use(upload());
app.use(session({
    secret:"ruturaj",
    resave:false,
    saveUninitialized:false,
    cookie:{maxAge:1000*60*60}
}));
app.use(express.static("public"));

app.use("/",user_routes);
app.use("/admin",admin_routes);
// app.use("/api",api_routes);

app.listen(1000);