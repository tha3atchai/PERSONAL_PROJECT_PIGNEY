const prisma = require("../models/prisma");
const fs = require("fs/promises");
const { upload } = require("../utils/cloudinary-service");
const createError = require("../utils/createError");

const getMyGoal = async (req, res, next) => {
  try {
    const userId = +req.user.id;
    const myGoal = await prisma.piggy.findMany({
      where: {
        ownerId: userId,
      },
    });

    res.status(200).json({ myGoal });
  } catch (err) {
    next(err);
  }
};

const getMyGoalRecord = async (req, res, next) => {
  try {
    const userId = +req.user.id;
    const myRecord = await prisma.record.findMany({
      where: {
        userId: userId,
      },
    });
    res.status(200).json({ myRecord });
  } catch (err) {
    next(err);
  }
};

const getPiggyAndRecord = async (req, res, next) => {
  try {
    const piggyAndRecord = await prisma.record.findMany({
      include: {
        piggy: true,
      },
    });
    res.status(200).json({ piggyAndRecord });
  } catch (err) {
    next(err);
  }
};

const getRecordAndUser = async (req, res, next) => {
  try {
    const recordAndUser = await prisma.record.findMany({
      include: {
        user: true,
      },
    });
    res.status(200).json({ recordAndUser });
  } catch (err) {
    next(err);
  }
};

const createGoal = async (req, res, next) => {
  try {
    const ownerId = +req.user.id;
    const { goalName, endDate, goalAmount, note, status } = JSON.parse(
      req.body.body
    );
    const newEndDate = new Date(endDate);
    if (!req.files) {
      return next(createError("goal image is required"));
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
      res.status(201).json({ goal });
    } else {
      next(createError("goal image is required"));
    }
  } catch (err) {
    next(err);
  } finally {
    if (req.files.goalImage) {
      fs.unlink(req.files.goalImage[0].path);
    }
  }
};

const addFunds = async (req, res, next) => {
  try {
    const userId = +req.user.id;
    const { fund, note, status, piggygoalsId } = req.body;
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
        currentAmount: targetPiggy.currentAmount + +fund,
      },
      where: {
        id: +piggygoalsId,
      },
    });
    const user = await prisma.user.findFirst({
      where: {
        id: userId,
      },
    });
    record.user = user;
    record.targetPiggy = targetPiggy;
    res.status(201).json({ record });
  } catch (err) {
    next(err);
  }
};

const withDraw = async (req, res, next) => {
  try {
    const userId = +req.user.id;
    const { fund, note, status, piggygoalsId } = req.body;
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
        currentAmount: targetPiggy.currentAmount - +fund,
      },
      where: {
        id: +piggygoalsId,
      },
    });
    const user = await prisma.user.findFirst({
      where: {
        id: userId,
      },
    });
    record.user = user;
    record.targetPiggy = targetPiggy;
    res.status(201).json({ record });
  } catch (err) {
    next(err);
  }
};

const updateGoal = async (req, res, next) => {
  try {
    const { goalName, endDate, goalAmount, note, piggyId } = req.body;
    const newEndDate = new Date(endDate);
    const newGoal = await prisma.piggy.update({
      data: {
        goalName,
        endDate: newEndDate,
        goalAmount,
        note,
      },
      where: {
        id: +piggyId,
      },
    });
    res.status(200).json({ message: "update goal", newGoal });
  } catch (err) {
    next(err);
  }
};

const deleteGoal = async (req, res, next) => {
  try {
    const piggyId = +req.params.piggyId;
    await prisma.record.deleteMany({
      where: {
        piggyId,
      },
    });
    await prisma.piggy.delete({
      where: {
        id: piggyId,
      },
    });
    res.status(200).json({ message: "delete fn", piggyId });
  } catch (err) {
    next(err);
  }
};

const updateGoalImage = async (req, res, next) => {
  try {
    const piggyId = req.params.piggyId;
    if (!req.files) {
      return next(createError("profile image or cover image is required"));
    }

    const response = {};

    if (req.files.goalImage) {
      const url = await upload(req.files.goalImage[0].path);
      response.goalImage = url;
      const piggy = await prisma.piggy.update({
        data: {
          goalImage: url,
        },
        where: {
          id: +piggyId,
        },
      });
      res.status(200).json(piggy);
    }
  } catch (err) {
    next(err);
  } finally {
    if (req.files.goalImage) {
      fs.unlink(req.files.goalImage[0].path);
    }
  }
};

const goalSuccess = async (req, res, next) => {
  try {
    const piggyId = +req.params.piggyId;
    const result = await prisma.piggy.update({
      data: {
        status: "COMPLETE",
      },
      where: {
        id: piggyId,
      },
    });
    res.status(200).json({ result });
  } catch (err) {
    next(err);
  }
};

module.exports = {
  createGoal,
  getMyGoal,
  addFunds,
  getMyGoalRecord,
  withDraw,
  updateGoal,
  deleteGoal,
  getPiggyAndRecord,
  getRecordAndUser,
  updateGoalImage,
  goalSuccess,
};
