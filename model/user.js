const mongoose = require ("mongoose");

const userSchema = mongoose.Schema({
name : {type: String, required: true},
userName: {type: String, required: true},
userImage: {type: String, required: true},
email: {type: String, required: true},
password: {type: String, required: true},
adress: {
    street: { type: String},
        city: { type: String},
        state: { type: String},
        postalCode: { type: String},
        country: { type: String}
},
createAt:{type: Date, default: Date.now}
});
module.exports = mongoose.model("User", userSchema)