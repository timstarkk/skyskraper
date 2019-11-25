
const mongojs = require("mongojs");
const databaseUrl = "news";
const collections = ["company"];

const db = mongojs(databaseUrl, collections);


$(document).ready(function (e) {
    console.log(e);
    console.log('index.js is running')

    db.company.find({}, function (err, data) {
        // Log any errors if the server encounters one
        if (err) {
            console.log(err);
        }
        else {
            // Otherwise, send the result of this query to the browser
            $('#main').append(`<div>${res.json(data)}</div>`);
            console.log('hello');
        }
    });

})