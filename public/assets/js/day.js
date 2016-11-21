function Day(date){
  this.date = date;
  this.messages = {
    0: [],
    1: [],
    2: [],
    3: [],
    4: [],
    5: [],
    6: [],
    7: [],
    8: [],
    9: [],
    10: [],
    11: [],
    12: [],
    13: [],
    14: [],
    15: [],
    16: [],
    17: [],
    18: [],
    19: [],
    20: [],
    21: [],
    22: [],
    23: []
  };
}

Day.prototype.getTotalMessage = function () {
  var total = 0;

  for(var hour in this.messages){
    if(this.messages.hasOwnProperty(hour)){
      total += this.messages[hour].length;
    }
  }

  return total;
};

Day.prototype.addMessage = function(message){
  this.messages[message.getDate().getHours()].push(message);
};

Day.prototype.getTotalMessageInHour = function (hour) {
  return this.messages[hour].length;
};
