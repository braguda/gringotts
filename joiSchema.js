const Joi = require("joi");

module.exports.postSchemaJoi = Joi.object({
    post: Joi.object({
        title: Joi.string().required(),
        body: Joi.string().required(),
    }).required()
});

module.exports.commentSchemaJoi = Joi.object({
    comment: Joi.object({
        commentBody: Joi.string().required(),
        likes: Joi.number()
    }).required()
});