(function() {
    //start of function
  var app = angular.module('palace-game', []);

app.factory('DATASTORE', function(){

	var storage = {};
  //generate Deck
	storage.makeDeck = function(){
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
	};
	storage.deck = storage.makeDeck();

  return storage;
});//end of service


app.controller('MainCtrl', ['$scope', 'DATASTORE', function($scope, DATASTORE){
    $scope.deck = DATASTORE.deck; // load service
	//controls image on JQK
	$scope.getFace = function(suit,value){
		switch(suit){
			case "spades":
			case "clubs": 
				switch(value){
					case 11: return { "width": "150px", "background-size": "150px", "background-image" : "url(img/jack.png)" };
					case 12: return { "background-image" : "url(img/queen.png)" };
					case 13: return { "background-image" : "url(img/king.png)" };
				}
			case "hearts":
			case "diamonds":
				switch(value){
					case 11: return { "width": "150px", "background-size": "150px", "background-image" : "url(img/jack2.png)" };
					case 12: return { "background-image" : "url(img/queen2.png)" };
					case 13: return { "background-image" : "url(img/king2.png)" };
				}
		}
	};
	// controls number of stuff in the card center
	$scope.isFace = function(value){
		return value > 10;
	};
	// controls icon
	$scope.getSuit = function(suit){
		switch(suit){
			case "spades": return { "background-image" : "url(img/Emblem-spade.svg)" };
			case "hearts": return { "background-image" : "url(img/Emblem-heart.svg)" };
			case "clubs": return { "background-image" : "url(img/Emblem-club.svg)" };
			case "diamonds": return { "background-image" : "url(img/Emblem-diamond.svg)" };
		}
	};
	// controls colors for numbers
	$scope.color = function(suit){
		switch(suit){
			case "spades":
			case "clubs": return { "color" : "#222" };
			case "hearts":
			case "diamonds": return { "color" : "#d00" };
		}
	};
	// use JQK instead of numbers
	$scope.JQK = function(value){
		switch(value){
			case 11: return "J";
			case 12: return "Q";
			case 13: return "K";
			default: return value;
		}
	};
	// controls number of stuff in the card center
	$scope.getNum = function(value){
		if(value < 11)
		 	return new Array(value);
		else{
			return [];
		}
	};
	//show title
	$scope.showMenu = function(){
		if(!$scope.playingGame)
			return { "opacity" : 1 , "z-index": 9};
		else
			return { "opacity" : 0 , "z-index": -9};
	};
	//show deck during play
	$scope.showDeck = function(){
		if($scope.playingGame)
			return { "opacity" : 1 , "z-index": 9};
		else
			return { "opacity" : 0 , "z-index": -9};
	};
	
	/* GAME STATE */
	
	//used to loop over players
	var players = ['player1','player2','player3','player4'];
	//clean slate for game
	$scope.resetState = function(){		
		$scope.player1 = {
			human: false,
			sec_palace:[],
			upp_palace:[],
			hand:[],
		};
		$scope.player2 = {
			human: false,
			sec_palace:[],
			upp_palace:[],
			hand:[],
		};
		$scope.player3 = {
			human: false,
			sec_palace:[],
			upp_palace:[],
			hand:[],
		};
		$scope.player4 = {
			human: false,
			sec_palace:[],
			upp_palace:[],
			hand:[],
		};
		$scope.pile = [];
		$scope.outOfPlay = [];
	};

	//controls if "PALACE (Play)" is shown or deck
	$scope.playingGame = false;

	//whose turn is it?
	$scope.currentPlayer = 1;

	//game is waiting for player input?
	$scope.waitingForInput = true;
	/**/

	/* GAME PLAY */
	$scope.startGame = function(){
		//prevent double-tap => only start game once
		if(!$scope.playingGame){
			$scope.playingGame = true;
			$scope.setupGame();
		}
	};
	//used to repeat things x times
	$scope.times = function(n, iterator) {
	  var accum = Array(Math.max(0, n));
	  for (var i = 0; i < n; i++) accum[i] = iterator.call();
	  return accum;
	};
	//set up game. disallow clicks during set up.
	$scope.setupGame = function(){
		
		//disallow clicks
		$scope.waitingForInput = false;
		
		//rebuild deck, reset palaces, hands, pile, outOfPlay cards
		$scope.deck = DATASTORE.makeDeck();
		$scope.resetState();
	
		//allocate 3 cards for each player's sec_palace
		players.forEach(function(player){
			//repeat 3 times
			$scope.times(3,function(times){
				var cardID = Math.floor(Math.random()*$scope.deck.length);
				//push random card of deck.length
				$scope[player].sec_palace.push($scope.deck[cardID]);
				//remove card from deck
				$scope.deck.splice(cardID,1);
			});
			$scope.times(3,function(times){
				var cardID = Math.floor(Math.random()*$scope.deck.length);
				//push random card of deck.length
				$scope[player].upp_palace.push($scope.deck[cardID]);
				//remove card from deck
				$scope.deck.splice(cardID,1);
			});
		});
		
	}
}]);//end of controller
	

	
  //end of function
})();
