const prisma = require("../models/prisma");
const { upload } = require("../utils/cloudinary-service");
const createError = require("../utils/createError");

// const getGoal = async(req, res, next) => {
//     try {
//         const allGoals = await prisma.piggy.findMany();
//         res.status(200).json({goals: allGoals});
//     }catch(err) {
//         next(err);
//     };
// };

const getMyGoal = async(req, res, next) => {
    try {
        const userId = +req.user.id;
        const myGoal = await prisma.piggy.findMany({
            where: {
                ownerId: userId,
            },
        });
        
        res.status(200).json({myGoal})
    }catch(err) {
        next(err);
    };
};

const getMyGoalRecord = async(req, res, next) => {
    try {
        const userId = +req.user.id;
        const myRecord = await prisma.record.findMany({
            where: {
                userId: userId,
            },
        });
        res.status(200).json({myRecord});
    }catch(err) {
        next(err);
    };
};

const createGoal = async(req, res, next) => {
    try {
        const ownerId = +req.user.id;
        const {goalName, endDate, goalAmount, note, status} = JSON.parse(req.body.body);
        const newEndDate = new Date(endDate);
        if (!req.files) {
            return next(createError('goal image is required'));
        }

        const response = {};

        if (req.files.goalImage) {
        const url = await upload(req.files.goalImage[0].path);
        response.goalImage = url;
        const goal = await prisma.piggy.create({
            data: {
                goalName,
                endDate: newEndDate,
                goalAmount,
                note,
                status,
                ownerId,
                goalImage: url,
            },
        }); 
        res.status(201).json({goal});
        }else {
            next(createError('goal image is required'));
        };
    }catch(err) {
        next(err);
    };
};

const addFunds = async(req, res, next) => {
    try {
        const userId = +req.user.id;
        const {fund, note, status, piggygoalsId} = req.body;
        const targetPiggy = await prisma.piggy.findUnique({
            where: {
                id: +piggygoalsId,
            },
        });
        const record = await prisma.record.create({
            data: {
                fund: +fund,
                note,
                status,
                piggyId: +piggygoalsId,
                userId,
            },
        });
        await prisma.piggy.update({
            data: {
                currentAmount: targetPiggy.currentAmount+ +fund,
            },
            where: {
                id: +piggygoalsId,
            },
        });
        res.status(201).json({record});
    }catch(err) {
        next(err);
    };
};

const withDraw = async(req, res, next) => {
    try {
        const userId = +req.user.id;
        const {fund, note, status, piggygoalsId} = req.body;
        const targetPiggy = await prisma.piggy.findUnique({
            where: {
                id: +piggygoalsId,
            },
        });
        const record = await prisma.record.create({
            data: {
                fund: +fund,
                note,
                status,
                piggyId: +piggygoalsId,
                userId,
            },
        });
        await prisma.piggy.update({
            data: {
                currentAmount: targetPiggy.currentAmount- +fund,
            },
            where: {
                id: +piggygoalsId,
            },
        });
        res.status(201).json({record});
    }catch(err) {
        next(err);
    };
};


module.exports = {
    createGoal,
    getMyGoal,
    addFunds,
    getMyGoalRecord,
    withDraw,
};