require('dotenv').config();
const express = require("express");
const hbs = require("hbs");
const path = require("path");
require("./db/conn");
const MyCollection = require("./models/registers");
const bcrypt = require("bcryptjs");
const cookieParser = require('cookie-parser');
const auth = require("./middleware/auth")

const app = express();

const port = process.env.PORT || 3000;
const staticpath = path.join(__dirname, "../../public");

app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(express.static(staticpath));
app.use(cookieParser());

app.set("view engine", "hbs");
app.set("views", staticpath);
hbs.registerPartials(staticpath + "/partials");

app.get("/", auth, (req, res) => {
    res.render("index")
});

app.get("/secret", auth, (req, res) => {
    // console.log(`this is the cookie ${req.cookies.jwt}`);
    res.render("secret")
});

app.get("/logout", auth, async (req, res) => {
    try {

        //this to delete generated token from db
        req.user.tokens = req.user.tokens.filter((DbCurToken) => {
            return DbCurToken.token !== req.token //here req.token comes from auth.js and  DbCurToken.token comes from current token stored in db 

        })
        res.clearCookie("jwt")//name of cookie you have set this will clear cookie 

        console.log("Logout Sucessfully");
        await req.user.save(); //coming from auth.js
        res.redirect("login");
    } catch (error) {
        res.status(500).send(error)
        console.log(error);
    }
});

app.get("/logoutall", auth, async (req, res) => {
    try {
        if (req.user) {

            req.user.tokens = [];
            await req.user.save();
            res.clearCookie("jwt")
        }
        console.log("LoggedOut From All Devices");
        res.redirect("login");
    } catch (error) {
        res.status(500).send(error)
        console.log("This is a error of logoutall catch", error);
    }
})

app.get("/register", (req, res) => {
    res.render("register")
});

app.get("/login", (req, res) => {
    res.render("login")
});

// submitting data

app.post("/register", async (req, res) => {
    try {
        const password = req.body.password
        const cpassword = req.body.confirmpassword

        if (password === cpassword) {

            const registerData = new MyCollection({
                firstname: req.body.first_name,
                lastname: req.body.last_name,
                email: req.body.email,
                gender: req.body.gender,
                phone: req.body.phone,
                age: req.body.age,
                password: req.body.password,
                confirmpassword: req.body.confirmpassword
            })
            console.log("the success part  =" + registerData);

            //generating token
            const token = await registerData.generateAuthToken();
            // console.log("the token part  " + token);

            res.cookie("jwt", token, { //here jwt means name of our cookie you can write anything and token means the token which we're storing in database
                expires: new Date(Date.now() + 7000000), //expire time after 30sec
                httpOnly: true //this will prevent user from removing cookie with javascript but user can remove it mannually
            });

            const registered = await registerData.save();
            console.log("the page part  =" + registerData);

            res.status(201).redirect("/");
        } else {
            res.send("Password Doesn't match")
        }
    } catch (error) {
        res.status(400).send(error);
        console.log("There's an error  =" + error);
    }
});


//loggin code

app.post("/login", async (req, res) => {
    try {
        const email = req.body.email
        const Password = req.body.password

        const result = await MyCollection.findOne({ email: email });

        //checking bcrypt pass
        const isMatch = await bcrypt.compare(Password, result.password);

        //generating token
        const token = await result.generateAuthToken();
        // console.log("the token part " + token);
        //for storing token in cookie in browser


        res.cookie("jwt", token, { //here jwt means name of our cookie you can write anything and token means the token which we're storing in database
            expires: new Date(Date.now() + 8000000), //expire time after 30sec
            httpOnly: true //this will prevent user from removing cookie with javascript but user can remove it mannually
        });



        if (isMatch) {
            res.status(202).redirect("/");
        } else {
            res.send("Invalid Passsword")
        }


    } catch (error) {
        res.status(404).send("Invalid Details " + error)
    }
})



app.listen(port, () => {
    console.log(`Listening to port ${port} boss `);
});