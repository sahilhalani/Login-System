const jwt = require("jsonwebtoken");
const MyCollection = require("../models/registers");

const auth = async (req, res, next) => {
    try {
        const token = req.cookies.jwt;
        const verifyUser = jwt.verify(token, process.env.jsonkey);
        // console.log(verifyUser);
        const user = await MyCollection.findOne({ _id: verifyUser._id })

        var login = false;
        if (user) {

            user.tokens.forEach(e => {
                if (token === e.token) {
                   login = true;
                }
            });

            req.token = token;
            req.user = user;

            if (!login) {
                res.redirect("login");
                return
            } else {

                return next();
            }

        }


    } catch (error) {
        res.redirect("login");
        console.log(`this is a catch error in auth${error}`);
    }
};

module.exports = auth;
