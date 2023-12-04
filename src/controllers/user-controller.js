const fs = require("fs/promises");
const prisma = require("../models/prisma");
const createError = require("../utils/createError");
const { upload } = require("../utils/cloudinary-service");

const updateProfile = async (req, res, next) => {
  try {
    if (!req.files) {
      return next(createError("profile image or cover image is required"));
    }

    const response = {};

    if (req.files.profileImage) {
      const url = await upload(req.files.profileImage[0].path);
      response.profileImage = url;
      const dataUser = await prisma.user.update({
        data: {
          profileImage: url,
        },
        where: {
          id: req.user.id,
        },
      });
      res.status(200).json(dataUser);
    }
  } catch (err) {
    next(err);
  } finally {
    if (req.files.profileImage) {
      fs.unlink(req.files.profileImage[0].path);
    }
  }
};

module.exports = {
  updateProfile,
};
