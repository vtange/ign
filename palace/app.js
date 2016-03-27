(function() {
    //start of function
  var app = angular.module('palace-game', []);

app.factory('DATASTORE', function(){

	var storage = {};
	
	//shuffle deck
	storage.shuffle = function(array) {
		/**
		 * Randomize array element order in-place.
		 * Using Durstenfeld shuffle algorithm.
		 */
		for (var i = array.length - 1; i > 0; i--) {
			var j = Math.floor(Math.random() * (i + 1));
			var temp = array[i];
			array[i] = array[j];
			array[j] = temp;
		}
		return array;
	};
  //generate Deck
	storage.makeDeck = function(){
		var deck = [];
		var id = 1;
		let suits = ["spades","hearts","clubs","diamonds"];

		suits.forEach(function(suit){
			for(let i=1;i<14;i++){
				deck.push({id:id,suit:suit,value:i,hidden:false});
				id++;
			}
		});
		return storage.shuffle(deck);//shuffle before return for convenience
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
	//show deck during play, also controls show whose turn
	$scope.showDeck = function(){
		if($scope.playingGame)
			return { "opacity" : 1 , "z-index": 9};
		else
			return { "opacity" : 0 , "z-index": -9};
	};
	//show player area animations
	$scope.showPlayer = function(player){
		if(player.ready)
			return { "opacity" : 1 , "z-index": 9};
		else
			return { "opacity" : 0 , "z-index": -9};
	};
	//controls flipped cards in secret palace
	$scope.isHidden = function(card){
		return card.hidden;
	};
	/* GAME STATE */
	
	//used to loop over players
	var players = ['player1','player2','player3','player4'];
	//clean slate for game
	//human -> human player
	//ready -> controls animation
	//first -> first turn? controls swapping upper deck with hand
	$scope.resetState = function(){
		$scope.player1 = {
			name: "Player 1",
			human: false,
			ready: false,
			first: false,
			sec_palace:[],
			upp_palace:[],
			hand:[],
		};
		$scope.player2 = {
			name: "Player 2",
			human: false,
			ready: false,
			first: false,
			sec_palace:[],
			upp_palace:[],
			hand:[],
		};
		$scope.player3 = {
			name: "Player 3",
			human: false,
			ready: false,
			first: false,
			sec_palace:[],
			upp_palace:[],
			hand:[],
		};
		$scope.player4 = {
			name: "Player 4",
			human: true,
			ready: false,
			first: false,
			sec_palace:[],
			upp_palace:[],
			hand:[],
		};
		$scope.pile = [];
		$scope.outOfPlay = [];
	};
	$scope.resetState();
	
	//controls if "PALACE (Play)" is shown or deck
	$scope.playingGame = false;

	//whose turn is it?
	$scope.nextPlayer = 'player1';
	
	//whose turn, what the game is doing
	$scope.gameIsAt = "Setting up Game..."

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
	
		//for each player...
		players.forEach(function(player){
			//3 cards each for...
			//their secret palace
			$scope.times(3,function(times){
				//set deck[cardID] to hidden mode
				$scope.deck[0].hidden = true;
				//push random card of deck.length
				$scope[player].sec_palace.push($scope.deck[0]);
				//remove card from deck
				$scope.deck.splice(0,1);
			});
			//their upper palace
			$scope.times(3,function(times){
				//push random card of deck.length
				$scope[player].upp_palace.push($scope.deck[0]);
				//remove card from deck
				$scope.deck.splice(0,1);
			});
			//their hand
			$scope.times(3,function(times){
				//push random card of deck.length
				$scope[player].hand.push($scope.deck[0]);
				//remove card from deck
				$scope.deck.splice(0,1);
			});
			//animate in.
			$scope[player].ready = true;
		});
		$scope.runNextTurn();
	}
	//runs turn of current player
	$scope.runNextTurn = function(){
		//update header
		$scope.gameIsAt = $scope[$scope.nextPlayer].name + "'s Turn";
		//if human is false, continue running code
		if(!$scope[$scope.nextPlayer].human){
			console.log("ran turn for" + $scope.nextPlayer);
			//when finished, set next player and runTurn.
			$scope.nextPlayer = players[players.indexOf($scope.nextPlayer)+1]===undefined ? players[0] : players[players.indexOf($scope.nextPlayer)+1];
			$scope.runNextTurn();
		}
		//else, set next player
		else{
			$scope.nextPlayer = players[players.indexOf($scope.nextPlayer)+1]===undefined ? players[0] : players[players.indexOf($scope.nextPlayer)+1];
		}
	}
		//weakest to strongest = [3,4,5,6,9,11,12,13,1];
		//magic: weakest to strongest = [7,8,2,10];
	
	//play a card
		//ng click-> card moves ups and fades, shows up as top card on pile.
	
	
}]);//end of controller
	

	
  //end of function
})();
