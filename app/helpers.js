var Q = require("q");
var feedReader = require("feed-read");
var config = require("./config");
var mongoClient = require("mongodb").MongoClient;

exports.processArticles = function (articles, db) {
    var articlePromises = [];
    articles.forEach(function (article) {
        articlePromises.push(function (article, mongoCollection) {
            var deferred = Q.defer();
            mongoCollection.findOne({link: article.link}, function (err, item) {
                if (err) {
                    deferred.reject(new Error(err));
                } else {
                    if (item == null) {
                        mongoCollection.insert({
                            title: article.title,
                            link: article.link,
                            author: article.author,
                            //content: article.content,
                            published: article.published

                        }, function (err, resp) {
                            if (err) {
                                deferred.reject(new Error(err));
                            } else {
                                deferred.resolve("Stored: " + article.title)
                            }
                        });
                    } else {
                        deferred.resolve("Article exists: " + article.title);
                    }
                }


            });

            return deferred.promise;

        }(article, db));
    });

    return articlePromises;
};

exports.getMongoCollectionPromise = function (config) {
    var deferred = Q.defer();
    mongoClient.connect(config, function (err, db) {
        if (err) {
            deferred.reject(new Error(err));
        } else {
            deferred.resolve(db.collection("articles"));
        }
    });

    return deferred.promise;
};

exports.getArticlesFromFeed = function (feeds) {
    var feedPromises = [];
    feeds.forEach(function (url) {
        feedPromises.push(function (url) {
            var deferred = Q.defer();
            feedReader(url, function (err, articles) {
                if (err) {
                    deferred.reject(new Error(err));
                } else {
                    deferred.resolve(articles)
                }
            });

            return deferred.promise;
        }(url));
    });

    return feedPromises;
};

exports.getLatestArticles = function () {
    var deferred = Q.defer();

    mongoClient.connect(config['mongo'], function (err, db) {
        if (err) {
            deferred.reject(new Error(err));
        } else {
            db.collection("articles").find({}, {
                sort: [['_id', 'desc']],
                limit: 20
            }).toArray(function (err, docs) {
                if (err) {
                    deferred.reject(new Error(err));
                } else {
                    db.close();
                    deferred.resolve(docs)
                }
            });
        }
    });
    return deferred.promise;
};
