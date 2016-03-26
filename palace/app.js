(function() {
    //start of function
  var app = angular.module('palace-game', []);

app.factory('DATASTORE', function(){

	var storage = {};
  //generate Deck
	function makeDeck(){
		var deck = [];
		var id = 1;
		let suits = ["spades","hearts","clubs","diamonds"];

		suits.forEach(function(suit){
			for(let i=1;i<14;i++){
				deck.push({id:id,suit:suit,value:i});	
				id++;
			}
		});
		return deck;
	}
	storage.deck = makeDeck();

  return storage;
});//end of service


app.controller('MainCtrl', ['$scope', 'DATASTORE', function($scope, DATASTORE){
    $scope.storage = DATASTORE; // load service
	$scope.getSuit = function(suit){
		switch(suit){
			case "spades": return { "background-image" : "url(img/Emblem-spade.svg)" };
			case "hearts": return { "background-image" : "url(img/Emblem-heart.svg)" };
			case "clubs": return { "background-image" : "url(img/Emblem-club.svg)" };
			case "diamonds": return { "background-image" : "url(img/Emblem-diamond.svg)" };
		}
	}
	$scope.color = function(suit){
		switch(suit){
			case "spades": return { "color" : "#222" };
			case "hearts": return { "color" : "#d00" };
			case "clubs": return { "color" : "#222" };
			case "diamonds": return { "color" : "#d00" };
		}
	}
	
	
	
}]);//end of controller
  //end of function
})();
