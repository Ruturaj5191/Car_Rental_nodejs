var express=require("express");
var router=express.Router();
var exe=require("../db");


function verifyAdminLogin(req,res,next){
    if(req.session && req.session.admin_id){
        next();
    }
    else{
        res.redirect("/admin");
    }
}

router.get("/",function(req,res){
    res.render("admin/login.ejs")
});

router.post("/save_login",async function(req,res){
    let d=req.body;
    var sql=`select * from admin where username=? AND password=? `;
    var data=await exe(sql,[d.username,d.password]);
    
    if(data.length>0){
        req.session.admin_id = data[0].admin_id;
        req.session.admin_name = data[0].username;
        res.redirect("/admin/Admin_home");
    }
    else{
        res.redirect("/admin");
    }
});

router.get("/logout_admin",function(req,res){
    req.session=destroy();
    res.redirect("/admin")
});

router.get("/Admin_home",verifyAdminLogin,function(req,res){
    res.render("admin/home.ejs")
})


router.get("/add_cars",verifyAdminLogin,function(req,res){
    res.render("admin/add_cars.ejs");
});

router.get("/cars_list",verifyAdminLogin,async function(req,res){
    var sql=`select * from cars`;
    var cars_info=await exe(sql);
    var obj={"cars_info":cars_info}
    res.render("admin/cars_list.ejs",obj);
});

router.post("/save_cars",async function(req,res){
    var d=req.body;
    var car_image="";
    if(req.files){
        if(req.files.car_image){
            car_image=new Date().getTime()+req.files.car_image.name;
            req.files.car_image.mv("public/"+car_image);
        }
    }
    var sql=`insert into cars (car_name,car_price,car_feature,car_details,car_image) values(?,?,?,?,?)`;
    var data=await exe(sql,[d.car_name,d.car_price,d.car_feature,d.car_details,car_image]);
    res.redirect("/admin/add_cars");
    // console.log(req.files);
});

router.get("/delete_car/:car_id",async function(req,res){
    var id=req.params.car_id;
    var sql=`delete from cars where car_id='${id}'`;
    var data=await exe(sql);
    res.redirect("/admin/cars_list")
});

router.get("/edit_car/:car_id",async function(req,res){
    var id=req.params.car_id;
    var sql=`select * from cars where car_id='${id}'`;
    var car_info=await exe(sql);
    var obj={"car_info":car_info[0]}
    res.render("admin/edit_car.ejs",obj);
});

router.post("/update_car/:car_id",async function(req,res){
    var car_id=req.params.car_id
    var d=req.body;
    var car_image=d.old_car_image;

    if(req.files){
        if(req.files.car_image){
            car_image=new Date.getTime()+req.files.car_image.name;
            req.files.car_image.mv("public/"+car_image);
        }
    }
        d.car_details = d.car_details.replace(/'/g, "''");
        d.car_feature = d.car_feature.replace(/'/g, "''");
    var sql=`UPDATE cars SET car_name='${d.car_name}', car_price='${d.car_price}',car_feature='${d.car_feature}',car_details='${d.car_details}', car_image='${car_image}' where car_id='${car_id}'`;
    var data=await exe(sql);
    res.redirect("/admin/cars_list"); 
});

router.get("/add_blog",verifyAdminLogin,function(req,res){
    res.render("admin/add_blog.ejs");
});

router.post("/save_blog",async function(req,res){
   var d=req.body;
   var blog_image="";
   if(req.files){
    if(req.files.blog_image){
        blog_image=new Date().getTime()+req.files.blog_image.name;
        req.files.blog_image.mv("public/"+blog_image);
    }
   }
   var sql=`insert into blog (blog_name,blog_date,blog_text,blog_image) values(?,?,?,?)`;
   var data=await exe(sql,[d.blog_name,d.blog_date,d.blog_text,blog_image]);
   res.redirect("/admin/add_blog");
});

router.get("/blog_list",verifyAdminLogin,async function(req,res){
    var sql=`select * from blog`;
    var blog_list=await exe(sql);
    var obj={"blog_list":blog_list}
res.render("admin/blog_list.ejs",obj);
});

router.get("/delete_blog/:blog_id",async function(req,res){
    var blog_id=req.params.blog_id;
    var sql=`delete from blog where blog_id='${blog_id}'`;
    var data=await exe(sql);
    res.render("/admin/blog_list");
});

router.get("/edit_blog/:blog_id",async function(req,res){
    var blog_id=req.params.blog_id;
    var sql=`select * from blog where blog_id='${blog_id}'`;
    var blog_info=await exe(sql);
    var obj={"blog_info":blog_info[0]};
    res.render("admin/edit_blog.ejs",obj);
});

router.post("/update_blog/:blog_id",async function(req,res){
    var blog_id=req.params.blog_id;
    var d=req.body;
    var blog_image=d.old_blog_image;
    if(req.files){
        if(req.files.blog_image){
            blog_image=new Date().getTime()+req.files.blog_image.name;
            req.files.blog_image.mv("public/"+blog_image);
        }
    }
    const sql=`update blog SET blog_name='${d.blog_name}',blog_date='${d.blog_date}',blog_text='${d.blog_text}',blog_image='${blog_image}' where blog_id='${blog_id}'`;
    var data=await exe(sql);
    res.redirect("/admin/blog_list");
    // res.send(data);
});

router.get("/booked_carlist",verifyAdminLogin,async function(req,res){
    var sql=`SELECT book_cars.*, cars.car_name 
               FROM book_cars  
               JOIN cars ON book_cars.car_id = cars.car_id`;
    var book_cars=await exe(sql);
    var obj={"book_cars":book_cars};
    res.render("admin/booked_carlist.ejs",obj);
});


router.post("/approve/:book_cars_id", async function(req, res) {
    var book_cars_id = req.params.book_cars_id;

    await exe(`UPDATE book_cars SET status='approved' WHERE book_cars_id=?`, [book_cars_id]);

    let booking = await exe(`SELECT car_id FROM book_cars WHERE book_cars_id=?`, [book_cars_id]);

    if (booking.length > 0) {
        let car_id = booking[0].car_id;  

        await exe(`UPDATE cars SET is_booked=1, booked_at=NOW() WHERE car_id=?`, [car_id]);
    }
    res.redirect("/admin/booked_carlist");
});


router.post("/reject/:book_cars_id", async function(req, res) {
    var book_cars_id = req.params.book_cars_id;
    await exe(`UPDATE book_cars SET status='rejected' WHERE book_cars_id=?`, [book_cars_id]);
    res.redirect("/admin/booked_carlist");
});

module.exports=router;
