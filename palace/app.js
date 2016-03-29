(function() {
    //start of function
  var app = angular.module('palace-game', ['ngAnimate']);

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
				deck.push({
					id:id,
					suit:suit,
					value:i,
					hidden:false,
					beingPlayed:false
				});
				id++;
			}
		});
		return storage.shuffle(deck);//shuffle before return for convenience
	};

	storage.deck = storage.makeDeck();

  return storage;
});//end of service


app.controller('MainCtrl', ['$scope', '$q', '$timeout', 'DATASTORE', function($scope, $q, $timeout, DATASTORE){
    $scope.deck = DATASTORE.deck; // load service
	//ng-style - controls image on JQK
	$scope.getFace = function(suit,value){
		switch(suit){
			case "spades":
			case "clubs": 
				switch(value){
					case 11: return { "background-image" : "url(img/jack.png)" };
					case 12: return { "background-image" : "url(img/queen.png)" };
					case 13: return { "background-image" : "url(img/king.png)" };
				}
			case "hearts":
			case "diamonds":
				switch(value){
					case 11: return { "background-image" : "url(img/jack2.png)" };
					case 12: return { "background-image" : "url(img/queen2.png)" };
					case 13: return { "background-image" : "url(img/king2.png)" };
				}
		}
	};
	// controls number of stuff in the card center
	$scope.isFace = function(value){
		return value > 10;
	};
	//ng-style - controls icon
	$scope.getSuit = function(suit){
		switch(suit){
			case "spades": return { "background-image" : "url(img/Emblem-spade.svg)" };
			case "hearts": return { "background-image" : "url(img/Emblem-heart.svg)" };
			case "clubs": return { "background-image" : "url(img/Emblem-club.svg)" };
			case "diamonds": return { "background-image" : "url(img/Emblem-diamond.svg)" };
		}
	};
	//ng-style - controls colors for numbers
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
	//ng-style - show title
	$scope.showMenu = function(){
		if(!$scope.playingGame)
			return { "opacity" : 1 , "z-index": 9};
		else
			return { "opacity" : 0 , "z-index": -9};
	};
	//ng-style - show deck during play, also controls show whose turn
	$scope.showDeck = function(){
		if($scope.playingGame)
			return { "opacity" : 1 , "z-index": 9};
		else
			return { "opacity" : 0 , "z-index": -9};
	};
	//ng-style - show player area animations
	$scope.showPlayer = function(player){
		if(player.ready)
			return { "opacity" : 1 , "z-index": 9};
		else
			return { "opacity" : 0 , "z-index": -9};
	};
	//ng-style - show current player hand
	$scope.showHand = function(){
		if($scope.handOn)
			return { "opacity" : 1 };
		else
			return { "opacity" : 0 };
	};
	//controls flipped cards in secret palace
	$scope.isHidden = function(card){
		return card.hidden;
	};
	//ng-style - glows selected cards that in cardsToPlay. Also translate cards when they are 'beingPlayed'
	$scope.cardAnims = function(card){
		var selectedCards = $scope.cardsToPlay.cards.map(function(card){
			return card.id;
		});
		if(selectedCards.indexOf(card.id)!==-1){
			if(card.beingPlayed){
				//selected and being played
				return{ "box-shadow" : "0px 0px 25px rgba(155,255,255,0.8)", "transform":"translateY(-50px)" };
			}
			//selected only
			return { "box-shadow" : "0px 0px 25px rgba(155,255,255,0.8)" };
		}
	};
	/* ---------- */
	/* GAME STATE */
	/* ---------- */
	//controls if "PALACE (Play)" is shown or deck
	$scope.playingGame = false;

	//whose turn, what the game is doing
	$scope.gameIsAt = "Setting up Game...";

	//game is waiting for player input?
	$scope.waitingForInput = true;

	//whose turn is it?
	$scope.nextPlayer = 0;

	//for getting current player's hand
	$scope.currentHand = [];

	//show hand footer
	$scope.handOn = false;

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
	/**/
	/* --------- */
	/* GAME PLAY */
	/* --------- */
	$scope.startGame = function(){
		//prevent double-tap => only start game once
		if(!$scope.playingGame){
			//disallow clicks and begin setup
			$scope.waitingForInput = false;
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

		//rebuild deck, reset palaces, hands, pile, outOfPlay cards
		$scope.deck = DATASTORE.makeDeck();
		$scope.resetState();
	
		var rdyPlayers = {};
			players.forEach(function(player){
				rdyPlayers[player] = $q.defer();
			});
		var all = $q.all([rdyPlayers.player1.promise, rdyPlayers.player2.promise, rdyPlayers.player3.promise, rdyPlayers.player4.promise]);
		function allSuccess(){
			console.log("all players loaded");
			$scope.runNextTurn();
		};
	    all.then(allSuccess);
		//for each player...
		players.forEach(function(player){
			var deckAnimateTime = 500*(players.indexOf(player));
			var playerAppearTime = 500*(players.indexOf(player)+1);
			$timeout(function(){
				//animate the deck toward the respective player
				
				
			},deckAnimateTime);
			$timeout(function(){
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
				//animate in. resolve promise
				$scope[player].ready = true;
				rdyPlayers[player].resolve(player+" is ready")
				
			},playerAppearTime);
		});
	};
	//runs turn of current player
	$scope.runNextTurn = function(){
		
		//disallow clicks
		$scope.waitingForInput = false;
		
			/*-----------------------*/
			//PHASE 1: get playable cards (restrict player too)
			/*-----------------------*/
			//get card to beat
			var cardToBeat = $scope.cardToBeat();
			//weakest ---> strongest
			//must also apply to human player
			$scope.playable = [3,4,5,6,9,11,12,13,1,7,8,2,10];
			if (cardToBeat !== null){
				$scope.playable = $scope.playable.slice($scope.playable.indexOf(cardToBeat));
			}

		//set player and hand, show hand
		var player = $scope[players[$scope.nextPlayer]];
		$scope.gameIsAt = player.name + "'s Turn";
		$scope.currentHand = player.hand;
		$scope.handOn = true;

		//initiate form for checking cards to be played
		//value prevents player from playing cards of different value
		//cards keeps track of whole cards. this will be pushed to pile when "played()"
		//e.g. cardsToPlay = {value:9,cards:[{}{}]}
		$scope.cardsToPlay = {value:null,cards:[]};
	
		//if human is false, continue running code
		if(!player.human){

			var handIndex = 0;
			var handValues = [];
			$scope.currentHand.forEach(function(card){
				handValues.push(card.value);
			});

			function isMagicOrAce(n){
				return n === 1 || n === 2 || n === 7 || n === 8 || n === 10;
			};
			function isMagic(n){
				return n === 2 || n === 7 || n === 8 || n === 10;
			};
			function sortHand(a,b){
						// 1, 7, 8, 2, 10 in front
						if(isMagicOrAce(a)){
							//magics infront of 1
							if(isMagic(b)){
								//move 2 over 7 and 8
								if(a===2){
									if(b===7||b===8){
										return 1;
									}
									else{
										return -1;
									}
								}
								else{
									return -1;
								}
							}
							else{
								return 1;
							}
						}
						else{
							if(isMagicOrAce(b)){
								return -1;
							}
							return a > b;
						}
			};
			
			//SEMI ADVANCED: Play 2 or 8 as last card in hand and follow up with an upper-palace card
			//ADVANCED : use a forfeit function to take in pile if pile has great value (lots of magics or ace);

			//if hand has one card or all same cards
			if(handValues.length===1||handValues.allValuesSame()){
				//if playable, play them all
				if($scope.playable.indexOf(handValues[0])!==-1){
					$scope.cardsToPlay.value = handValues[0];
					$scope.selectCards();
					$timeout(function(){
						$scope.playCards(player);
					},500);
				}
				else{
					//else, gotta forfeit
					throw "Don't have forfeit function yet."
				}
			}
			//hand has different cards, more than one card
			else{

				//sort handValues from weakest to greatest
				handValues = handValues.sort(sortHand);
				console.log(player.name+", hand: "+handValues);
				console.log("playable: "+$scope.playable);
				//cycle handValues from left to right, find weakest playable value. and set to cardstoplay.value
				$scope.cardsToPlay.value = handValues.reduce(function(curr,next){
					if(handValues.indexOf(curr) > handValues.indexOf(next) && $scope.playable.indexOf(next)!==-1){
						curr = next;
					}
					return curr;
				},handValues[handValues.length-1]);

				//cycle hand
				// if cardstoplay.value is 1,2,7,8,10, just find one card to play
				// else find all cards that have cardstoplay.value and push them to cardstoplay.cards
				if(isMagicOrAce($scope.cardsToPlay.value)){
					$scope.cardsToPlay.cards.push($scope.currentHand.reduce(function(curr,next){
						if(curr.value !== next.value && next.value === $scope.cardsToPlay.value){
							curr = next;
						}
							return curr;
					},{}));
				}
				else{
					$scope.selectCards();
				}
				$timeout(function(){
					$scope.playCards(player);
				},500);
			}
		}
		//else, set next player
		else{
			$scope.nextPlayer = $scope.nextPlayer + 1 >= players.length ? 1 : $scope.nextPlayer + 1;
			//allow clicks
			$scope.waitingForInput = true;
		}
	};
	
	//FOR AI: get the Number value i'd need to beat on the pile
	$scope.cardToBeat = function(){
		if($scope.pile.length===0){
			return null;
		}
		return $scope.pile[$scope.pile.length-1].value;
	};
	
	//FOR AI: Pushes all cards on hand of $scope.cardsToPlay.value to $scope.cardsToPlay.cards
	$scope.selectCards = function(){
		$scope.currentHand.forEach(function(card){
				if(card.value===$scope.cardsToPlay.value){
					//highlight card, rdy it for play
					$scope.cardsToPlay.cards.push(card);
				}
		});
	};
	
	//FOR AI && PLAYER: play card(s) (make all selected cards float up and move to pile, remove from current hand)
	$scope.playCards = function(player){

		//if player.first is false, set it true now; they can't swap upper-palace cards now.
		if(!player.first){
			player.first = true;
		}
		
		//push cards to pile
		$scope.cardsToPlay.cards.forEach(function(card){
			console.log(player.name+" played " + card.value);
			$scope.pile.push(card);
		});
		
		//remove cards from player hand
		var ids = $scope.cardsToPlay.cards.map(function(card){
			return card.id;
		});
		//make the cards float on actual hand
		$scope.currentHand.forEach(function(card){
			card.beingPlayed = true;
		});
		player.hand = player.hand.filter(function(card){
			return ids.indexOf(card.id)===-1;
		});
		$scope.handOn = false;
		$timeout(function(){
			//reset current hand. give sometime for fadeout and translation animation (500), as well as pile addon animation (1000)
			$scope.currentHand = [];
			$timeout(function(){
				//when finished, set next player and runTurn.
				$scope.nextPlayer = $scope.nextPlayer + 1 >= players.length ? 0 : $scope.nextPlayer + 1;
				$scope.runNextTurn();
			},1000);
		},500)

	}
	
	
	
	
}]);//end of controller
	
Array.prototype.allValuesSame = function() {

    for(var i = 1; i < this.length; i++)
    {
        if(this[i] !== this[0])
            return false;
    }

    return true;
}
	
  //end of function
})();
