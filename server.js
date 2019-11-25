// Using this template, the cheerio documentation,
// and what you've learned in class so far, scrape a website
// of your choice, save information from the page in a result array, and log it to the console.

var cheerio = require("cheerio");
var axios = require("axios");
var express = require("express");
var mongojs = require("mongojs");
var path = require('path');

var results = [];

// Initialize Express
var app = express();

app.use(express.static("public"));



var databaseUrl = "news";
var collections = ["company"];

var db = mongojs(databaseUrl, collections);

app.get("/", function (req, res) {
  res.sendFile(path.join(__dirname + '/index.html'));
  res.sendFile(__dirname + '/index.js');
});

// 2. At the "/all" path, display every entry in the animals collection
app.get("/all", function (req, res) {
  // Query: In our database, go to the animals collection, then "find" everything
  db.company.find({}, function (err, data) {
    // Log any errors if the server encounters one
    if (err) {
      console.log(err);
    }
    else {
      // Otherwise, send the result of this query to the browser
      res.json(data);
    }
  });

});

// Make a request via axios to grab the HTML body from the site of your choice
app.get("/scrape", function (req, res) {

  axios.get("https://finviz.com/quote.ashx?t=ATVI").then(function (response) {

    // Load the HTML into cheerio and save it to a variable
    // '$' becomes a shorthand for cheerio's selector commands, much like jQuery's '$'
    var $ = cheerio.load(response.data);

    // Select each element in the HTML body from which you want information.
    // NOTE: Cheerio selectors function similarly to jQuery's selectors,
    // but be sure to visit the package's npm page to see how it works
    $("a.tab-link-news").each(function (i, element) {
      let title = element.children[0].data;
      const link = element.attribs.href;

      console.log(title, link);
      // var title = $(element).children().text();
      // var link = $(element).find("a").attr("href");

      // Save these results in an object that we'll push into the results array we defined earlier
      db.company.insert({
        ticker: "ATVI",
        title,
        link
      });

    });

    // Log the results once you've looped through each of the elements found with cheerio
    console.log(results);
  });
  res.send("Scrape complete");
});


// Set the app to listen on port 3000
app.listen(3000, function () {
  console.log("App running on port 3000!");
});
