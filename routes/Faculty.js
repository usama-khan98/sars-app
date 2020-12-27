const auth = require("../middleware/auth");
const bcrypt = require("bcrypt");
const {Faculty }= require("../models/facultyModel");
const {Synopsis} = require('../models/synopsisModel');
const {Presentation}=require("../models/presentationModel");
const {ReviewTask}=require('../models/reviewTaskModel');
const {Comments}=require('../models/reviewCommentModel');
const {Token}=require('../models/token');
const express = require("express");
const jwt = require("jsonwebtoken");
const config = require("config");
const multer = require('multer');
const router = express.Router();


const storage = multer.diskStorage({
  destination: function(req, file, cb) {
    cb(null,'./uploads/FacultyImages');
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

const storage1 = multer.diskStorage({
  destination: function(req, file, cb) {
    cb(null,'./uploads/Comments');
  },
  filename: function(req, file, cb) {
    cb(null, new Date().toISOString() + file.originalname);
  }
});

const fileFilter1 = (req, file, cb) => {

  if (file.mimetype === 'application/pdf' || file.mimetype === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' || file.mimetype === 'application/vnd.oasis.opendocument.text') {
    cb(null, true);
  } else {
    cb(null, false);
  }
};

const upload1 = multer({
  storage: storage1,
  limits: {
    fileSize: 1024 * 1024 * 5
  },
  fileFilter: fileFilter1
});


router.get("/current", auth, async (req, res) => {
  const faculty = await Faculty.findById(req.user.userId).select("-password");
  res.send(faculty);
});

router.post("/signup", async (req, res) => {

  let faculty = await Faculty.findOne({ email: req.body.email });
  if (faculty) return res.status(400).send("User already registered.");

  faculty = new Faculty({
    fname: req.body.fname,
    lname: req.body.lname,
    isReviewer:req.body.isReviewer,
    isSupervisor:req.body.isSupervisor,
    email: req.body.email
  });
  faculty.password = await bcrypt.hash(req.body.password, 10);
  await faculty.save();

  const token = faculty.generateAuthToken();
  res.header("x-auth-token", token).send({
    _id: faculty._id,
    name: faculty.name,
    email: faculty.email,
    message:"User created Success"
  });
});

router.post('/signin',(req,res)=>{

  console.log("someone trying to connect..");
  console.log(req.body);
  Faculty.find({email:req.body.email}).exec()
      .then(faculty=>{
          console.log(faculty[0]);
          if(faculty.length < 1){
              
              res.status(409).json({
                  error:"Faculty doesnot exists "
              });
          }
          
          const hash=faculty[0].password;
          bcrypt.compare(req.body.password, hash, function(err, result) {
  
                  if(result){
                     const token= jwt.sign({
                          name:faculty[0].fname,
                          email:faculty[0].email,
                          isReviewer:faculty[0].isReviewer,
                          isSupervisor:faculty[0].isSupervisor,
                          userType:'Faculty',
                          userId:faculty[0]._id

                     },
                     config.get('myprivatekey')
                     ,
                     {
                         expiresIn:"1h"
                     }
                     );
                    //  console.log("login success "+token)
                      res.header("x-auth-token", token).status(200).json({
                          message:"login Successfuly...!!!",
                          token:token,
                          Userdata:{
                            name:faculty[0].fname,
                            email:faculty[0].email,
                            isReviewer:faculty[0].isReviewer,
                            isSupervisor:faculty[0].isSupervisor,
                            userType:'Faculty',
                            userId:faculty[0]._id
                       }
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


router.get('/getAll',(req,res)=>{

  Faculty.find().exec()
  .then(facultylist=>{
    res.status(200).json({

      list:facultylist
  })
  }).catch(err=>{
    res.status(500).json({
        error:err
    })
});
});

router.post('/acknowledgeSynopsis',(req,res)=>{
      
      Synopsis.findById(req.body.synopsisId)
      .then(synopsis=>{
        synopsis.status="Registered";
        synopsis.save()
        .then(result=>{
          res.status(200).json({

            message:"Synopsis Status Changed"
        })
        })
        .catch(err=>{
          res.status(500).json({
            error:err
        })
        })
      })
      .catch(err=>{
        res.status(500).json({
          error:err
      })
      })
});


router.post('/submitReviewComment',upload1.single('commentFile'),(req,res)=>{
    const comment= new Comments({
      ReviewTask:req.body.reviewTaskId,
      filepath:(req.file)?req.file.path:'',
      commenents:(req.body.commenent)? req.body.commenent:'',
      status:'Submitted'
    })

    comment.save()
    .then(result=>{
        ReviewTask.findById(req.body.reviewTaskId)
        .then(task=>{
            task.commenents.push(result._id);
            task.status="Submitted";
            task.save()
            .then(result2=>{
                res.status(200).json({
                  message:"Comment submitted success"
                })
            })
            .catch(err=>{
              res.status(404).json({
                error:err
              })
            })
        }).catch(err=>{
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

router.post('/confirmRegistrtion',(req,res)=>{
  Token.findOne({token:req.body.token})
  .then(result=>{
      Faculty.findById(result._userId)
      .then(result2=>{
          result2.status="Active";
          result2.save()
          .then(result3=>{
              res.status(200).json({
                message:'Faculty Registration Confirm',
                user:result3
              })
          }).catch(err=>{
        res.status(404).json({
          error:err
        })
      })
      }).catch(err=>{
        res.status(404).json({
          error:err
        })
      })
  })
  .catch(err=>{
    res.status(404).json({
      error:err,
      message:'Invalid token'
    })
  })
});

router.post('/updateProfile',upload.single('profilePicture'), (req,res)=>{
  
  console.log(req.body)
  Faculty.findById(req.body.id)
  .then(async faculty=>{
    if(req.body.fname){
      faculty.fname=req.body.fname;
    }
    if(req.body.lname){
      faculty.lname=req.body.lname;
    }
    if(req.body.phoneNumber){
      faculty.phoneNumber=req.body.phoneNumber;
    }
    if(req.body.areaofinterest){
      faculty.AreaofInterest=req.body.areaofinterest;
    }
    if(req.body.email){
      faculty.email=req.body.email;
    }
    if(req.body.password)
    {
      faculty.password = await bcrypt.hash(req.body.password, 10);
    }
    if(req.file){
      faculty.profileImage=req.file.path;
    }
    if(req.body.url){
      faculty.profileLink=req.body.url;
    }
    if(req.body.hecAppro){
      faculty.isHecApproved=req.body.hecAppro;

    }
    
    console.log(faculty);

    faculty.save()
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


router.post('/getProfile',(req,res)=>{
    console.log(req.body.id);
    Faculty.findById(req.body.id)
    .then(faculty=>{
      console.log(faculty)
      res.status(200).json({
        data:faculty
      })
    })
    .catch(err=>{
      res.status(400).json({
        error:err
      })
    })

})


router.post('/getStudents', (req,res)=>{
  console.log(req.body.id);
  Synopsis.find({supervisor:req.body.id}).populate('student')
  .then(synopsis=>{
    var synopsisdata=[];
    console.log(synopsis);
    synopsisdata.push(synopsis);
    res.status(200).json({
      data:synopsisdata
    })
  })
  .catch(err=>{
    res.status(400).json({
      error:err
    })
  })

})

router.post('/ChangeStatus',(req,res)=>{
  Faculty.findById(req.body.id)
  .then(faculty=>{
    faculty.status=req.body.status;
    faculty.save()
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

router.get('/getAllReviewer',(req,res)=>{

  Faculty.find({isReviewer:true})
  .then(facultylist=>{
    res.status(200).json({

      list:facultylist
  })
  }).catch(err=>{
    res.status(500).json({
        error:err
    })
});
});


router.get('/getAllSupervisor',(req,res)=>{

  Faculty.find({isSupervisor:true})
  .then(facultylist=>{
    res.status(200).json({

      list:facultylist
  })
  }).catch(err=>{
    res.status(500).json({
        error:err
    })
});
});



router.post('/getReviewTasks',(req,res)=>{
  console.log(req.body.id);
  ReviewTask.find({reviewer:req.body.id}).populate('synopsis').populate('commenents')
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

router.post('/getbyId',(req,res)=>{
  Synopsis.find({supervisor:req.body.id}).populate('student').populate('commenents')
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

router.post('/presentations',(req,res)=>{
  Presentation.find({supervisor:req.body.id}).populate('supervisor').populate('student').populate('synopsis')
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

router.post('/getCommentsbyId',(req,res)=>{
  Comments.findById(req.body.id)
  .then(result=>{
    res.status(200).json({
      comment:result
    })
  })
  .catch(err=>{
    res.status(404).json({
      error:err
    })
  })
});




module.exports = router;