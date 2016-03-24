//Find Jackpot word: given a .txt file of words, find the word with the largest point value in the game Scrabble.
//Words source: http://www.ign.com/code-foo/2016/words.txt
//NodeJS get file from URL version: run by entering 'node findJackpotHTTP' in Git Bash. MUST `npm install request` to use.
//ES-2015 version

	var request = require('request');
	var url = 'http://www.ign.com/code-foo/2016/words.txt';
    var FileContents;
	var BestWord;
	function scrabbleScore(word){
		return word.split("").reduce(function(tot,nextLetter){
			//tot starts at 0 for each word, of course
			var nextLetterWorth = function(letter){
				switch (letter.toLowerCase()){
					case "a": return 1;
					case "b": return 3;
					case "c": return 3;
					case "d": return 2;
					case "e": return 1;
					case "f": return 4;
					case "g": return 2;
					case "h": return 4;
					case "i": return 1;
					case "j": return 8;
					case "k": return 5;
					case "l": return 1;
					case "m": return 3;
					case "n": return 1;
					case "o": return 1;
					case "p": return 3;
					case "q": return 10;
					case "r": return 1;
					case "s": return 1;
					case "t": return 1;
					case "u": return 1;
					case "v": return 4;
					case "w": return 4;
					case "x": return 8;
					case "y": return 4;
					case "z": return 10;
				};
			};
			return tot+nextLetterWorth(nextLetter);
		},0);
	};
	var getLink = function(url){
		request.get(url,function(error, response, body){
			if(!error && response.statusCode == 200){
				FileContents = body.toString().split("\n");
				FileContents.reduce(function(HighestSoFar,word){
					//HighestSoFar starts and -Infinity so it gets higher with every better word
					if (scrabbleScore(word) > HighestSoFar){
						HighestSoFar = scrabbleScore(word);
						BestWord = word;
					}
					return HighestSoFar;
				},-Infinity);
				console.log("Top Word is: " + BestWord);
			}
		});
	};
    getLink(url);