const auth = require("../middleware/auth");
const bcrypt = require("bcrypt");
var crypto = require('crypto');
const {Admin} = require("../models/adminModel");
const {ReviewTask} = require("../models/reviewTaskModel");
const {Synopsis} = require('../models/synopsisModel');
const {Department}=require('../models/DepartmentModel');
const {Program}=require('../models/ProgramModel');
const {Faculty}=require('../models/facultyModel');
const {Token}=require('../models/token');
const {Comments} = require("../models/reviewCommentModel");
const {Presentation}=require("../models/presentationModel");
const {Notification}=require('../models/notificationModel');
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
      user: 'malikskad@gmail.com',
      pass: 'malikAdmin123443'
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

router.post('/sendmail',(req,res)=>{

  console.log("body"+req);
  
  var html="<a href="+"'localhost:3000'>click here</a>"

  var mailOptions = {
    from: req.body.femail,
    to: req.body.temail,
    subject: req.body.subject,
    text: req.body.text,
    html:html,
    attachments: [{
      filename: '2020-02-17T20:55:03.574ZIMG_20170922_191809.jpg',
      path: '/home/shehzadmalik/Projects/FYP/SSRS//uploads/AdminImages/2020-02-17T20:55:03.574ZIMG_20170922_191809.jpg'
    }]
  };

  transporter.sendMail(mailOptions, function(error, info){
    if (error) {
      console.log(error);
    } else {
      console.log('Email sent: ' + info.response);
      res.send('Email sent: ' + info.response);
    }
  });

});

router.post('/assignForReview',(req,res)=>{
    
    const reviwtask=new ReviewTask({
      synopsis:req.body.synopsisId,
      reviewer:req.body.reviewer1Id,
      deadline:req.body.deadline,
      status:'Assigned'
    });

    reviwtask.save()
    .then(result=>{
      const reviwtask1=new ReviewTask({
        synopsis:req.body.synopsisId,
        reviewer:req.body.reviewer2Id,
        deadline:req.body.deadline,
        status:'Assigned'
      });

      reviwtask1.save()
      .then(result1=>{

        const reviwtask2=new ReviewTask({
          synopsis:req.body.synopsisId,
          reviewer:req.body.reviewer3Id,
          deadline:req.body.deadline,
          status:'Assigned'
        });
        
        reviwtask2.save()
        .then(result2=>{
          Synopsis.findById(req.body.synopsisId)
          .then(synopsis=>{
            synopsis.reviewedBy.push();
            synopsis.reviewedBy.push();
            synopsis.reviewedBy.push();
            synopsis.status="UnderReview";
  
            synopsis.save()
            .then(result4=>{
              res.status(200).json({
                message: "Synopsis Assign for Review success",
            });
            }).catch(err=>{
                res.status(404).json({
                  error: err
              });
          })
        })
        .catch(err=>{
          res.status(404).json({
            error: err
        });
        })

      })
      .catch(err=>{
        res.status(404).json({
          error: err
      });
      })
    })
    .catch(err=>{
      res.status(404).json({
        error: err
    });
    })

  }).catch(err=>{
    res.status(404).json({
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


router.get('/getReviewTasks',(req,res)=>{

  ReviewTask.find().populate('synopsis').populate('reviewer').populate('commenents')
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
          status:'NotVerified'
        });

        faculty1.password = await bcrypt.hash("test1234", 10);
        
        faculty1.save()
        .then(result=>{
          console.log(result);
          var token = new Token({ _userId: result._id, token: crypto.randomBytes(16).toString('hex') });
          token.save()
          .then(result2=>{
            console.log(result2);
            var mailOptions = { from: 'malikskad@gmail.com', to: result.email, subject: 'Account Verification Token', text: 'Hello,\n\n' + 'Please verify your account by clicking the link: \nhttp:\/\/' + 'localhost:3000' + '\/faculty/confirmation\/' + token.token + '.\n' };
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


router.post('/assignRole',(req,res)=>{
  console.log(req.body);
  Faculty.findById(req.body.id)
  .then(faculty=>{
    (req.body.role==="Reviewer")?faculty.isReviewer=true:'';
    (req.body.role==="Supervisor")?faculty.isSupervisor=true:'';
    faculty.save()
    .then(result=>{
      res.status(200).json({
        message:"Role Assigned Success"
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
})

router.post('/deleteRole',(req,res)=>{
  console.log(req.body);
  Faculty.findById(req.body.id)
  .then(faculty=>{
    (req.body.role==="Reviewer")?faculty.isReviewer=false:'';
    (req.body.role==="Supervisor")?faculty.isSupervisor=false:'';
    faculty.save()
    .then(result=>{
      res.status(200).json({
        message:"Role Assigned Success"
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
})

router.post('/forwardComments',(req,res)=>{
  console.log(req.body)
  Synopsis.findById(req.body.synopsisId)
  .then(synop=>{
    synop.commenents.push(req.body.commentId);
    synop.status="Commented";
    synop.save()
    .then(result=>{
      Comments.findById(req.body.commentId)
      .then(comment=>{
        comment.status="Forwarded"
        comment.save()
        .then(result2=>{
          res.status(200).json({
            message:"Comments Forwarded Success"
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
  })
  .catch(err=>{
    res.status(404).json({
      error:err
    })
  })
});


router.get('/synopsisToPresente',(req,res)=>{
    Synopsis.find({status:'Revised'}).populate('supervisor').populate('student')
    .then(result=>{
      res.status(200).json({
        synopsislist:result
      })
    })
    .catch(err=>{
      res.status(404).json({
        error:err
      })
    })

});

router.post('/schedulePresentation',(req,res)=>{

  var timeslot=1;

  req.body.synopsisList.map((synopsisid)=>{
    Synopsis.findById(synopsisid).populate('supervisor').populate('student')
    .then(synop=>{
      const presentation=new Presentation({
        synopsis:synop._id,
        student:synop.student._id,
        supervisor:synop.supervisor._id,
        date:req.body.date,
        participent1:req.body.participent1,
        participent2:req.body.participent2,
        participent3:req.body.participent3,
        venu:req.body.room,
        timeSlot:timeslot,
        status:"Schedule"
      })
      timeslot++;
      presentation.save()
      .then(res=>{
        synop.status="PresentationSchedule";
        synop.save()
        .then(result1=>{
          console.log(result1);
        })
        .catch(err=>{
          res.status(400).json({
            error:err
          })
        })
        console.log(res);
      })
      .catch(err=>{
        res.status(400).json({
          error:err
        })
      })

    })
    .catch(err=>{
      res.status(400).json({
        error:err
      })
    })
  })

  console.log(req.body);
  res.status(200).json({
    message:"Presentation Schedules"
  });
  
});

router.get('/presentations',(req,res)=>{
  Presentation.find().populate('supervisor').populate('student').populate('synopsis')
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

router.post('/addfinaldecision',(req,res)=>{
  Synopsis.findById(req.body.synopsisId)
  .then(synop=>{
    synop.finalDecision=req.body.decision;
    synop.status=req.body.decision;
    synop.save()
    .then(result=>{
      res.status(200).json({
        message:"decision Added success"
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


router.get('/synopsisToDecision',(req,res)=>{
  Synopsis.find({status:'Presented'}).populate('supervisor').populate('student')
  .then(result=>{
    res.status(200).json({
      synopsislist:result
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

router.post('/Notify',(req,res)=>{
  console.log("am here here here");
    const date=new Date();
    const notification= new Notification({
      userid:req.body.userId,
      date:date,
      subject:req.body.subject,
      status:req.body.status
    });

    notification.save()
    .then(response=>{
      res.status(200).json({
        result:response
      })
    }).catch(err=>{
      res.status(404).json({
        error:err
      })
    })
});

router.post('/GetAllunread',(req,res)=>{
  Notification.find({status:'unreaded',userid:req.body.userId})
  .then(result=>{
    console.log(result);
    res.status(200).json({
      list:result
    })
  })
  .catch(err=>{
    res.status(404).json({
      error:err
    })
  })
});

router.post('/GetAllNotify',(req,res)=>{
  Notification.find({userid:req.body.userId})
  .then(result=>{
    console.log(result);
    res.status(200).json({
      list:result
    })
  })
  .catch(err=>{
    res.status(404).json({
      error:err
    })
  })
});

router.post('/NotificationStatusChange',(req,res)=>{

  Notification.findById(req.body.notifyId)
  .then(notify=>{
    notify.status="readed"
    notify.save()
    .then(result=>{
      res.status(200).json({
        message:"status changed"
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

module.exports = router;