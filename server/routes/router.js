const express = require("express");
const router = new express.Router();
const products = require("../models/productSchema");
const USER = require("../models/userSchema");
const bcrypt = require('bcryptjs');
const authenticate = require("../middleware/authenticate");

//get product data api
router.get("/getproducts", async (req, res) => {
    try {

        //console.log("hi swetu...");
        const productsdata = await products.find();
        //console.log("console the data" + productsdata);
        res.status(201).json(productsdata);
    } catch (error) {

        console.log("error:" + error.message);

    }
});

//get individual data
router.get("/getproductsone/:id", async (req, res) => {
    try {
        const { id } = req.params;
        const indiviualdata = await products.findOne({ id: id });
        //console.log("console the data" + indiviualdata);
        res.status(201).json(indiviualdata);
    } catch (error) {
        res.status(400).json(indiviualdata);
        console.log("error:" + error.message);

    }
});


//register data

router.post("/register", async (req, res) => {
    //console.log(req.body)
    const { fname, email, mobile, password, cpassword } = req.body;
    if (!fname || !email || !mobile || !password || !cpassword) {
        res.status(422).json({ error: "fill the all data" });
        console.log("not data available");
    };

    try {

        const preuser = await USER.findOne({ email: email });
        if (preuser) {
            res.status(422).json({ error: "this is already present" });
        }
        else if (password !== cpassword) {
            res.status(422).json({ error: "password and cpassword not match" });
        }
        else {
            const finalUser = new USER({
                fname, email, mobile, password, cpassword
            });
            const storedata = await finalUser.save();
            console.log(storedata);
            res.status(201).json(storedata);
        }

    } catch (error) {

    }

})



//login user api

/*

router.post("/login", async (req, res) => {
    // console.log(req.body);
    const { email, password } = req.body;

    if (!email || !password) {
        res.status(400).json({ error: "fill the details" });
    };

    try {

        const userlogin = await USER.findOne({ email: email });
        //console.log(userlogin+ "user login");


        if (userlogin) {
            const isMatch = await bcrypt.compare(password, userlogin.password);
            //console.log(isMatch);


            //token generate

            const token = await userlogin.generatAuthtoken();
            //console.log(token);

            res.cookie("Amazonweb ", token, {
                expire: new Date(Date.now() + 900000),
                httpOnly: true
            })


            if (!isMatch) {
                res.status(400).json({ error: "invalid details" });
            }
            else {
                res.status(201).json({ message: "password match"});

            }

        }

        else {

            res.status(400).json({ error: "invalid details" });

        }

    } catch (error) {
        res.status(400).json({ error: "invalid details" });

    }
});
*/

router.post("/login", async (req, res) => {
    // console.log(req.body);
    const { email, password } = req.body;

    if (!email || !password) {
        res.status(400).json({ error: "fill the details" });
    }

    try {

        const userlogin = await USER.findOne({ email: email });
        console.log(userlogin);
        if (userlogin) {
            const isMatch = await bcrypt.compare(password, userlogin.password);
            console.log(isMatch);



            if (!isMatch) {
                res.status(400).json({ error: "invalid crediential pass" });
            } else {
                
                const token = await userlogin.generatAuthtoken();
                console.log(token);

                res.cookie("Amazonweb", token, {
                    expire: new Date(Date.now() + 900000),
                    httpOnly: true
                });
                res.status(201).json(userlogin);
            }

        } else {
            res.status(400).json({ error: "user not exist" });
        }

    } catch (error) {
        res.status(400).json({ error: "invalid crediential pass" });
        console.log("error the bhai catch ma for login time" + error.message);
    }
});




//adding the data into cart 

router.post("/addcart/:id", authenticate, async (req, res) => {

    try {

        const { id } = req.params;
        const cart = await products.findOne({ id: id });
        console.log(cart + "cart data");

        const UserContact = await USER.findOne({ _id: req.userID });
        console.log(UserContact);

        if (UserContact) {
            const cartdata = await UserContact.addcartdata(cart);
            await UserContact.save();
            // console.log(cartdata);
            res.status(201).json(UserContact)

        }
        else {
            res.status(401).json({ error: "invalid user" });
        }
    } catch (error) {
        res.status(401).json({ error: "invalid user" });
    }

})

//get cart details

router.get("/cartdetails", authenticate, async (req, res) => {

    try {

        const buyuser = await USER.findOne({ _id: req.userID });
        res.status(201).json(buyuser);

    } catch (error) {
        console.log("error" + error);
    }

})


//get valid user

router.get("/validuser",authenticate,async(req,res)=>{
    try {

        const validuserone=await USER.findOne({_id:req.userID});
        res.status(201).json(validuserone);
        
        
    } catch (error) {

        console.log("error :" + error)
        
    }
})
//remove item from th cart

router.delete("/remove/:id", authenticate, (req, res) => {
    try {
        const { id } = req.params;
        req.rootUser.carts = req.rootUser.carts.filter((cruval) => {
            return cruval.id != id;
        })

        req.rootUser.save();
        res.status(201).json(req.rootUser);
        console.log("item remove");
    } catch (error) {
        console.log("error :" + error);
        req.status(400).json(req.rootUser);

    }
})


// for user logout

router.get("/logout",authenticate,(req,res)=>{
    try {

        req.rootUser.tokens=req.rootUser.tokens.filter((curelem)=>{
            return curelem.token !==req.token
        });
        res.clearCookie("Amazonweb",{path:"/"});
        req.rootUser.save();
        res.status(201).json(req.rootUser.tokens);
        console.log("user logout");
        
    } catch(error) {

        console.log("error for user logout");
    }
})


module.exports = router;