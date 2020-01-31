// Grab the articles as a json
$.getJSON("/articles", function (data) {
    // For each one
    for (var i = 0; i < data.length; i++) {
        // Display the apropos information on the page
        $("#articles").append("<div class='col s12'><div class='card' style='overflow: auto;'>" +
            "<div class='card-content'>" +
            "<h5 data-id='" + data[i]._id + "'>" + data[i].title + "</h3></div>" +
            "<div class='card-action'><a class='green-text text-darken-3' href='" + data[i].link + "'>Visit</a><a class='comment green-text text-darken-3' data-id='" + data[i]._id + "'>Comment</a>" +
            `<div class='col s12 commentBox' id='${data[i]._id}'>` +
            "</div></div></div></div>");

    }
});

$.getJSON("/title", function (data) {
    let ticker = data[0].title;

    $('#bigTitle').html(`${ticker} News`)
});

$("#scrape").on("click", function () {
    $.ajax({
        method: "GET",
        url: "/scrape",
    }).done(function (data) {
        console.log(data)
        window.location = "/"
    })
});


// Whenever someone clicks a comment
$(document).on("click", ".comment", function () {
    // Empty the comment from the note section
    // console.log(this);
    $('.commentBox').empty();
    // Save the id from the comment
    var articleId = $(this).attr("data-id");
    // Now make an ajax call for the Article
    $.ajax({
        method: "GET",
        url: "/articles/" + articleId
    })
        // With that done, add the note information to the page
        .then(function (data) {
            console.log(data);
            // An input to enter a new title
            $(`#${articleId}`).prepend("<input id='titleinput' placeholder='Title' name='title' >");
            // A textarea to add a new comment body
            $(`#${articleId}`).append("<textarea id='bodyinput' placeholder='Comment' name='body'></textarea>");
            // A button to submit a new comment, with the id of the article saved to it
            $(`#${articleId}`).append("<button class='waves-effect waves-light btn green lighten-1' data-id='" + articleId + "' id='savecomment'>Save comment</button>");
            $(`#${articleId}`).prepend($("<div id='commentSection'>"))
            // If there's a comment in the article
            if (data.comment) {
                for (let item of data.comment) {
                    console.log(item);
                    console.log(item.body)
                    let commentAll = $("<div class='card white'>");
                    let commentCard = $("<div class='card-content black-text'>")
                    commentCard.html(`<a data-article-id='${articleId}' data-comment-id='${item._id}' class='right btn-floating btn-large waves-effect waves-light red deleteComment'><i class='material-icons'>clear</i></a><span class='card-title'>${item.title}</span><p>${item.body}<p>`);
                    commentAll.append(commentCard);
                    $("#commentSection").append(commentAll);
                }
            }
        });
});

// When you click the savecomment button
$(document).on("click", "#savecomment", function () {
    // Grab the id associated with the article from the submit button
    var articleId = $(this).attr("data-id");

    // Run a POST request to change the comment, using what's entered in the inputs
    $.ajax({
        method: "POST",
        url: "/articles/" + articleId,
        data: {
            // Value taken from title input
            title: $("#titleinput").val(),
            // Value taken from comment textarea
            body: $("#bodyinput").val()
        }
    })
        // With that done
        .then(function (data) {
            // Log the response
            console.log(data);
            $("#commentSection").empty();

            $.ajax({
                method: "GET",
                url: "/articles/" + articleId
            }).then(function (commentData) {
                if (commentData.comment) {
                    for (let item of commentData.comment) {
                        console.log(item.title);
                        console.log(item.body)
                        let commentAll = $("<div class='card white'>");
                        let commentCard = $("<div class='card-content black-text'>")
                        commentCard.html(`<a data-article-id='${articleId}' data-comment-id='${item._id}' class='right btn-floating btn-large waves-effect waves-light red deleteComment'><i class='material-icons'>clear</i></a><span class='card-title'>${item.title}</span><p>${item.body}<p>`);
                        commentAll.append(commentCard);
                        $("#commentSection").append(commentAll);
                    }
                }
            })
        });

    // Also, remove the values entered in the input and textarea for comment entry
    $("#titleinput").val("");
    $("#bodyinput").val("");
});

$(document).on("click", ".deleteComment", function () {
    console.log("made it!")
    var commentId = $(this).attr("data-comment-id");
    var articleId = $(this).attr("data-article-id");
    $.ajax({
        method: "DELETE",
        url: "/comment/delete/" + commentId + "/" + articleId
    }).done(function (data) {
        console.log(data)
        $("#commentSection").empty();

        $.ajax({
            method: "GET",
            url: "/articles/" + articleId
        }).then(function (commentData) {
            if (commentData.comment) {
                for (let item of commentData.comment) {
                    console.log(item.title);
                    console.log(item.body)
                    let commentAll = $("<div class='card white'>");
                    let commentCard = $("<div class='card-content black-text'>")
                    commentCard.html(`<a data-article-id='${articleId}' data-comment-id='${item._id}' class='right btn-floating btn-large waves-effect waves-light red deleteComment'><i class='material-icons'>clear</i></a><span class='card-title'>${item.title}</span><p>${item.body}<p>`);
                    commentAll.append(commentCard);
                    $("#commentSection").append(commentAll);
                }
            }
        })
    })
});

$(document).on("click", "#searchButton", function () {
    let searchTerm = $('#tickerSearch').val().trim()
    $.ajax({
        method: "GET",
        url: "/scrape/" + searchTerm,
    }).done(function (data) {
        console.log(data)
        window.location = "/"
    })
});