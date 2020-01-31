const mongoose = require("mongoose");

// Save a reference to the Schema constructor
const Schema = mongoose.Schema;

// Using the Schema constructor, create a new UserSchema object
// This is similar to a Sequelize model
const TitleSchema = new Schema({
    // `title` is required and of type String
    title: {
        type: String,
        required: true
    },

    key: {
        type: String,
        required: true
    }

});

// This creates our model from the above schema, using mongoose's model method
const Title = mongoose.model("Title", TitleSchema);

// Export the Title model
module.exports = Title;
