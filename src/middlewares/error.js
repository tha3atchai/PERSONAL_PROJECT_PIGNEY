module.exports = (err, req, res, next) => {
    console.dir(err);
    if(err.name === "ValidationError") err.statusCode = 400;
    if(err.meta?.target === "User_email_key"){
        err.message = "Email Or Mobile is already taken.";
        err.statusCode = 400;
    };
    res.status(err.statusCode || 500).json({message: err.message});
};