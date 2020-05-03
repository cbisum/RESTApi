const express = require('express')
const Task = require('../models/Tasks')
const auth = require('../middleware/auth')
const router = express.Router()



//create task and save to the database-endpoint cration
router.post('/tasks',auth,async (req,res)=>{
  
    const task = new Task({
        ...req.body,
        owner:req.user._id
    })
    
    try {
        await task.save()
        res.status(201).send(task)
    } catch (error) {
        res.status(400).send(error)
        
    }
})

//read all the task

router.get('/tasks',auth, async (req,res)=>{
    const match = {}
    const sort ={}
    if(req.query.completed){
        match.completed = req.query.completed ==='true'
    }
    if(req.query.sortBy){
        const parts = req.query.sortBy.split(':')
        sort[parts[0]] = parts[1]==='desc'?-1:1
    }
    try {
        await req.user.populate({
            path:'tasks',
            match,
            options:{
                limit:parseInt(req.query.limit),
                skip:parseInt(req.query.skip),
                sort
            }
        }).execPopulate()
        res.send(req.user.tasks)
    } catch (error) {
        res.status(500).send(error)
    }
})

//read single task
router.get('/tasks/:id',auth,async(req,res)=>{
    const _id = req.params.id

    try {
        // await req.user.populate('tasks').execPopulate()
        const task = await Task.findOne({_id, owner:req.user._id})

       
        if(!task){
            return res.status(404).send();
        }
        res.status(200).send(task);
    } catch (error) {
        res.status(500).send(error)
    }
})


//update task
router.patch('/tasks/:id',auth,async(req,res)=>{
    const updates = Object.keys(req.body)
    const allowedUpdates = ['description','completed']
    const isvalidoperation = updates.every((update)=>allowedUpdates.includes(update))
    if(!isvalidoperation){
        return res.status(400).send({error:'invalid updates'})
    }
    
    try {
        const task = await Task.findOne({_id:req.params.id,owner:req.user._id})
        updates.forEach((update)=>task[update]=req.body[update])
        await task.save()
        
        if(!task){
            return res.status(404).send()
        }

        res.send(task)
    } catch (error) {
        res.status(400).send(error)
    }
})

//delete task

router.delete('/tasks/:id',auth,async(req,res)=>{
    try {
        const task = await Task.findOneAndDelete({_id:req.params.id,owner:req.user._id})
        if(!task){
            return res.status(404).send()
        }
        res.status(200).send(task)        
    } catch (error) {
        res.send(500).send(error)
        
    }
})


module.exports = router

