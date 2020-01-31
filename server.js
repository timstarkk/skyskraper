const express = require("express");
const exphbs = require('express-handlebars');
const logger = require("morgan");
const mongoose = require("mongoose");

// Our scraping tools
// Axios is a promised-based http library, similar to jQuery's Ajax method
// It works on the client and on the server
const axios = require("axios");
const cheerio = require("cheerio");

// Require all models
const db = require("./models");

const PORT = process.env.PORT || 1337;

// Connect to the Mongo DB
const MONGODB_URI = process.env.MONGODB_URI || "mongodb://localhost/article-scraper";

mongoose.connect(MONGODB_URI, { useNewUrlParser: true });

// Initialize Express
const app = express();

app.engine('handlebars', exphbs());
app.set('view engine', 'handlebars');

app.get('/', function (req, res) {
  // axios.get("https://finviz.com/quote.ashx?t=ATVI").then(function (response) {
  //   // Then, we load that into cheerio and save it to $ for a shorthand selector
  //   const $ = cheerio.load(response.data);

  //   $("a.tab-link-news").each(function (i, element) {
  //     const title = element.children[0].data;
  //     const link = element.attribs.href;


  //     const result = {
  //       title,
  //       link
  //     }

  // mongoose.connection.collections['articles'].drop(function (err) {
  //   console.log('collection dropped');
  // });

  //     // Create a new Article using the `result` object built from scraping
  //     db.Article.create(result)
  //       .then(function (dbArticle) {
  //         // View the added result in the console
  //         console.log('under here is teh article')
  //         console.log(dbArticle);
  //       })
  //       .catch(function (err) {
  //         // If an error occurred, log it
  //         console.log(err);
  //       });
  //   });

  // Send a message to the client
  // res.send("Scrape Complete");

  //   res.render('index');
  // });

  res.render("index", {
    title: "Welcome!"
  });
});

// Configure middleware

// Use morgan logger for logging requests
app.use(logger("dev"));
// Parse request body as JSON
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
// Make public a static folder
app.use(express.static("public"));

// Routes



// A GET route for scraping the The Onion website
app.get("/scrape/:id", function (req, res) {
  // console.log(req.params.id);
  let searchTerm = req.params.id;
  let searchTermObject = {
    title: searchTerm,
    key: 'key'
  }

  mongoose.connection.collections['titles'].drop(function (err) {
    console.log('collection dropped');
  });

  db.Title.create(searchTermObject)
    .then(function (dbArticle) {
      // View the added result in the console
      // console.log(dbArticle);
    })
    .catch(function (err) {
      // If an error occurred, log it
      console.log(err);
    });


  // mongoose.connection.collection("titles").find({}, function (err, cursor) {
  //   if (err) throw err;
  //   console.log('------')
  //   cursor.toArray().then(function (result) {
  //     console.log(result);
  //   }).catch(function (error) {
  //     console.log(error);
  //   })
  //   console.log('=---0-0-')
  // });

  // let theTitle;

  // async function getTitle() {
  //   theTitle = await mongoose.connection.collection('titles').find({}).toArray();
  //   console.log('++++++++++++');
  //   console.log(theTitle);
  //   cons
  // }

  // getTitle();

  // console.log('++++++++++++++++');
  // console.log(theTitle);
  // console.log('++++++++++++++++');


  // First, we grab the body of the html with axios
  axios.get(`https://finviz.com/quote.ashx?t=${searchTerm}`).then(function (response) {
    // Then, we load that into cheerio and save it to $ for a shorthand selector
    const $ = cheerio.load(response.data);

    $("a.tab-link-news").each(function (i, element) {
      const title = element.children[0].data;
      const link = element.attribs.href;


      const result = {
        title,
        link
      }

      mongoose.connection.collections['articles'].drop(function (err) {
        // console.log('collection dropped');
      });

      // Create a new Article using the `result` object built from scraping
      db.Article.create(result)
        .then(function (dbArticle) {
          // View the added result in the console
          // console.log('under here is teh article')
          // console.log(dbArticle);
        })
        .catch(function (err) {
          // If an error occurred, log it
          console.log(err);
        });
    });

    // Send a message to the client
    res.send("Scrape Complete");
  });
});

// Route for getting all Articles from the db
app.get("/articles", function (req, res) {
  // Grab every document in the Articles collection
  db.Article.find({})
    .then(function (dbArticle) {
      // If we were able to successfully find Articles, send them back to the client
      res.json(dbArticle);
    })
    .catch(function (err) {
      // If an error occurred, send it to the client
      res.json(err);
    });
});

app.get("/title", function (req, res) {
  db.Title.find({})
    .then(function (result) {
      res.json(result);
    })
    .catch(function (err) {
      res.json(err);
    })
})

// Route for grabbing a specific Article by id, populate it with it's comment
app.get("/articles/:id", function (req, res) {
  // Using the id passed in the id parameter, prepare a query that finds the matching one in our db...
  db.Article.findOne({ _id: req.params.id })
    // ..and populate all of the comments associated with it
    .populate("comment")
    .then(function (dbArticle) {
      // If we were able to successfully find an Article with the given id, send it back to the client
      res.json(dbArticle);
    })
    .catch(function (err) {
      // If an error occurred, send it to the client
      res.json(err);
    });
});

// Route for saving/updating an Article's associated comment
app.post("/articles/:id", function (req, res) {
  // Create a new note and pass the req.body to the entry
  db.Comment.create(req.body)
    .then(function (dbComment) {
      // If a Comment was created successfully, find one Article with an `_id` equal to `req.params.id`. Update the Article to be associated with the new Note
      // { new: true } tells the query that we want it to return the updated User -- it returns the original by default
      // Since our mongoose query returns a promise, we can chain another `.then` which receives the result of the query
      return db.Article.findOneAndUpdate({ _id: req.params.id }, { $push: { comment: dbComment._id } }, { new: true });
    })
    .then(function (dbArticle) {
      // If we were able to successfully update an Article, send it back to the client
      res.json(dbArticle);
    })
    .catch(function (err) {
      // If an error occurred, send it to the client
      res.json(err);
    });
});

// Delete a comment
app.delete("/comment/delete/:comment_id/:article_id", function (req, res) {
  // Use the comment id to find and delete it
  db.Comment.findOneAndRemove({ "_id": req.params.comment_id }, function (err) {
    // Log any errors
    if (err) {
      console.log(err);
      res.send(err);
    }
    else {
      db.Article.findOneAndUpdate({ "_id": req.params.article_id }, { $pull: { "Comment": req.params.comment_id } })
        // Execute the above query
        .exec(function (err) {
          // Log any errors
          if (err) {
            console.log(err);
            res.send(err);
          }
          else {
            // Or send the note to the browser
            res.send("Comment Deleted");
          }
        });
    }
  });
});

// Start the server
app.listen(PORT, function () {
  console.log("App running on port: " + PORT + "!");
});
