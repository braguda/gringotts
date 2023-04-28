const joi = require("joi");

module.exports.postSchemaJoi = joi.object({
    post: joi.object({
        title: joi.string().required(),
        body: joi.string().required(),
    }).required()
});