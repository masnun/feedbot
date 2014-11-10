var helper = require("./app/helpers");
var Q = require("q");
var config = require("./app/config");


var feedCollection = [
    "http://www.sitepoint.com/feed/",
    "http://www.planet-php.net/rss/"

];

var dbPromise = helper.getMongoCollectionPromise(config['mongo']);

dbPromise.then(function (db) {
    var feedPromises = helper.getArticlesFromFeed(feedCollection);
    Q.all(feedPromises).then(function (data) {

        var articles = [];
        data.forEach(function (feedContent) {
            feedContent.forEach(function (article) {
                articles.push(article);
            });
        });

        var articlePromises = helper.processArticles(articles, db);
        articlePromises.forEach(function (promise) {
            promise.then(function (resp) {
                console.log(resp);
            });
        });

        Q.all(articlePromises).then(function () {
            process.exit();
        });

    });
});



