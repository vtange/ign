(function() {
    //start of function
  var app = angular.module('art-vid-widget', []);

app.factory('DATASTORE', function($http){

  //API urls
  var baseUrl = "http://ign-apis.herokuapp.com";
  var artExt = "/articles";
  var vidExt = "/videos";

  // arrays of articles and videos
  var storage = {};
  storage.articles = [];
  storage.videos = [];

  //immediately HTTP get data and push to articles/videos respectively
  //GET /articles
  $http.jsonp(baseUrl + artExt + "?callback=JSON_CALLBACK").success(function(data) {//pull profile info
  	  storage.articles = data.data;
  }).error(function(data) {
      storage.articles = [];//error = no data anyways
      console.log("error on http request");
  });

  //GET /videos
  $http.jsonp(baseUrl + vidExt + "?callback=JSON_CALLBACK").success(function(data) {//pull profile info
	  storage.videos = data.data;
  }).error(function(data) {
      storage.videos = [];//error = no data anyways
      console.log("error on http request");
  });

  return storage;
});//end of service


app.controller('MainCtrl', ['$scope', 'DATASTORE', function($scope, DATASTORE){
    $scope.storage = DATASTORE; // load service
    $scope.print = function(){
        console.log($scope.storage.articles);
        console.log($scope.storage.videos);
    }

      //tabs btwn articles | videos
      $scope.Tab = 1;
      $scope.changeTab = function(tgtTab){
          $scope.Tab = tgtTab;
          console.log("now on tab" + tgtTab)
      };
      $scope.checkTab = function(tab){
          return $scope.Tab === tab;
      };


}]);//end of controller
  //end of function
})();
