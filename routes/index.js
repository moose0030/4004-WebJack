var express = require('express');
var router = express.Router();

var actionQueue=[];
var deck =[];

var players     = []; 
var dealerHands = []
var playerHands = [];	//array of Hands
var Hand = function Hand(){
	this.cards = [],
	this.hasAce = false,
	this.total = 0,
	this.playable = true;
}

router.get('/', function(req, res, next) {
	console.log("Session: " + req.session);
  res.render('index', { title: 'COMP 4004 Blackjack' });
});

router.post('/start', function(req, res) {
	setup();					// init deck, dealer's cards, and user's cards
	setupPlayer(playerHands,true);
	setupPlayer(dealerHands,true);			// draws two cards, if they are the same they are split, otherwise nothing
	checkDealer();
    res.render('game', { title: 'Welcome to the game',hands:playerHands, dealer:dealerHands});
});

router.post('/main',function(req,res){
  for(var n =0;n<playerHands.length;++n){
    for(var i =0; i<playerHands[n].cards.length;++i){
	  if(playerHands[n].cards[i].rank === 'Ace'){
	    if(req.body.hasOwnProperty('v' + n + 'v' + i)){
		  console.log("Found ace and its value");
		  playerHands[n].cards[i].value = Number(req.body["v"+n+"v"+i]);
	    }
	  }		
    }
  }
	
  res.render('game', { title: 'Back to the game!',hands:playerHands, dealer:dealerHands});
});
//hit or stay
router.post('/hit',function(req,res){	
	dealerTurn();
	for (var n = 0; n < playerHands.length; n++) {
		for (var i = 0; i < playerHands[n].cards.length; i++) {
			if(playerHands[n].cards[i].rank ==='Ace' && playerHands[n].cards[i].value !== 1 && playerHands[n].cards[i].value !== 10)
			{
				res.render('choose',{title:'Choose your ace to be either 1 or 10', hands:playerHands});
				return;
			}
		}
	}	
		// for each hand... hit 
		for (var i = 0; i < playerHands.length; n++) {		
			playerHands[i].cards.push(dealCard());
		
			if(playerHands[i].total > 21){
				for (var i = 0; i < playerHands.length; i++) {
					addCards(playerHands[i]);
				}
				res.render('end',{title:"Game Over", hands:playerHands,dealer:dealerHands});
				return;
			}
			res.render('game',{title:'hit',hands:playerHands});
			return;
		}
});


router.post('/stay',function(req,res){
		dealerTurn();
		console.log("Stay 1");
		for (var n = 0; n < playerHands.length; n++) {
			for (var i = 0; i < playerHands[n].cards.length; i++) {
				if(playerHands[n].cards[i].rank ==='Ace' && playerHands[n].cards[i].value !== 1 && playerHands[n].cards[i].value !== 10)
					{
						res.render('choose',{title:'Choose your ace to be either 1 or 10', hands:playerHands});
						return;
					}
			}
		}
		console.log("Stay 2");
		for (var i = 0; i < playerHands.length; i++) {
			addCards(playerHands[i]);
		}
		console.log("Stay 3");
		
		res.render('end',{title:'Game Over', hands:playerHands,dealer:dealerHands});	
		return;
});


router.post('/chosen',function(req,res){
	res.render('game',{title:'hit or stay',hands:playerHands});	
});


function dealerTurn(){
	for(var i =0;i<dealerHands.length;++i){
		var a = dealerHands[i].total;
		if(a < 17){
			dealerHands[i].cards.push(dealCard());
		}
		else if(a === 17){
			if(dealerHasAce(dealerHands[i])){
				dealerHands[i].cards.push(dealCard());
			}
			else{
			  //stay
			}
		
		}
		else{
		   //stay
		}
		addCards(dealerHands[i]);
	}
	checkDealer();
}

function canSplit(collection){
	return (collection[0].rank === collection[1].rank);
}


function setup(){
	deck = [
    { suit: 'clubs', rank: 'Ace', value: [ 1, 10 ], hidden:false },
    { suit: 'clubs', rank: '2', value: 2 , hidden:false },
    { suit: 'clubs', rank: '3', value: 3 , hidden:false },
    { suit: 'clubs', rank: '4', value: 4 , hidden:false },
    { suit: 'clubs', rank: '5', value: 5 , hidden:false },
    { suit: 'clubs', rank: '6', value: 6 , hidden:false },
    { suit: 'clubs', rank: '7', value: 7 , hidden:false },
    { suit: 'clubs', rank: '8', value: 8 , hidden:false },
    { suit: 'clubs', rank: '9', value: 9 , hidden:false },
    { suit: 'clubs', rank: '10', value: 10 , hidden:false },
    { suit: 'clubs', rank: 'Jack', value: 10 , hidden:false },
    { suit: 'clubs', rank: 'Queen', value: 10 , hidden:false },
    { suit: 'clubs', rank: 'King', value: 10 , hidden:false },

    { suit: 'diamonds', rank: 'Ace', value: [ 1, 10 ] , hidden:false },
    { suit: 'diamonds', rank: '2', value: 2 , hidden:false },
    { suit: 'diamonds', rank: '3', value: 3 , hidden:false },
    { suit: 'diamonds', rank: '4', value: 4 , hidden:false },
    { suit: 'diamonds', rank: '5', value: 5 , hidden:false },
    { suit: 'diamonds', rank: '6', value: 6 , hidden:false },
    { suit: 'diamonds', rank: '7', value: 7 , hidden:false },
    { suit: 'diamonds', rank: '8', value: 8 , hidden:false },
    { suit: 'diamonds', rank: '9', value: 9 , hidden:false },
    { suit: 'diamonds', rank: '10', value: 10 , hidden:false },
    { suit: 'diamonds', rank: 'Jack', value: 10 , hidden:false },
    { suit: 'diamonds', rank: 'Queen', value: 10 , hidden:false },
    { suit: 'diamonds', rank: 'King', value: 10 , hidden:false },

    { suit: 'hearts', rank: 'Ace', value: [ 1, 10 ] , hidden:false },
    { suit: 'hearts', rank: '2', value: 2 , hidden:false },
    { suit: 'hearts', rank: '3', value: 3 , hidden:false },
    { suit: 'hearts', rank: '4', value: 4 , hidden:false },
    { suit: 'hearts', rank: '5', value: 5 , hidden:false },
    { suit: 'hearts', rank: '6', value: 6 , hidden:false },
    { suit: 'hearts', rank: '7', value: 7 , hidden:false },
    { suit: 'hearts', rank: '8', value: 8 , hidden:false },
    { suit: 'hearts', rank: '9', value: 9 , hidden:false },
    { suit: 'hearts', rank: '10', value: 10 , hidden:false },
    { suit: 'hearts', rank: 'Jack', value: 10 , hidden:false },
    { suit: 'hearts', rank: 'Queen', value: 10 , hidden:false },
    { suit: 'hearts', rank: 'King', value: 10 , hidden:false },

    { suit: 'spades', rank: 'Ace', value: [ 1, 10 ] , hidden:false },
    { suit: 'spades', rank: '2', value: 2 , hidden:false },
    { suit: 'spades', rank: '3', value: 3 , hidden:false },
    { suit: 'spades', rank: '4', value: 4 , hidden:false },
    { suit: 'spades', rank: '5', value: 5 , hidden:false },
    { suit: 'spades', rank: '6', value: 6 , hidden:false },
    { suit: 'spades', rank: '7', value: 7 , hidden:false },
    { suit: 'spades', rank: '8', value: 8 , hidden:false },
    { suit: 'spades', rank: '9', value: 9 , hidden:false },
    { suit: 'spades', rank: '10', value: 10 , hidden:false },
    { suit: 'spades', rank: 'Jack', value: 10 , hidden:false },
    { suit: 'spades', rank: 'Queen', value: 10 , hidden:false },
    { suit: 'spades', rank: 'King', value: 10 , hidden:false }];
	
	playerHands = [];
	dealerHands = [];
}

function dealCard(){
	var rand = Math.floor(deck.length * Math.random());
	var card = deck[rand];
	deck.splice(rand,1);
	return card;
}

function dealSpecificCard(rank){
	for(var i=0;i<deck.length;++i){
		if(deck[i].rank === rank){
			console.log(deck[i]);
			var card = deck[i];
			deck.splice(i,1);
			return card;
		}
	}
}

function addCards(cs){
	cs.total =0;
	for(var i =0; i<cs.cards.length;i++){
		console.log("Card Value: " + cs.cards[i].value);
		cs.total+= cs.cards[i].value;
	}
}

function dealerHasAce(collection){
	for(var i=0; i<collection.length;i++){
		if(collection[i].rank === 'Ace'){
			return true;
		}
	}
	return false;
}

function setupPlayer(collection,bool){
	 var a;
	 var b;
	 
	if(bool){
		a = dealSpecificCard('Ace');
		b = dealSpecificCard('Ace');
	}
	else{
		a = dealCard();
		b = dealCard();
	}
	if(a.rank === b.rank){
		collection[0] = new Hand();
		collection[1] = new Hand();
		
		collection[0].cards.push(a);
		collection[1].cards.push(b);
		
		collection[0].cards.push(dealCard());
		collection[1].cards.push(dealCard());
		return;
	}
	else{	
		collection[0] = new Hand();
		collection[0].cards.push(a);
		collection[0].cards.push(b);
		console.log("SETUP PLAYER:");
		
		for(var i=0; i<collection.length;++i){
			for(var j = 0; j<collection[i].cards.length;++j){
				console.log(collection[i].cards[j]);	
			}
		}
	}
}

function checkDealer(){
	if(dealerHands[0].cards[0] !== null){
		dealerHands[0].cards[0].hidden = true;
	}
	for(var n = 0; n < dealerHands.length; ++n){
      for(var i = 0; i < dealerHands[n].cards.length; ++i){
	    if(dealerHands[n].cards[i].rank === 'Ace'){
			if(dealerHands.length <= 2){
				dealerHands[n].cards[i].value = 10;
				break;
			}
			else if(dealerHands.total < 12){
				dealerHands[n].cards[i].value = 10;
				break;
			}
			else{
				dealerHands[n].cards[i].value = 1;
				break;
			}
		}
	  }
	}
}

function playerLogin(player){
	players.push(player);
}

function playerLogout(player){
	for(var i = 0; i < players.length; ++i){
		if(players[i].name === player.name){
			players.splice(i,1);	
		}
	}
}

module.exports = router;