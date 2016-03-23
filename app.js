(function() {
    //start of function
  var app = angular.module('art-vid-widget', ['filters']);

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
    };
	// set background image
    $scope.listBkgrd = function(list_element){
		console.log(list_element);
		return { "background-image" : "url("+list_element.thumbnail+")" }
    };
	// set list numbers to double digits
	$scope.dbldgt = function(number){
		return number+1 < 10 ? "0"+(number+1) : number+1;
	};
	// set times for videos
	$scope.times = function (d) {
		d = Number(d);
		var h = Math.floor(d / 3600);
		var m = Math.floor(d % 3600 / 60);
		var s = Math.floor(d % 3600 % 60);
		return (
		  (h > 0 ? h + ":" + (m < 10 ? "0" : "") : "") + m + ":" + (s < 10 ? "0" : "") + s
		); 
  	};
	
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
