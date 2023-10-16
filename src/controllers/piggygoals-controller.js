const prisma = require("../models/prisma");

const createGoal = async(req, res, next) => {
    try {
        const ownerId = req.user.id;
        const {goalName, endDate, goalAmount, note, status} = req.body;
        await prisma.piggy.create({
            data: {
                goalName,
                endDate,
                goalAmount,
                note,
                status,
                ownerId,
            },
        }); 
        res.status(201).json({message: "Test Post"});
    }catch(err) {
        next(err);
    };
};

module.exports = {
    createGoal,
};