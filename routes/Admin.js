const auth = require("../middleware/auth");
const bcrypt = require("bcrypt");
var crypto = require('crypto');
const {Admin} = require("../models/adminModel");
const {Synopsis} = require('../models/synopsisModel');
const {Department}=require('../models/DepartmentModel');
const {Program}=require('../models/ProgramModel');
const {Faculty}=require('../models/facultyModel');
const {Token}=require('../models/token');
const express = require("express");
const jwt = require("jsonwebtoken");
const config = require("config");
const multer = require('multer');
var nodemailer = require('nodemailer');
const router = express.Router();


const storage = multer.diskStorage({
    destination: function(req, file, cb) {
      cb(null,'./uploads/AdminImages');
    },
    filename: function(req, file, cb) {
      cb(null, new Date().toISOString() + file.originalname);
    }
  });
  
  const fileFilter = (req, file, cb) => {
    // reject a file
    if (file.mimetype === 'image/jpeg' || file.mimetype === 'image/png') {
      cb(null, true);
    } else {
      cb(null, false);
    }
  };
  
  const upload = multer({
    storage: storage,
    limits: {
      fileSize: 1024 * 1024 * 5
    },
    fileFilter: fileFilter
  });
  

router.get("/current", auth, async (req, res) => {
  const user = await Admin.findById(req.user.userId).select("-password");
  res.send(user);
});


  var transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: 'aon094944@gmail.com',
      pass: 'Miantraders1!'
    }
  });

router.post('/signup',upload.single('profileImage'),(req,res)=>{
    console.log(req.file)
    Admin.find({email:req.body.email}).exec()
    .then(admin=>{
        if(admin.length >=1){
            return res.status(409).json({
                error:"Mail already exists "
            });
        }
        else{

            bcrypt.genSalt(10, function(err, salt) {
                bcrypt.hash(req.body.password, salt, function(err, hash) {
                        
                    if(err){
                            return res.status(500).json({
                                message:"Can not encrypt",  
                                error:err
                            });
                        }
                        else{
                            
                            const admin= new Admin({
                                name: req.body.name,
                                password: hash,
                                email: req.body.email,
                                profileImage:req.file.path ,
                                isAdmin: req.body.isAdmin,
                                
                            });

                                admin.save()
                                .then(result =>{
                                    console.log(result);
                                    res.status(201).json({
                
                                        message: "Admin Created",
                                        name:req.body.name,
                                        email:req.body.email
                                    });
                                })
                                .catch(err=>{
                                    console.log(err);
                                    res.status(500).json({
                                        error: err
                                    });
                
                    });
        
        
                  }
              });    
        
            });
        }
    });


});
router.post('/signin',(req,res)=>{

  console.log("someone trying to connect..");
  console.log(req.body);
  Admin.find({email:req.body.email}).exec()
      .then(admin=>{
          console.log(admin[0]);
          if(admin.length < 1){
              
              res.status(409).json({
                  error:"Admin doesnot exists "
              });
          }
          
          
          const hash=admin[0].password;
          bcrypt.compare(req.body.password, hash, function(err, result) {
  
                  if(result){
                     const token= jwt.sign({
                          name:admin[0].fname,
                          email:admin[0].email,
                          userType:'Admin',
                          userId:admin[0]._id

                     },
                     config.get('myprivatekey')
                     ,
                     {
                         expiresIn:"1h"
                     }
                     );
                     console.log("login success "+token)
                      res.header("x-auth-token", token).status(200).json({
                          message:"login Successfuly...!!!",
                          token:token
                      });
                  }else{

                      res.status(404).json({
                          message:"Wrong Password"
                      });
                  }
              }); 
      })
      .catch(err=>{
        res.status(404).json({
            message:"Wrong email......!!!",
            error: err
        });
      });



});

router.post('/getprofile',(req,res)=>{
  Admin.findById(req.body.adminid)
  .then(admin=>{
      console.log(admin);
      res.status(200).json({
        data:admin
      })
  })
  .catch(err=>{
    res.status(404).json({
      message:"Can not find admin",
      error: err
  });
  })

});

router.post('/addDepartment',(req,res)=>{
  const department=new Department({
    name:req.body.departName
  })

  department.save()
  .then(result=>{
    res.status(200).json({
      message:'Department Added success'
    })
  })
  .catch(err=>{
    res.status(404).json({
      error:err
    })
  })
});

router.post('/addProgram',(req,res)=>{
    const program=new Program({
      name:req.body.programName,
      AreaOfSpecilization:req.body.area
    });

    program.save()
    .then(result=>{
      Department.findById(req.body.departId)
      .then(depart=>{
        depart.programs.push(result._id);
        depart.save()
        .then(result1=>{
          res.status(200).json({
            message:"Program Added Success"
          })
        })
        .catch(err=>{
          res.status(404).json({
            error:err
          })
        })
      })
      .catch(err=>{
        res.status(404).json({
          error:err
        })
      })
    })
    .catch(err=>{
      res.status(404).json({
        error:err
      })
    })
});

router.get('/getDepart',(req,res)=>{

  Department.find().populate('programs')
  .then(departList=>{
    res.status(200).json({

      list:departList
  })
  }).catch(err=>{
    res.status(500).json({
        error:err
    })
});
});

router.get('/getPrograms',(req,res)=>{

  Program.find()
  .then(programsList=>{
    res.status(200).json({

      list:programsList
  })
  }).catch(err=>{
    res.status(500).json({
        error:err
    })
});
});



router.post('/registerFaculty',async (req,res)=>{

  // console.log(req.body.facultyList);
  
  var faculty=req.body.facultyList;
  console.log(faculty.length)
  for(var i=0;i<faculty.length;i++){
    
    let faculty2 = await Faculty.findOne({ email: faculty[i].email });
        
    if (faculty2) return res.status(400).json({
      errormessage:"User Already exists "+faculty2.email
    });

        var faculty1 = new Faculty({
          fname: faculty[i].name,
          isReviewer:(faculty[i].role!=="Supervisor")?true:false,
          isSupervisor:(faculty[i].role!=="Reviewer")?true:false,
          department:faculty[i].dept,
          email: faculty[i].email,
          status:'Active'
        });

        faculty1.password = await bcrypt.hash("test1234", 10);
        
        faculty1.save()
        .then(result=>{
          console.log(result);
          var token = new Token({ _userId: result._id, token: crypto.randomBytes(16).toString('hex') });
          token.save()
          .then(result2=>{
            console.log(result2);
            var mailOptions = { from: 'aon094944@gmail.com', to: result.email, subject: 'Account Verification Token', text: 'Hello,\n\n' + 'Please verify your account by clicking the link: \nhttp:\/\/' + 'localhost:3000' + '\/faculty/confirmation\/' + token.token + '.\n' };
            transporter.sendMail(mailOptions, function (err) {
                if (err) { res.status(404).json({error:err}) }
            });
          }).catch(err=>{
            res.status(404).json({
              error:err,
              message:'error at token'
            })
          });
        })
        .catch(err=>{
          res.status(404).json({
            error:err,
            message:'error saving faculty'
          })
        });

    }

    if(i==faculty.length){
      res.status(200).json({message:"Faculty Registered Success"});
    }

});

router.post('/updateProfile',upload.single('profilePicture'), (req,res)=>{
  
  console.log(req.body)
  Admin.findById(req.body.id)
  .then(admin=>{

    console.log(admin);
    admin.profileImage=req.file.path;
    admin.save()
    .then(result=>{
        res.status(200).json({
          message:"Profile Updated Success",
          data:result
        });
      })
    .catch(err=>{
      res.status(404).json({
        error:err
      })
    })

  })
  .catch(err=>{
    res.status(404).json({
      error:err
    })
  })

});

module.exports = router;