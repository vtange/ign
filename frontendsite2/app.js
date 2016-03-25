(function() {
    //start of function
  var app = angular.module('art-vid-list', ['angularMoment','filters']);

app.factory('DATASTORE', function($http){

  //API urls
  var baseUrl = "http://ign-apis.herokuapp.com";
  var ext = ["/articles", "/videos"];

  // arrays of articles and videos
  var storage = {};
  storage.articlesANDvideos = [];

  //immediately HTTP get data and push to articles/videos respectively
  //GET /articles and /videos
	ext.forEach(function(extension){
	  $http.jsonp(baseUrl + extension + "?callback=JSON_CALLBACK").success(function(data) {//pull profile info
		  data.data.forEach(function(arr_item){
			  storage.articlesANDvideos.push(arr_item);
		  })
	  }).error(function(data) {
		  storage.articlesANDvideos = [];//error = no data anyways
		  console.log("error on http request");
	  });
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
	// determines metadata.headline or metadata.name for ng-repeat, determines handling of vid;
	$scope.isArticle = function(list_element){
		return list_element.metadata.articleType;
	};


}]);//end of controller
  //end of function
})();
