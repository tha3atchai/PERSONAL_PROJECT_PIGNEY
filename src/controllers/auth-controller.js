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
        const user = await prisma.user.create({
            data: value,
        });
        const payload = { userId: user.id};
        const token = jwt.sign(payload, process.env.JWT_SECRET_KEY || "secret", {expiresIn: process.env.JWT_EXPIRE});
        delete user.password;
        const myGoal = await prisma.piggy.findMany({
            where: {
                ownerId: user.id,
            },
        });
        const myRecord = await prisma.record.findMany({
            where: {
                userId: user.id,
            },
        });
        res.status(201).json({token , user, myGoal, myRecord});
    }catch(err) {
        next(err);
    };
};

const loginUser = async(req, res, next) => {
    try {
        const {value, error} = loginSchema.validate(req.body);
        if(error) return next(error);
        const user = await prisma.user.findFirst({
            where: {
            OR: [
                {email: value.emailOrMobile},
                {mobile: value.emailOrMobile},
            ],
        }});
        if(!user) return next(createError(400, "invalid credential"));
        const isCorrectPassword = await bcryptjs.compare(value.password, user.password);
        if(!isCorrectPassword) return next(createError(400, "invalid credential"));
        const payload = {
            userId : user.id,
        };
        const token = jwt.sign(payload, process.env.JWT_SECRET_KEY || "secret", {expiresIn: process.env.JWT_EXPIRE});
        delete user.password
        const myGoal = await prisma.piggy.findMany({
            where: {
                ownerId: user.id,
            },
        });
        const myRecord = await prisma.record.findMany({
            where: {
                userId: user.id,
            },
        });
        res.status(201).json({token, user, myGoal, myRecord});
    }catch(err) {
        next(err);
    };
};

const getMe = (req, res) => {
    res.status(200).json({user: req.user});
};

module.exports = {
    registerUser,
    loginUser,
    getMe,
};