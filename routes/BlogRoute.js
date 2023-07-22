const express = require('express');
const { check, validationResult } = require("express-validator");

const auth = require('../middleware/auth.js');
const Blog = require('../models/Blog.js');
const User = require('../models/User.js');

const blogRouter = express.Router();

blogRouter.get('/', auth, async (req, res) => {
    try {
        const blogs = await Blog.find();
        return res.status(200).json(blogs);
    }catch (err){
        console.error(err);
        return res.status(500).send('server error');
    }
});

blogRouter.get('/:id', auth, async (req, res) => {
   try{
       const blog = await Blog.findById(req.params.id);

       if(!blog){
           return res.status(404).json({ msg: 'No Blog Found' })
       }

       return res.status(200).json(blog);
   } catch (err){
       console.error(err);
       if(err.kind === 'ObjectId'){
           return res.status(404).json({ msg: 'No Post Found' })
       }
       return res.status(500).send('server error');
   }
});

blogRouter.post('/', auth, [
    check('blogHeader', 'heading is required').isLength({ min: 10 }),
    check('blogBody', 'body is required').isLength({ min: 10 }),
    check('postedDate', 'Invalid posted date').custom((value) => {
        const dateTimestamp = Date.parse(value);
        if (Number.isNaN(dateTimestamp)) {
            throw new Error('Invalid date format');
        }
        return true;
    }),
], async (req, res) => {
    const errors = validationResult(req);

    if(!errors.isEmpty()){
        return res.status(400).json({ errors: errors.array() })
    }

    const { blogHeader, blogBody, postedDate } = req.body;

    try{
        const user = await User.findOne({
            email: req.user.email
        });

        const blog = new Blog({
            blogHeader: blogHeader,
            blogBody: blogBody,
            postedDate: postedDate,
            author: user._id
        });

        await blog.save();
        return res.status(200).json(blog);

    }catch (err){
        console.error(err);
        return res.status(500).send('server error');
    }
});

blogRouter.put('/:id', auth, [
    check('blogHeader', 'heading is required').isLength({ min: 10 }),
    check('blogBody', 'body is required').isLength({ min: 10 }),
], async (req, res) => {
    const errors = validationResult(req);

    if(!errors.isEmpty()){
        return res.status(400).json({ errors: errors.array() })
    }

    const { blogHeader, blogBody } = req.body;

    try{
        const blog = await Blog.findById(req.params.id);

        if(!blog){
            return  res.status(400).json({ msg: 'No Blog Found' })
        }

        blog.blogHeader = blogHeader;
        blog.blogBody = blogBody;
        await blog.save();

        return res.status(200).json(blog);
    }catch (err){
        console.error(err);
        return res.status(500).send('server error');
    }
});

blogRouter.delete('/:id', auth, async (req, res) => {
    try{
        const blog = await Blog.findById(req.params.id);

        if(!blog){
            return res.status(404).json({ msg: 'No Blog Found' })
        }

        await Blog.findByIdAndRemove(req.params.id);
        return res.status(200).json({ msg: 'post deleted'});
    }
    catch (err){
        console.error(err);
        return res.status(500).send('server error');
    }
})

module.exports = blogRouter;