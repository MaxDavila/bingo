var socketClient = require('socket.io-client');

var client = socketClient.connect('ws://yahoobingo.herokuapp.com');

var registerData = {
  name: 'Bruno Sanches',
  email: 'brunopsanches@gmail.com',
  url: 'https://github.com/brunops/bingo'
};

var bingo;

client.on('connect', function() {
  console.log('connected!');
  client.emit('register', registerData);
});

client.on('card', function(payload) {
  console.log('card received!', payload);
  bingo = new Bingo(payload);
});

client.on('number', function(number) {
  console.log('number received', number);
  bingo.markRaffledNumber(number);
  console.log(bingo.card.slots);
  if (bingo.isWinner()) {
    client.emit('bingo');
  }
});

client.on('win', function() {
  console.log('WIN!');
});

client.on('lose', function() {
  console.log('LOSE!');
});

client.on('disconnect', function() {
  console.log('disconnected..');
});

// Bingo object
var _ = require('underscore');

function Bingo(card) {
  this.init(card);
}

Bingo.prototype.init = function(card) {
  this.setCard(card);
  this.TOTAL_COLUMNS = 5;
};

Bingo.prototype.setCard = function(card) {
  this.card = card;
};

Bingo.prototype.markRaffledNumber = function(raffleNumber) {
  var parsedNumber = this.parse(raffleNumber);
  this.card.slots[parsedNumber.rowName] = _.map(this.card.slots[parsedNumber.rowName], function(value) {
    return value === parsedNumber.number ? 0 : value;
  })
};

Bingo.prototype.parse = function(raffleNumber) {
  return {
    rowName: raffleNumber.charAt(0),
    number: parseInt(raffleNumber.match(/[0-9]+$/)[0], 10)
  }
};

Bingo.prototype.isWinner = function() {
  return this.hasFullRow() || this.hasFullColumn() || this.hasFullDiagonal();
};

Bingo.prototype.hasFullRow = function() {
  var foundFullRow = false;
  _.each(this.card.slots, function(row) {
    foundFullRow |= !_.some(row, _.identity);
  });

  return !!foundFullRow;
};

Bingo.prototype.getRow = function(index) {
  var row, i = 0;
  _.each(this.card.slots, function(currentRow) {
    if (i++ === index) {
      row = currentRow;
      return;
    }
  });

  return row;
};

Bingo.prototype.getColumn = function(index) {
  var column = [];
  _.each(this.card.slots, function(row) {
    column.push(row[index]);
  });

  return column;
};

Bingo.prototype.hasFullColumn = function() {
  var foundFullColumn = false;
  for (var i = 0; i < this.TOTAL_COLUMNS; ++i) {
    foundFullColumn |= !_.some(this.getColumn(i), _.identity);
  }

  return !!foundFullColumn;
};

Bingo.prototype.hasFullDiagonal = function() {
  var mainDiagonal = secondaryDiagonal = false;
  var row;
  for (var i = 0; i < this.TOTAL_COLUMNS; ++i) {
    row = this.getRow(i);
    mainDiagonal |= row[i];
    secondaryDiagonal |= row[this.TOTAL_COLUMNS - i - 1];
  }

  // diagonal is full if result is 0
  return !mainDiagonal || !secondaryDiagonal;
};
