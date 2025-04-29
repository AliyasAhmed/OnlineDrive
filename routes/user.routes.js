import express, { json } from 'express';
import { body, validationResult } from 'express-validator';
import userModel from '../models/user.models.js';
import bcrypt from 'bcrypt'
import jwt from 'jsonwebtoken'

const router = express.Router();

router.get('/register', (req, res) => {
    res.render('register');
});
router.post('/register',
    // to check if email, password, username is valid and has no empty spaces, we use these middleware
    body('email').trim().isEmail().isLength({ min: 13 }),
    body('password').trim().isLength({ min: 5 }),
    body('username').trim().isLength({ min: 3 }),
    async (req, res) => {

        const errors = validationResult(req)
        if (!errors.isEmpty()) {

            return res.status(400).json({ errors: errors.array(), message: 'invalid data' })
        }
        const { username, email, password } = req.body
        const hashPassword = await bcrypt.hash(password, 10)
        const newUser = await userModel.create({
            email, username, password: hashPassword
        })
        res.json(newUser)
    })

router.get('/login', (req, res) => {
    res.render('login')
})

router.post('/login',
    body('username').trim().isLength({ min: 3 }),
    body('password').trim().isLength({ min: 5 }),
    async (req, res) => {
        const errors = validationResult(req)
        if (!errors.isEmpty()) {
            return res.status(400).json({
                error: errors.array(),
                message: "invalid data"
            })
        }
        const { username, password } = req.body
        const user = await userModel.findOne({
            username: username
        })
        if (!user) {
            return res.status(400).json({
                message: 'username or password is incorrect'
            })
        }

        // Log the user password from DB and the entered password to see what is being compared
        console.log("Stored hashed password in DB: ", user.password)
        console.log("Entered password: ", password)

        const isMatch = await bcrypt.compare(password, user.password)

        // Log the result of bcrypt comparison
        console.log("Password match result: ", isMatch)

        if (!isMatch) {
            return res.status(400).json({
                message: 'username or password is incorrect'
            })
        }

        const token = jwt.sign({
            userId: user._id,
            email: user.email,
            username: user.username
        },
            process.env.JWT_SECRET,
        )
        res.cookie('token', token)
        res.send('logged in')
    })

export default router;
