const bcryptjs = require("bcryptjs");
const jwt = require("jsonwebtoken");
const createError = require("../utils/createError");
const { registerSchema, loginSchema } = require("../validators/auth-validator");
const prisma = require("../models/prisma");

const registerUser = async(req, res, next) => {
    try {
        const {value, error} = registerSchema.validate(req.body);
        if(error) return next(error);
        value.password = await bcryptjs.hash(value.password, 12);
        console.log(value);
        await prisma.user.create({
            data: value,
        });
        res.status(201).json({message: "Register Success."});
    }catch(err) {
        next(err);
    };
};

const loginUser = async(req, res, next) => {
    try {
        const {value, error} = loginSchema.validate(req.body);
        if(error) return next(error);
        const targetUser = await prisma.user.findFirst({
            where: {
            OR: [
                {email: value.emailOrMobile},
                {mobile: value.emailOrMobile},
            ],
        }});
        if(!targetUser) return next(createError(400, "invalid credential"));
        const isCorrectPassword = await bcryptjs.compare(value.password, targetUser.password);
        if(!isCorrectPassword) return next(createError(400, "invalid credential"));
        const payload = {
            userId : targetUser.id,
        };
        const token = jwt.sign(payload, process.env.JWT_SECRET_KEY || "secret", {expiresIn: process.env.JWT_EXPIRE});
        res.status(201).json({message: "Login Success.", token});
    }catch(err) {
        next(err);
    };
};

module.exports = {
    registerUser,
    loginUser,
};