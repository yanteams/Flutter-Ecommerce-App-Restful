const User = require('../models/User');

const CryptoJS = require('crypto-js'); // mã hoá password
const { decrypt } = require('dotenv');

const jwt = require('jsonwebtoken'); // crsf token

module.exports = {
    createUser: async (req, res) => {
        const newUser = new User({
            username: req.body.username,
            email: req.body.email,
            password: CryptoJS.AES.encrypt(req.body.password, process.env.SECRET).toString(), // mã hoá AES
            location: req.body.location,
        });
        try {
            await newUser.save(); // gọi tạo user
            res.status(201).json({ message: "Create account successfully" })
        } catch (error) {

            res.status(500).json({ message: error })
        }
    },
    loginUser: async (req, res) => {
        try {
            const user = await User.find({ email: req.body.email }) // kiểm tra tồn tại
            !user && res.status(401).json("Could not find the user")

            const descryptionpass = CryptoJS.AES.decrypt(user.password, process.env.SECRET);
            const thepassword = descryptionpass.toString(CryptoJS.enc.Utf8)
            thepassword !== req.body.password && res.status(401).json("Wrong password")
            const userToken = jwt.sign({
                id: user._id
            },
                process.env.JWT_SEC, { expiresIn: "21d" }) // Khởi tạo token
            const { password, __v, createAt, ...others } = user._doc;
            res.status(200).json({ ...others, token: userToken })
        } catch (error) {
            res.status(500).json("Failed to login user account")

        }
    }
}