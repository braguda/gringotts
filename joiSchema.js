const joi = require("joi");

module.exports.postSchemaJoi = joi.object({
    post: joi.object({
        title: joi.string().required(),
        body: joi.string().required(),
    }).required()
});

module.exports.userSchemaJoi = joi.object({
    user: joi.object({
        email: joi.string().required(),
        username: joi.string().required(),
        password: joi.string().required(),
    }).required()
});

module.exports.commentSchemaJoi = joi.object({
    comment: joi.object({
        commentBody: joi.string().required(),
        likes: joi.number().required(),
        author: joi.string().required()
    }).required()
});