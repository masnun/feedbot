var express = require("express");
var app = express();
var config = require("./app/config");
var helper = require("./app/helpers");

app.get("/", function (req, res) {
    res.send("Hello !");
});

app.get("/api", function (req, res) {
    helper.getLatestArticles().then(function (docs) {
        var articles = [];
        docs.forEach(function (doc) {
            articles.push({
                title: doc.title,
                link: doc.link,
                id: doc._id

            });
        });
        res.send(JSON.stringify(articles));
    });
});

app.listen(3000);