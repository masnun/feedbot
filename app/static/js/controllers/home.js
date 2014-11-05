/**
 * Author: Abu Ashraf Masnun
 * URL: http://masnun.me
 */

app.controller("HomeController", function ($scope, $http) {
    $http.get("/api").then(function (response) {
        $scope.articles = response.data;
    })
});