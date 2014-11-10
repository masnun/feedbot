var Q = require("q");
var feedReader = require("feed-read");
var config = require("./config");
var mongoClient = require("mongodb").MongoClient;

function getFeedPromise(url) {
    var deferred = Q.defer();
    feedReader(url, function (err, articles) {
        if (err) {
            deferred.reject(new Error(err));
        } else {
            deferred.resolve(articles)
        }
    });

    return deferred.promise;
}

function processArticle(article, mongoCollection) {
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

}


exports.getArticlesPromises = function (articles, db) {
    var articlePromises = [];
    articles.forEach(function (article) {
        articlePromises.push(processArticle(article, db));
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

exports.getFeedPromises = function (feedCollection) {
    var feedPromises = [];
    feedCollection.forEach(function (url) {
        feedPromises.push(getFeedPromise(url));
    });

    return feedPromises;
};

exports.collectArticles = function (data) {
    var articles = [];
    data.forEach(function (ac) {
        ac.forEach(function (article) {
            articles.push(article);
        });
    });

    return articles
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

