const express = require("express");
const router = express.Router();
const {Synopsis} = require('../models/synopsisModel');
const {Student} = require("../models/studentModel");
const multer = require('multer');


const storage = multer.diskStorage({
    destination: function(req, file, cb) {
      cb(null,'./uploads/Synopsis');
    },
    filename: function(req, file, cb) {
      cb(null, new Date().toISOString() + file.originalname);
    }
  });
  
  const fileFilter = (req, file, cb) => {
    // reject a file

    if (file.mimetype === 'application/pdf' || file.mimetype === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' || file.mimetype === 'application/vnd.oasis.opendocument.text') {
      cb(null, true);
    } else {
      cb(null, false);
    }
  };
  
  const upload = multer({
    storage: storage,
    limits: {
      fileSize: 1024 * 1024 * 100
    },
    fileFilter: fileFilter
  });

router.post('/register',(req,res)=>{
  var synopsis={};
  if(req.body.co_supervisorID){
    synopsis=new Synopsis({
      title:req.body.title,
      student:req.body.studentId,
      supervisor:req.body.supervisorId,
      co_supervisor:req.body.co_supervisorID,
      researchField:req.body.researchField,
      status:"Registering"
  });
  }
  else{
      synopsis=new Synopsis({
      title:req.body.title,
      student:req.body.studentId,
      supervisor:req.body.supervisorId,
      researchField:req.body.researchField,
      status:"Registering"
  });
  }
    

    synopsis.save()
    .then(result=>{

        console.log(result);
        Student.findById(req.body.studentId)
        .then(student=>{
            student.Synopsis.push(result._id);

            student.save()
            .then(result2=>{
                console.log(result2)
                res.status(200).json({
                                
                            message: "Synopsis Submitted to Admin",
                        });
            })
        })
        .catch(err=>{
            console.log(err)
            res.status(400).json({
                error: err
            });
        })
        
    })
    .catch(err=>{
        console.log(err)
        res.status(400).json({
            error: err
        });
    });

});

router.post('/uploadSynopsis',upload.single('synopsisFile'),(req,res)=>{
    // console.log(req.file);
    Synopsis.findById(req.body.synopsisId)
    .then(synopsis=>{
        synopsis.filepath=req.file.path;
        synopsis.commenents=[];
        synopsis.status="Submitted";
        console.log(synopsis);
        synopsis.save()
        .then(result=>{
            res.status(200).json({
                message: "File uploaded success",
            });
        })
        .catch(err=>{
            res.status(400).json({
                error: err
            }); 
        })
    }).catch(err=>{
        res.status(400).json({
            error: err
        }); 
    })
});

router.get('/getAll',(req,res)=>{

    Synopsis.find().populate('student').populate('supervisor')
    .then(synopsisList=>{
      res.status(200).json({
  
        list:synopsisList
    })
    }).catch(err=>{
      res.status(500).json({
          error:err
      })
  });
  });

  router.post('/ChangeStatus',(req,res)=>{
    Synopsis.findById(req.body.id)
    .then(synopsis=>{
      synopsis.status=req.body.status;
      synopsis.save()
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

  router.post('/getbyId',(req,res)=>{
    Synopsis.findById(req.body.id).populate('supervisor').populate('student').populate('commenents')
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

module.exports = router;
