const express = require("express")
const routes = express.Router();
const mongoose = require("mongoose")
const multer = require("multer")
const User = require("../model/user")
const bcrypt = require("bcrypt")
const jwt = require("jsonwebtoken")
const path = require("path")


const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'uploads');
    },
    filename: (req, file, cb) => {
        cb(null, Date.now() + path.extname(file.originalname));
    }
});
// first to create the upload folder
// const uploads = multer({dest: 'uploads/'})
const upload = multer({
    storage: storage,
    limits: { fileSize: 5 * 1024 * 1024 }
});
// signup route
routes.post("/signup", upload.single('userImage'), async (req, res, next) => {
    const { name, email, password, adress} = req.body;

    if (!name || !email || !password) {
        return res.status(400).json({
            success: false,
            message: 'Name, email, and password are required.',
        });
    }

    try {
        const userExists = await User.findOne({ email });
        if (userExists) {
            return res.status(409).json({
                success: false,
                message: 'User already exists with this email',
            });
        }

        // Hash the password
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        const user = new User({
            name: req.body.name,
            userName: req.body.userName,
            userImage: req.file ? req.file.path : null,
            email: req.body.email,
            password: hashedPassword,
            adress,
            createAt: req.body.createAt,
        });

        await user.save();
        res.status(201).json({ message: "Signup successful." });
    } catch (err) {
        console.error(err);
        res.status(500).json({
            error: err.message
        });
    }
});

// Login router
routes.post("/login", async(req, res, next)=>{
    const {email, password} = req.body;
    if(!email || !password){
        return res.status(400).json({
            success : false,
        message: "Email nad password are required"
        });
    }
    try{
        const user = await User.findOne({email});
        if(!user){
            return res.status(404).json({
                success : false,
                message: "User not found"
            });
        }
        const isMatch = await bcrypt.compare(password, user.password);
if(!isMatch){
    return res.status(404).json({
        success: false,
        message: 'Invalid email or password.',
    })
}
const token = jwt.sign(
    { id: user._id, email: user.email },
    process.env.JWT_SECRET || 'your_jwt_secret', // Replace with your JWT secret
    { expiresIn: '1h' }
);
res.status(200).json({
    success: true,
    message: 'Login successful.',
    token,
})
    }catch(err){
        console.log(err);
        res.status(500).json({
            error:err
        })
    }
})
// Get all User
routes.get("/",async (req, res, next)=>{
    try{
const docs = await User.find().select()
res.status(200).json({
    count: docs.length,
    User: docs,
})
    }catch(err){
        console.log(err);
        res.status(500).json({
            error: err
        })
    }
})
// Get the user By Id 
routes.get("/:userId", async (req, res, next)=>{
    try{
const id = req.params.userId;
const doc = await User.findById(id).select()
console.log(doc);
if(doc){
    res.status(200).json({
        user:doc,
    })
}else{
    res.status(404).json({
        messege: "No valid entry found for the this provide ID"
    })
}
    }catch(err){
        console.log(err);
        res.status(500).json({
            error:err
        })
    }
})
// Update the user

routes.patch("/:userId",upload.single('userImage'), async (req, res, next)=>{
const id = req.params.userId;
const {name, email, password} = req.body;
    try{
const user = await User.findById(id)
if(!user){
    return res.status(404).json({
        success : false,
        message: "User not found"
    });
}
// Hash the new password if provided, otherwise retain the existing passwordHash
const salt = await bcrypt.genSalt(10);
const hashedPassword = await bcrypt.hash(password, salt);
const result = await User.findByIdAndUpdate({_id:id},{
    $set:{
        name: req.body.name,
            userName: req.body.userName,
            userImage: req.file ? req.file.path : null,
            email: req.body.email,
            password: hashedPassword,
            adress : req.body.adress,
            createAt: req.body.createAt,
            new:true,
    }
})
return res.status(200).json({
    messege: "User Update Sucessfully"
})
}catch(err){
    console.log(err);
    res.status(500).json({
        error:err
    })
}
});

//Delete the user

routes.delete("/:userId", async(req, res, next)=>{
    try{
const id = req.params.userId;
await User.deleteOne({_id: id})
res.status(200).json({
    messege: "USer Deleted"
})
    }catch(err){
    console.log(err);
    res.status(500).json({
        error:err
    })
}
})
module.exports = routes;