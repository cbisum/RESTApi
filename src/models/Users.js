const mongoose = require('mongoose');
const validator = require('validator');
const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken');
const Task = require('./Tasks');



const userSchema = new mongoose.Schema({
    name:{
        type:String,
        required:true,
        trim:true,
    },
    age:{
        type:Number,
        default:0,
        validate(value){
            if(value<0){
                throw new Error('age must be positive age')
            }
        }
    },
    email:{
        type:String,
        required:true,
        trim:true,
        unique:true,
        lowercase:true,
        validate(value){
           if(!validator.isEmail(value)){
               throw new Error('Email is invalid')
           }
        }
    },
    password:{
        type:String,
        required:true,
        minlength:6,
        trim:true,
        validate(value){
            if(value.toLowerCase().includes('password')){
                throw new Error('You cant set this password')
            }
        }
    },
    tokens:[{
        token:{
            type:String,
            required:true
        }
    }],
    avatar:{
        type:Buffer,
    }
},{
    timestamps:true
})

userSchema.virtual("tasks",{
    ref:"Task",
    localField:"_id",
    foreignField:"owner"
})


userSchema.methods.toJSON = function(){
    const user = this
     const userObject = user.toObject()
     delete userObject.password
     delete userObject.tokens
     delete userObject.avatar
     return userObject
}

//creating tokens
userSchema.methods.generateAuthTokens = async function(){
    const user = this
    const token =  jwt.sign({ _id:user._id.toString() },process.env.JWT_SECRET)
    user.tokens=  user.tokens.concat({token})
    await user.save()
    return token
}


//middlware function for login
userSchema.statics.findByCredentials = async(email,password)=>{
    const user = await User.findOne({email})
    if(!user){
        throw new Error('Unable to log in')
    }

    const isMatched = await bcrypt.compare(password,user.password)
    if(!isMatched){
        throw new Error('unable to log in')
    }

    return user
}


//hashing the password
userSchema.pre('save',async function(next){
    const user = this
    if(user.isModified('password')){
        user.password = await bcrypt.hash(user.password,8)
    }
})

//delete user tsks whern user is removed
userSchema.pre("remove",async function(next){
    const user  = this
    await Task.deleteMany({owner:user._id})
    next()

})


//user model creation
const User = mongoose.model('User',userSchema)

module.exports = User