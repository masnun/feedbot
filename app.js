var express = require("express");
var app = express();
var config = require("./app/config");
var helper = require("./app/helpers");

app.use("/static", express.static("./app/static"));
app.set("views", "./app/views");

app.get("/", function (req, res) {
    res.render("home.jade", {title: "Feedbot"});
});

app.get("/api", function (req, res) {
    helper.getLatestArticles().then(function (docs) {
        var articles = [];
        docs.forEach(function (doc) {
            articles.push({
                title: doc.title,
                link: doc.link,
                //content: doc.content,
                id: doc._id

            });
        });
        res.send(JSON.stringify(articles));
    });
});

app.listen(3000);