const express = require("express");
const hbs = require("hbs");
const path = require("path");
require("./db/conn");
const MyCollection = require("./models/registers");
const bcrypt = require("bcryptjs");

const app = express();

const port = process.env.PORT || 3000;
const staticpath = path.join(__dirname, "../../public");

app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(express.static(staticpath));

app.set("view engine", "hbs");
app.set("views", staticpath);
hbs.registerPartials(staticpath + "/partials");

app.get("/", (req, res) => {
    res.render("index")
});

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

            const save = await registerData.save();
            res.status(201).render("index");

        } else {
            res.send("Password Doesn't match")
        }
    } catch (error) {
        res.status(400).send(error);
    }
});

//loggin code

app.post("/login",async(req,res)=>{
try {
  const email = req.body.email
  const Password = req.body.password  

 const result= await  MyCollection.findOne({email:email});

 //checking bcrypt pass
 const isMatch = await bcrypt.compare(Password,result.password);

 if(isMatch){
     res.status(202).render("index");
 }else{
     res.send("Invalid Passsword")
 }
 

} catch (error) {
    res.status(404).send("Invalid Details")
}
})
   
    

app.listen(port, () => {
    console.log(`Listening to port ${port} boss `);
});