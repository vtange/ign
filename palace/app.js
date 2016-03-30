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
			return { "opacity" : 1 };
		else
			return { "opacity" : 0 };
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
		//if card is selected
		if($scope.getSelected().indexOf(card.id)!==-1){
			if(card.beingPlayed){
				//selected and being played -> glow and float up
				return{ "box-shadow" : "0px 0px 25px rgba(155,255,255,0.8)", "transform":"translateY(-50px)" };
			}
			//selected only -> glow
			return { "box-shadow" : "0px 0px 25px rgba(155,255,255,0.8)" };
		}
		//else if player is playing a 3 and this card is not a 3. (not selected yet duh)
		else if ($scope.cardsToPlay.value!==null){
			if(card.value !== $scope.cardsToPlay.value){
				return { "opacity": 0.75, "cursor": "default" };
			}
		}
	};
	//ng-style - moves deck mock card to simulate deck drawing
	$scope.drawAnims = function(){
		if($scope.player1.isDrawing){
			return { "animation" : "drawToPlayer1 0.75s" };
		}
		else if($scope.player2.isDrawing){
			return { "animation" : "drawToPlayer2 0.75s" };
		}
		else if($scope.player3.isDrawing){
			return { "animation" : "drawToPlayer3 0.75s" };
		}
		else if($scope.player4.isDrawing){
			return { "animation" : "drawToPlayer4 0.75s" };
		}
		else{
			return { "opacity" : 0 };
		}
	};
	//ng-style - a 10 is played and the pile blows up
	$scope.blowUpAnim = function(){
		if($scope.blowUp){
			return { "animation" : "pileBlowUp .5s;" };
		}
		else{
			return { };
		}
	};
	//controls swap button text
	$scope.swapPalaceBtn = "Change Upper Palace";
	
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
	
	//swap mode for player
	$scope.swapMode = false;
	
	//animate pile blowing up
	$scope.blowUp = false;
	
	//initiate form for checking cards to be played
	//value prevents player from playing cards of different value
	//cards keeps track of whole cards. this will be pushed to pile when "played()"
	//e.g. cardsToPlay = {value:9,cards:[{}{}]}
	$scope.cardsToPlay = {value:null,cards:[]};

	//used to loop over players
	var players = ['player1','player2','player3','player4'];

	//get current player
	$scope.getCurrentPlayer = function(){
		return $scope[players[$scope.nextPlayer]];
	};
	
	//get currently selected cards
	$scope.getSelected = function(){
		return $scope.cardsToPlay.cards.map(function(card){
			return card.id;
		});
	};
	
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

	//clean slate for game
	//human -> human player
	//ready -> controls show animation
	//first -> first turn? controls swapping upper deck with hand
	//isDrawing -> controls draw animation
	$scope.resetState = function(){
		$scope.player1 = {
			name: "Player 1",
			human: false,
			ready: false,
			first: false,
			isDrawing: false,
			forfeiting: false,
			sec_palace:[],
			upp_palace:[],
			hand:[],
		};
		$scope.player2 = {
			name: "Player 2",
			human: false,
			ready: false,
			first: false,
			isDrawing: false,
			forfeiting: false,
			sec_palace:[],
			upp_palace:[],
			hand:[],
		};
		$scope.player3 = {
			name: "Player 3",
			human: false,
			ready: false,
			first: false,
			isDrawing: false,
			forfeiting: false,
			sec_palace:[],
			upp_palace:[],
			hand:[],
		};
		$scope.player4 = {
			name: "Player 4",
			human: true,
			ready: false,
			first: false,
			isDrawing: false,
			forfeiting: false,
			sec_palace:[],
			upp_palace:[],
			hand:[],
		};
		$scope.pile = [];
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

		//rebuild deck, reset palaces, hands, pile cards
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
			var deckAnimateTime = 750*(players.indexOf(player));
			var playerAppearTime = 750*(players.indexOf(player)+1);
			$timeout(function(){
				//animate the deck toward the respective player and cancel animation in 500ms
				$scope[player].isDrawing = true;
				$timeout(function(){
					$scope[player].isDrawing = false;
				},750);
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

	//runs turn of current player, gets card to beat and calcs rules
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
			if (cardToBeat === 7){
				$scope.playable = [3,4,5,6,7,8,2,10];
			}
			else if	(cardToBeat === 8){
				$scope.playable = [9,11,12,13,1,7,8,2,10];
			}
			else if	(cardToBeat === 2||cardToBeat === 10){
				$scope.playable = [3,4,5,6,9,11,12,13,1,7,8,2,10];
			}
			else if (cardToBeat !== null){
				$scope.playable = $scope.playable.slice($scope.playable.indexOf(cardToBeat));
			}

		//set player and hand, show hand
		var player = $scope.getCurrentPlayer();
		$scope.gameIsAt = player.name + "'s Turn";
		$scope.currentHand = player.hand;
		$scope.handOn = true;

		//reset form
		$scope.cardsToPlay = {value:null,cards:[]};

		//WAIT FOR HAND to Fade in
		$timeout(function(){

			//if human is false, run AI turn sequence
			if(!player.human){
				$scope.AITurn(player,cardToBeat);
			}
			//else just allow clicks, set next player on card play
			else{
				$scope.waitingForInput = true;
			}
						
		},500);
	};

	//FOR AI: general AI Turn sequence
	$scope.AITurn = function(player,mustBeat){
		
				//swapMode promise
				var swapMode = $q.defer();
	
				//Upper Palace Swap Phase if player.first
				if(!player.first){
					$scope.enterSwapMode(player,swapMode);
				}
				else{
					//immediate resolve swapmode
					swapMode.resolve("finished swap mode");
				}
				
				//only continue if swapMode is resolved
				swapMode.promise.then(function(str){
					var handValues = [];
					$scope.currentHand.forEach(function(card){
						handValues.push(card.value);
					});

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
							$scope.forfeit(player);
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

						//FAILSAFE, prevent AI playing last card in hand even if not valid: if $scope.cardsToPlay.value isn't a playable value, forfeit.
						if($scope.playable.indexOf($scope.cardsToPlay.value)===-1){
							$scope.forfeit(player);
						}
						else{
							//cycle hand
							// if cardstoplay.value is 1,2,7,8,10, OR if card to beat is a 2 or 8 (your own) just find one card to play
							// else find all cards that have cardstoplay.value and push them to cardstoplay.cards
							if(isMagicOrAce($scope.cardsToPlay.value)||mustBeat===2||mustBeat===8){
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
				});
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
		//make the cards on actual hand if their id is in the cardsToPlay area
		$scope.currentHand.forEach(function(card){
			if(ids.indexOf(card.id)!==-1)
				card.beingPlayed = true;
		});
		player.hand = player.hand.filter(function(card){
			return ids.indexOf(card.id)===-1;
		});

		//fade out current hand
		$scope.handOn = false;
		
		//wait for card to appear on pile
		$timeout(function(){
			//reset current hand. give sometime for fadeout and translation animation (500), as well as pile addon animation (1000)
			$scope.currentHand = [];

			if($scope.pile[$scope.pile.length-1].value===2||$scope.pile[$scope.pile.length-1].value===8){
				$timeout(function(){
					//if top of pile is 2 or 8, another turn for current player (no draw, since it's not end of turn)
					$scope.runNextTurn();
				},1000);
			}
			else if($scope.pile[$scope.pile.length-1].value===10){
				//wait for card to be placed on pile
				$timeout(function(){
					//if top of pile is 10, blow up deck, draw phase, then next player turn
					$scope.pile = [];
					$scope.blowUp = true;
					$scope.drawCards(player);
					$timeout(function(){
						$scope.blowUp = false;
						$scope.nextPlayer = $scope.nextPlayer + 1 >= players.length ? 0 : $scope.nextPlayer + 1;
						$scope.runNextTurn();
					},1000);
				},1000);
			}
			else{
				$scope.drawCards(player);
				$timeout(function(){
					//if top of pile is not 2 or 8, draw phase, next player turn
					$scope.nextPlayer = $scope.nextPlayer + 1 >= players.length ? 0 : $scope.nextPlayer + 1;
					$scope.runNextTurn();
				},1000);
			}
			
		},500);

	};

	//FOR AI && PLAYER: draw cards phase. Only draw if deck.length > 0 and hand.length < 3
	$scope.drawCards = function(player){
		if(player.hand.length < 3  && $scope.deck.length > 0){
			//trigger anim once
			player.isDrawing = true;
			$timeout(function(){
				player.isDrawing = false;
			},750);
			while(player.hand.length < 3  && $scope.deck.length > 0){
				player.hand.push($scope.deck[0]);
				$scope.deck.splice(0,1);
			}
		}
	};
	
	//FOR AI && PLAYER: upper palace swap mode.
	$scope.enterSwapMode = function(player, promise){

		//if game is not in swapmode
		if(!$scope.swapMode){
			//prevent double tap and enter swapmode if human
			if(player.human){
				$scope.waitingForInput = false;
				$scope.swapMode = true;
				$scope.swapPalaceBtn = "Confirm Upper Palace";
			}

			//put Upper Palace cards on hand
			player.upp_palace.forEach(function(card){
				$scope.currentHand.push(card);
			});
			player.upp_palace = [];

			//wait for hand to update
			$timeout(function(){
				//if AI
				if(!player.human){
					//get handValues
					var values = [];
					$scope.currentHand.forEach(function(card){
						values.push(card.value);
					});

					//sort
					values = values.sort(sortHand);
					//for each in handValues top 3, find a card in currhand with that value and push it to upp palace.
					values.slice(3).forEach(function(value){

						//get card to be put into upp-palace
						var swappedCard = $scope.currentHand.reduce(function(curr,next){
							if(curr.value !== next.value && next.value === value){
								curr = next;
								swappedCard = next;
							}
							return curr;
						},$scope.currentHand[0]);

						//push the card into the palace
						player.upp_palace.push(swappedCard);

						//remove card from current hand
						$scope.currentHand = $scope.currentHand.filter(function(card_in_hand){
							return card_in_hand.id !== swappedCard.id;
						});

						// watch out. since $scope.currentHand = player.hand in $scope.runnextTurn you must update player.hand as well.
						player.hand = player.hand.filter(function(card_in_hand){
							return card_in_hand.id !== swappedCard.id;
						});
					});

					//wait for upp_palace to update and hand
					$timeout(function(){
						//resolve promise
						promise.resolve("finished swap mode");
					},1000);

				}
				else{
					//else if player, do nothing. reenable inputs
					$scope.waitingForInput = true;
				}
			},1000);
		}
		//if game is in swapmode
		else{
			if($scope.cardsToPlay.cards.length === 3){
				$scope.cardsToPlay.cards.forEach(function(swappedCard){
						// save the selected cards and end swapmode
						player.upp_palace.push(swappedCard);
						// remove selected cards from current hand
						$scope.currentHand = $scope.currentHand.filter(function(card_in_hand){
							return card_in_hand.id !== swappedCard.id;
						});
						// watch out. since $scope.currentHand = player.hand in $scope.runnextTurn you must update player.hand as well.
						player.hand = player.hand.filter(function(card_in_hand){
							return card_in_hand.id !== swappedCard.id;
						});
				});
				$scope.cardsToPlay.cards = [];
				$scope.swapMode = false;
				$scope.swapPalaceBtn = "Change Upper Palace";
			}
			else{
				$scope.swapPalaceBtn = "You need to select 3 cards";
				$timeout(function(){
					$scope.swapPalaceBtn = "Confirm Upper Palace";
				},1000);
			}
		}
	};

	//FOR AI && PLAYER: Forfeit function
	$scope.forfeit = function(player){

		//if player.first is false, set it true now; they can't swap upper-palace cards now.
		if(!player.first){
			player.first = true;
		}

		//pile move animation control, start next turn
		player.forfeiting = true;
		$timeout(function(){
			player.forfeiting = false;
				$timeout(function(){
					$scope.nextPlayer = $scope.nextPlayer + 1 >= players.length ? 0 : $scope.nextPlayer + 1;
					$scope.runNextTurn();
				},250);
		},750);

		//for each in pile, push to hand and remove from pile
		$scope.pile.forEach(function(card){
			player.hand.push(card);
		});

		$scope.pile = [];
	};

	//FOR PLAYER: select or deselect a card. depends on swapmode or if card is selected
	$scope.selectCard = function(target_card){
		//if target_card is not selected (select)
		if($scope.getSelected().indexOf(target_card.id)===-1){
			//if in swapmode, just add a card to newUpperPalace
			if($scope.swapMode && $scope.cardsToPlay.cards.length < 3){
				$scope.cardsToPlay.cards.push(target_card);
			}
			//else if not in swap mode, add value to limit future clicks
			else{
				if($scope.cardsToPlay.value === target_card.value || $scope.cardsToPlay.value === null){
					//set cardsToPlay.value to selected card
						//limit playables to value
					$scope.cardsToPlay.cards.push(target_card);
					$scope.cardsToPlay.value = target_card.value;
				}
			}
		}
		//else (card is selected, deselect it)
		else{
			$scope.cardsToPlay.cards = $scope.cardsToPlay.cards.filter(function(card){
				return card.id !== target_card.id;
			});
			//remove value if no more cards
			if($scope.cardsToPlay.cards.length<1){
				$scope.cardsToPlay.value = null;
			}
		}
	};

	//FOR PLAYER: disables play button when no selected cards, or in swap mode
	$scope.cantPlay = function(){
		if($scope.swapMode){
			return true;
		}
		else if($scope.cardsToPlay.cards.length<1){
			return true;
		}
		else{
			return false;
		}
	};
	
	
	
	
	
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
