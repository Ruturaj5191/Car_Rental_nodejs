var express=require("express");
var router=express.Router();
var exe=require("../db");
const session = require("express-session");


function verfylogin(req,res,next){
    if(req.session && req.session.user_id){
        next();
    }
    else{
        res.redirect("/login");
    }
}



router.get("/", verfylogin,async function (req, res) {

  var sql = `SELECT * FROM cars`;
  var sql1 = `SELECT * FROM blog`;
  var sql2=`select COUNT(car_name) as car_count from cars`;
  var sql3=`select COUNT(user_name) as user_count from users`;
  var cars_info = await exe(sql);
  var blog_info = await exe(sql1);
  var car_count=await exe(sql2);
  var user_count=await exe(sql3);


  for (let car of cars_info) {
    if (car.is_booked && car.booked_at) {
      const now = new Date();
      const bookedTime = new Date(car.booked_at);
      const diffHours = (now - bookedTime) / (1000 * 60 * 60); // hours

      if (diffHours >= 24) {
        // Free the car
        await exe(
          "UPDATE cars SET is_booked = 0, booked_at = NULL WHERE car_id = ?",
          [car.car_id]
        );
      }
    }
  }

  cars_info = await exe(sql);

  var obj = {
    cars_info: cars_info,
    blog_info: blog_info,
    car_count:car_count[0].car_count,
    user_count:user_count[0].user_count,
    session: req.session,
  };
  res.render("user/home.ejs", obj);
});


router.get("/login",function(req,res){
    res.render("user/login.ejs",{"session":req.session});
});

router.post("/save_login",async function(req,res){
    var d=req.body;
    var sql=`select * from users where (user_email='${d.user_email}' OR user_mobile='${d.user_email}') AND user_password='${d.user_password}'`;
    var data=await exe(sql);
    
    if(data.length>0){
        req.session.user_id=data[0].user_id;
        res.redirect("/")
    }else{
        res.redirect("/login")
    }
});

router.get("/logout",function(req,res){
    req.session.destroy();
    res.redirect("/login");
});

router.get("/registration",function(req,res){
    res.render("user/registration.ejs",{"session":req.session});
});

router.post("/save_register",async function(req,res){
    var d=req.body;
    var sql=`insert into users (user_name,user_email,user_mobile,user_password) values(?,?,?,?)`;
    var data=await exe(sql,[d.user_name,d.user_email,d.user_mobile,d.user_password]);
    res.redirect("/login");
})



router.get("/about",verfylogin,function(req,res){
    res.render("user/about.ejs",{"session":req.session});
});

router.get("/services",verfylogin,function(req,res){
    res.render("user/services.ejs",{"session":req.session});
});

router.get("/pricing",verfylogin,function(req,res){
    res.render("user/pricing.ejs",{"session":req.session});
});

router.get("/car",verfylogin,async function(req,res){
    var sql=`select * from cars`;
    var cars_info=await exe(sql);
    var obj={"cars_info":cars_info,"session":req.session};
    res.render("user/car.ejs",obj);
});

router.get("/car-single/:car_id",verfylogin,async function(req,res){
    var id=req.params.car_id;
    var sql=`select * from cars where car_id='${id}'`;
    var car_in=await exe(sql);
    var obj={"car_in":car_in};
    res.render("user/car-single.ejs",obj,{"session":req.session});
})

router.get("/blog",verfylogin,async function(req,res){
    var sql=`select * from blog`;
    var blog_info=await exe(sql);
    var obj={"blog_info":blog_info,"session":req.session}
    res.render("user/blog.ejs",obj);
});

router.get("/blog-single/:blog_id",verfylogin,async function(req,res){
    var blog_id=req.params.blog_id;
    var sql=`select * from blog where blog_id='${blog_id}'`;
    var blog_info=await exe(sql);
    var obj={"blog_info":blog_info,"session":req.session};
    res.render("user/blog-single.ejs",obj);
})

router.get("/contact",verfylogin,function(req,res){
    res.render("user/contact.ejs",{"session":req.session});
});

router.post("/save_contact",async function(req,res){
    var d=req.body;
    var sql=`insert into contact (user_name,user_email,user_subject,user_message) values(?,?,?,?)`;
    var data=await exe(sql,[d.user_name,d.user_email,d.user_subject,d.user_message]);
    res.redirect("/contact");
});

router.post("/book_car",verfylogin,async function(req,res){
    var d=req.body;
    var car_id=d.car_id
    var user_id=req.session.user_id
    var sql=`insert into book_cars (pick_up,drop_off,pick_up_date,drop_off_date,pick_up_time,car_id,user_id,status)
     values(?,?,?,?,?,?,?,'pending')`;
     var data=await exe(sql,[d.pick_up,d.drop_off,d.pick_up_date,d.drop_off_date,d.pick_up_time,d.car_id,user_id]);
    res.redirect("/car");
});

router.get("/book_now/:car_id",verfylogin,async function(req,res){
    var car_id=req.params.car_id;
    var sql=`select * from cars where car_id='${car_id}'`;
    var cars_info=await exe(sql);
    var obj={"cars_info":cars_info,"session":req.session}
    res.render("user/book_now.ejs",obj);
});
module.exports=router;
