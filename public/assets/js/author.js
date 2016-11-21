function Author(name) {
  this.name = name;
  var name = name;
  var messages = [];
  var media = [];
  var messagesSplitter = new RegExp('[^\w]');
  var mediaMatch = new RegExp('.?[<].*[>]');
  var keywords = new KeywordTree();
  var timeSpent;
  var timeOut;
  var maxTimeBetweenMessages = 1000 * 60 * 15;//We will consider 15min as the max time between messages to consider a session

  /**
   * This method add one more message sent by the user.
   * @param message
   */
  this.addMessage = function(message){
    var messageContent = message.getContent();

    messages.push(message);
    keywords.addWordList(messageContent.split(messagesSplitter));

    if(mediaMatch.test(messageContent)){
      media.push(message);
    }
  };

  /**
   * This method returns the name of the author.
   * @returns {string}
   */
  this.getName = function () {
    return name;
  };

  /**
   * This method returns the time spent by the user in the conversation.
   * We will consider time spent as the different between the time from the
   * first to the last message with a the time out (more than 15 minutes will be timeout)
   * @returns {number}
   */
  this.getTimeSpent = function () {
    if(!timeSpent){
      for(var i = 0; i < messages.length; i++){
        var current = messages[i];
        var prev = i > 0 ? messages[i - 1] : current;
        var dif = current.getDate() - prev.getDate();

        timeSpent += dif < maxTimeBetweenMessages ? dif : 0;
      }
    }

    return timeSpent;
  };

  this.getStartedSessions = function() {
    var startedSessions = 0;

    for(var i = 0; i < messages.length; i++){
      if(messages[i].getStartedSession()){
        startedSessions++;
      }
    }

    return startedSessions;
  };

  this.getEndedSessions = function() {
    var endedSessions = 0;

    for(var i = 0; i < messages.length; i++){
      if(messages[i].getEndedSession()){
        endedSessions++;
      }
    }

    return endedSessions;
  };

  this.getKeywords = function () {
    return keywords.getAllOccurrences();
  };

  this.getMostUsedWord = function () {
    return this.getKeywords()[0].getWord();
  };

  /**
   * This method returns the total number of message sent by the user.
   * @returns {Number}
   */
  this.getTotalMessage = function () {
    return messages.length;
  };

  /**
   * This method returns the total number of media shared by the user.
   * @returns {Number}
   */
  this.getTotalMedia = function () {
    return media.length;
  };
}
