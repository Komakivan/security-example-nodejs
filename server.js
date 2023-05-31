const express = require('express')
const path =  require('path')
const https = require('https')
const fs = require('fs')
const cors = require('cors')
const helmet = require('helmet')
const passport = require('passport')
const {Strategy}   = require('passport-google-oauth20')
const cookieSession = require('cookie-session')

require('dotenv').config()


const {getData,rawData} = require('./enterprise.model')

const config = {
  CLIENT_ID: process.env.CLIENT_ID,
  CLIENT_SECRET: process.env.CLIENT_SECRET,
  COOKIE_KEY_1: process.env.COOKIE_KEY_1,
  COOKIE_KEY_2: process.env.COOKIE_KEY_2
};


const AUTH_OPTION = {
  callbackURL: "/auth/google/callback",
  clientID: config.CLIENT_ID,
  clientSecret: config.CLIENT_SECRET,
};


function verifyCallback(accessToken,refreszToken,profile,done) {
    console.log(`Google user proile: ${profile}`)
    done(null, profile)
}

passport.use(
  new Strategy(AUTH_OPTION, verifyCallback)
);


// save the session from the cookie
passport.serializeUser((user, done) => {
    done(null, user.id)
})

// read the session from the cookie
passport.deserializeUser((id, done) => {
    // User.findById(id).then(user => {
    //     done(null, user)
    // })
    done(null, id)
})

const app = express()

app.use(helmet())

app.use(cookieSession({
    name: 'session',
    maxAge: 24*60*60*1000,
    keys: [config.COOKIE_KEY_1, config.COOKIE_KEY_2]
}))

app.use(passport.initialize())
app.use(passport.session())

app.use(cors({
    origin: '*'
}))

app.use(express.json())

function checkLoggedIn(req,res,next) {
    console.log('current user:', req.user)
    isLoggedIn = req.isAuthenticated() && req.user
    if(!isLoggedIn) {
        res.status(401).json({
            error: 'you must log in first'
        })
    }

    next( )
}

app.get('/auth/google', passport.authenticate('google',{
    scope: ['email']
}))

app.get('/auth/google/callback', passport.authenticate('google',{
    failureRedirect: '/failure',
    successRedirect: '/',
    session: true
}),(req, res) => {
    console.log('Google called us back..!')
})


app.get('/auth/logout', (req, res) => {
    req.logOut() // removes req.user and clears any sessions
    return res.redirect('/')
})

app.get('/secret', checkLoggedIn, async (req,res) => {
    res.status(200).json(await rawData)
})


app.get('/failure', (req, res) => {
    return res.send('Failed to log')
})

app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname,'public','index.html'))
})


async function startServer(){
    await getData()
    https
      .createServer({
        key: fs.readFileSync('key.pem'),
        cert: fs.readFileSync('certificate.pem')
      },app)
      .listen(3000, () => {
        console.log("server is listening.....");
      });

}

startServer()