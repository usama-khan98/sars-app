const auth = require("../middleware/auth");
const bcrypt = require("bcrypt");
const {Student} = require("../models/studentModel");
const {Synopsis} = require('../models/synopsisModel');
const {Presentation}=require("../models/presentationModel");
const express = require("express");
const jwt = require("jsonwebtoken");
const config = require("config");
const router = express.Router();
const multer = require('multer');


const storage = multer.diskStorage({
  destination: function(req, file, cb) {
    cb(null,'./uploads/StudentImages');
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
  const student = await Student.findById(req.user.userId).select("-password");
  res.send(student);
});

router.post("/signup", async (req, res) => {
  
  let student = await Student.findOne({ email: req.body.email });
  if (student) return res.status(400).send("User already registered.");

  student = new Student({
    fname: req.body.fname,
    lname: req.body.lname,
    regNumber: req.body.regNumber,
    fatherName:req.body.fatherName,
    Department:req.body.dept,
    Program:req.body.program,
    batch:req.body.batch,
    password: req.body.password,
    email: req.body.email,
    status:"Active"
  });
  student.password = await bcrypt.hash(student.password, 10);
  await student.save();

  const token = student.generateAuthToken();
  res.header("x-auth-token", token).send({
    _id: student._id,
    name: student.name,
    email: student.email,
    message:"User created Success"
  });
});

router.post('/signin',(req,res)=>{

  console.log("someone trying to connect..");
  console.log(req.body);
  Student.find({email:req.body.email}).exec()
      .then(student=>{

          console.log(student[0]);
          if(student.length < 1){
              console.log("user not found");
              res.status(409).json({
                  error:"Student doesnot exists "
              });
          }
          else{
            const hash=student[0].password;
            bcrypt.compare(req.body.password, hash, function(err, result) {
    
                    if(result){
                       const token= jwt.sign({
                            name:student[0].fname,
                            email:student[0].email,
                            regNumber:student[0].regNumber,
                            userType:'Student',
                            userId:student[0]._id
  
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
                            token:token,
                            Userdata:{
                              name:student[0].fname,
                              email:student[0].email,
                              regNumber:student[0].regNumber,
                              userType:'Student',
                              userId:student[0]._id
                            }
                        });
                    }else{
  
                        res.status(404).json({
                            message:"Wrong Password"
                        });
                    }
                });
          }   
      })
      .catch(err=>{
        res.status(404).json({
          message:"Wrong email......!!!",
          error: err
      });  
      });



});

router.get('/getAll',(req,res)=>{

  Student.find().populate('Synopsis')
  .then(studentlist=>{
    res.status(200).json({

      list:studentlist
  })
  }).catch(err=>{
    res.status(500).json({
        error:err
    })
});
});

router.post('/ChangeStatus',(req,res)=>{
  Student.findById(req.body.id)
  .then(std=>{
    std.status=req.body.status;
    std.save()
    .then(result=>{
      res.status(200).json({
        message:"Status Updated Success"
      })
      
    })
    .catch(err=>[
      res.status(404).json({
        error:err
      })
    ])
  })
  .catch(err=>[
    res.status(404).json({
      error:err
    })
  ])
});

router.post('/getById',(req,res)=>{
  Student.findById(req.body.sid).populate('Synopsis').populate('Program').populate('Department')
  .then(result=>{
    res.status(200).json({
      student:result
    })
  })
  .catch(err=>{
    res.status(404).json({
      error:err
    })
  })
})


router.post('/presentations',(req,res)=>{
  Presentation.find({student:req.body.id}).populate('supervisor').populate('student').populate('synopsis')
  .then(result=>{
    res.status(200).json({
      presentationList:result
    })
  })
  .catch(err=>{
    res.status(404).json({
      error:err
    })
  })
});

router.post('/getSynopsisbyId',(req,res)=>{
  Synopsis.find({student:req.body.id}).populate('student').populate('commenents').populate('supervisor')
  .then(result=>{
    res.status(200).json({
      data:result
    })
  })
  .catch(err=>{
    res.status(404).json({
      error:err
    })
  })
});


router.post('/updateProfile',upload.single('profilePicture'), (req,res)=>{
  
  console.log(req.body)
  Student.findById(req.body.id)
  .then(async student=>{

    if(req.body.password)
    {
      student.password = await bcrypt.hash(req.body.password, 10);
    }
    if(req.file){
      student.profileImage=req.file.path;
    }
    
    
    console.log(student);

    student.save()
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