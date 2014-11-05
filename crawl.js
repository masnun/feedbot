var helper = require("./app/helpers");
var Q = require("q");
var config = require("./app/config");


var feedCollection = [
    "http://www.sitepoint.com/feed/",
    "http://www.planet-php.net/rss/"

];

var dbPromise = helper.getMongoCollectionPromise(config['mongo']);

dbPromise.then(function (db) {
    var feedPromises = helper.getFeedPromises(feedCollection);
    Q.all(feedPromises).then(function (data) {
        var articles = helper.collectArticles(data);
        var articlePromises = helper.getArticlesPromises(articles, db);
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



