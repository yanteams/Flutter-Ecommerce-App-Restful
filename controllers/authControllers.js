const User = require('../models/User');
const CryptoJS = require('crypto-js');
const jwt = require('jsonwebtoken');
const nodemailer = require('nodemailer');
const smtpTransport = require('nodemailer-smtp-transport');
const { MONGO_DB_CONFIG } = require("../config/app.config");
// Cấu hình transport SMTP
const transporter = nodemailer.createTransport(
    smtpTransport({
        host: MONGO_DB_CONFIG.SMTP,
        port: MONGO_DB_CONFIG.PORT_SMTP,
        auth: {
            user: MONGO_DB_CONFIG.USERNAME_SMTP,
            pass: MONGO_DB_CONFIG.PASSWORD_SMTP,
        },
    })
);

module.exports = {
    createUser: async (req, res) => {
        try {
            const existingUser = await User.findOne({
                $or: [{ username: req.body.username }, { email: req.body.email }],
            });
            if (existingUser) {
                return res
                    .status(400)
                    .json({ message: "Username or email already exists", data: null, statusCode: 400 });
            }

            if (req.body.password !== req.body.repassword) {
                return res.status(400).json({ message: "Password does not match", data: null, statusCode: 400 });
            }

            const verificationToken = jwt.sign(
                { email: req.body.email },
                MONGO_DB_CONFIG.JWT_SECRET,
                { expiresIn: "7d" }
            );

            const newUser = new User({
                fullname: req.body.fullname,
                username: req.body.username,
                email: req.body.email,
                password: CryptoJS.AES.encrypt(
                    req.body.password,
                    MONGO_DB_CONFIG.SECRET
                ).toString(),
                confirmPassword: CryptoJS.AES.encrypt(
                    req.body.repassword,
                    MONGO_DB_CONFIG.SECRET
                ).toString(),
                phone: req.body.phone,
                isVerified: false,
                verificationToken: verificationToken,
            });

            await newUser.save();

            const verificationUrl = `http://localhost:3005/api/verify-email?token=${verificationToken}`;

            // Gửi email xác minh
            const mailOptions = {
                from: `${MONGO_DB_CONFIG.DISPLAYNAME_SMTP} <${MONGO_DB_CONFIG.USERNAME_SMTP}>`,
                to: req.body.email,
                subject: 'Email Verification',
                html: `<div style="font-family: Helvetica, Arial, sans-serif; min-width: 1000px; overflow: auto; line-height: 2">
                <div style="margin: 50px auto; width: 70%; padding: 20px 0">
                  <div style="display: flex">
                    <u></u><u></u><u></u><u></u><u></u><u></u><u></u><u></u><u></u><u></u><u></u><u></u>
                  </div>
                  <div style="border-bottom: 1px solid #eee">
                    <p style="font-size: 1.4em; color: #00466a; text-decoration: none; font-weight: 600">Xác Nhận Email</p>
                  </div>
                  <p style="font-size: 1.1em">
                    Xin chào,<br>
                    Chúng tôi đã nhận được yêu cầu xác nhận tài khoản của bạn qua email
                    <strong>Admin</strong> thông qua địa chỉ email
                    <span style="font-weight: 700">${req.body.email}</span> được gửi đến tại
                    <a href="${verificationUrl}" style="color: #5a5ad1" target="_blank">${MONGO_DB_CONFIG.PROJECTNAME}</a>.
                  </p>
                  <p>Vui lòng nhấp vào liên kết bên dưới để xác minh:</p>
                  <a href="${verificationUrl}" style="style="background:#00466a;margin:0 auto;width:max-content;padding:10px 20px;color:#fff;border-radius:4px;text-decoration: none;"">Xác minh tại đây</a>
                  <p>Nếu bạn không nhận được bất kỳ phản hồi nào, có thể một ai đó đang cố truy cập vào tài khoản của bạn. Vui lòng không chuyển tiếp hoặc cung cấp mã này cho bất kỳ ai khác.</p>
                  <p style="font-size: 0.9em">Trân trọng,<br>Admin - <a href="${verificationUrl}" style="color: #5a5ad1" target="_blank">${MONGO_DB_CONFIG.PROJECTNAME}</a></p>
                  <hr style="border: none; border-top: 1px solid #eee">
                  <div style="display: flex; padding: 8px 0; color: #aaa; font-size: 0.8em; line-height: 1; font-weight: 300">
                    <p>${MONGO_DB_CONFIG.PROJECTNAME}</p>
                    <p style="margin-left: auto">141 Điện Biên Phủ, Quận Bình Thạnh, Thành phố Hồ Chí Minh.</p>
                    <p style="margin-left: auto">UEF</p>
                  </div>
                </div>
              </div>`,
            };

            transporter.sendMail(mailOptions, (error, info) => {
                if (error) {
                    console.log(error);
                    return res.status(500).json({ message: "Failed to send verification email", data: null });
                }
                console.log('Email sent: ' + info.response);
                res.status(201).json({ message: "Account created successfully", data: null });
            });
        } catch (error) {
            res.status(500).json({ message: "Failed to create user account", data: null });
        }
    },
    resendEmail: async (req, res) => {
        try {
            const { email } = req.body;

            const user = await User.findOne({ email });
            if (!user) {
                return res.status(400).json({ message: "Could not find the user" });
            }

            if (user.isVerified) {
                return res.status(400).json({ message: "Email already verified" });
            }

            const verificationToken = jwt.sign(
                { email: user.email },
                MONGO_DB_CONFIG.JWT_SECRET,
                { expiresIn: "7d" }
            );

            user.verificationToken = verificationToken;
            await user.save();

            const verificationUrl = `http://localhost:3005/api/verify-email?token=${verificationToken}`;

            const mailOptions = {
                from: `${MONGO_DB_CONFIG.DISPLAYNAME_SMTP} <${MONGO_DB_CONFIG.USERNAME_SMTP}>`,
                to: email,
                subject: 'Resend Email Verification',
                html: `<div style="font-family: Helvetica, Arial, sans-serif; min-width: 1000px; overflow: auto; line-height: 2">
                <div style="margin: 50px auto; width: 70%; padding: 20px 0">
                  <div style="display: flex">
                    <u></u><u></u><u></u><u></u><u></u><u></u><u></u><u></u><u></u><u></u><u></u><u></u>
                  </div>
                  <div style="border-bottom: 1px solid #eee">
                    <p style="font-size: 1.4em; color: #00466a; text-decoration: none; font-weight: 600">Xác Nhận Email</p>
                  </div>
                  <p style="font-size: 1.1em">
                    Xin chào,<br>
                    Chúng tôi đã nhận được yêu cầu xác nhận tài khoản của bạn qua email
                    <strong>Admin</strong> thông qua địa chỉ email
                    <span style="font-weight: 700">${email}</span> được gửi đến tại
                    <a href="${verificationUrl}" style="color: #5a5ad1" target="_blank">${MONGO_DB_CONFIG.PROJECTNAME}</a>.
                  </p>
                  <p>Vui lòng nhấp vào liên kết bên dưới để xác minh:</p>
                  <a href="${verificationUrl}" style="style="background:#00466a;margin:0 auto;width:max-content;padding:10px 20px;color:#fff;border-radius:4px;text-decoration: none;"">Xác minh tại đây</a>
                  <p>Nếu bạn không nhận được bất kỳ phản hồi nào, có thể một ai đó đang cố truy cập vào tài khoản của bạn. Vui lòng không chuyển tiếp hoặc cung cấp mã này cho bất kỳ ai khác.</p>
                  <p style="font-size: 0.9em">Trân trọng,<br>Admin - <a href="${verificationUrl}" style="color: #5a5ad1" target="_blank">${MONGO_DB_CONFIG.PROJECTNAME}</a></p>
                  <hr style="border: none; border-top: 1px solid #eee">
                  <div style="display: flex; padding: 8px 0; color: #aaa; font-size: 0.8em; line-height: 1; font-weight: 300">
                    <p>${MONGO_DB_CONFIG.PROJECTNAME}</p>
                    <p style="margin-left: auto">141 Điện Biên Phủ, Quận Bình Thạnh, Thành phố Hồ Chí Minh.</p>
                    <p style="margin-left: auto">UEF</p>
                  </div>
                </div>
              </div>`,
            };

            transporter.sendMail(mailOptions, (error, info) => {
                if (error) {
                    console.log(error);
                    return res.status(500).json({ message: "Failed to resend verification email", data: null });
                }
                console.log('Email sent: ' + info.response);
                res.status(200).json({ message: "Verification email resent successfully", data: null, statusCode: 200 });
            });
        } catch (error) {
            res.status(500).json({ message: "Failed to resend email verification", data: null });
        }
    },
    verifyEmail: async (req, res) => {
        const { token } = req.query;

        try {
            const decodedToken = jwt.verify(token, MONGO_DB_CONFIG.JWT_SECRET);
            const email = decodedToken.email;

            const user = await User.findOne({ email });
            if (user) {
                user.isVerified = true;
                user.verificationToken = null;
                await user.save();
                return res.status(200).json({ message: "Email verified successfully" });
            } else {
                return res.status(400).json({ message: "Invalid verification token" });
            }
        } catch (error) {
            return res
                .status(500)
                .json({ message: "Failed to verify email", error: error.message });
        }
    },

    loginUser: async (req, res) => {
        try {
            const user = await User.findOne({ email: req.body.email });
            if (!user) {
                return res.status(401).json({ message: "Could not find the user" });
            }

            if (!user.isVerified) {
                return res
                    .status(401)
                    .json({ message: "Email not verified. Please verify your email first" });
            }

            const decryptedPassword = CryptoJS.AES.decrypt(
                user.password,
                MONGO_DB_CONFIG.SECRET
            ).toString(CryptoJS.enc.Utf8);
            if (decryptedPassword !== req.body.password) {
                return res.status(401).json({ message: "Wrong password" });
            }

            const token = jwt.sign({ id: user._id }, MONGO_DB_CONFIG.JWT_SECRET, {
                expiresIn: "21d",
            });

            const {
                password,
                __v,
                createdAt,
                isVerified,
                verificationToken,
                ...userDetails
            } = user._doc;

            res.status(200).json({ ...userDetails, token });
        } catch (error) {
            console.log(error);
            res.status(500).json({ message: "Failed to login user account", error: error.message });
        }
    },
};