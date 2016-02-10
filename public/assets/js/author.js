function Author(authorName) {
    var name = authorName || 'Mr. Nobody',
        timeSpent = 0,
        timeOut = 0,
        messages = [],
        media = [],
        regExp = /[^\w]/,
        keywords = new KeywordTree();

    /**
     * This method add one more message sent by the user.
     * @param message
     */
    this.addMessage = function(message){
        //Add a pointer to the message
        messages.push(message);

        //Add text to the keyword analyzer
        keywords.addWordList(message.getContent().split(regExp));

        //Identify messages of media files shared
        if(/.?[<].*[>]/.test(message.getContent())){
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
     * @returns {number}
     */
    this.getTimeSpent = function () {
        if(!timeSpent){
            var totalChatTime = messages[messages.length-1].getDate() - messages[0].getDate(),
                partialTime;

            //We will consider the time spent as the different between the time from the
            //first to the last message with the time out (more than 15 minutes will be timeout)
            for(var i = 1;i < messages.length;i++){
                var message = messages[i],
                    previousMessage = messages[i-1];

                //Time between two messages...
                partialTime = message.getDate() - previousMessage.getDate();

                if(partialTime > (1000*60*15)){
                    timeOut += partialTime;
                }
            }

            timeSpent = totalChatTime - timeOut;
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