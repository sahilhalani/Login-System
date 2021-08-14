const mongoose = require("mongoose");
const bcrypt = require("bcryptjs")

const mySchema = new mongoose.Schema({
    firstname: {
        type: String,
        require: true
    },
    lastname: {
        type: String,
        require: true
    },
    email: {
        type: String,
        require: true,
        unique: true
    },
    gender: {
        type: String,
        require: true
    },
    phone: {
        type: Number,
        require: true,
        unique: true
    },
    age: {
        type: Number,
        require: true
    },
    password: {
        type: String,
        require: true
    },
    confirmpassword: {
        type: String,
        require: true
    }
})

// hashing password

mySchema.pre("save", async function (next) {
    if (this.isModified("password")) {
        this.password = await bcrypt.hash(this.password, 10)
        this.confirmpassword = undefined
    }
    next();
})

//creating collection

const MyCollection = new mongoose.model("user", mySchema);

module.exports = MyCollection;