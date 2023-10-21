const fs = require("fs/promises");
const prisma = require("../models/prisma");
const createError = require("../utils/createError");
const { upload } = require("../utils/cloudinary-service");

const updateProfile = async(req, res, next) => {
    try {
        if (!req.files) {
          return next(createError('profile image or cover image is required'));
        }
    
        const response = {};
    
        if (req.files.profileImage) {
          const url = await upload(req.files.profileImage[0].path);
          response.profileImage = url;
          await prisma.user.update({
            data: {
              profileImage: url
            },
            where: {
              id: req.user.id
            }
          });
        }

        res.status(200).json(response);
    } catch (err) {
      next(err);
    } finally {
      if (req.files.profileImage) {
        fs.unlink(req.files.profileImage[0].path);
      }
    };
};

// await prisma.piggy.findMany({
//   include: {
//     records: {
//       select: {
//         fund: true,
//         status: true,
//       },
//     },
//   },
// });

module.exports = {
    updateProfile,
};