var Whatsabi = function () {
  var instance;

  function init(){

    var maxTimeBetweenSessions = 1000*60*60*2;
    var calendar = [];
    var users = [];

    var conversation = new Conversation('#chatMessages');
    var keywordAnalyzer  = new KeywordAnalyzer('#keywordsPanel');
    var usersAnalyzer = new UsersAnalyzer('#authorsList');
    var usernameRegexp = '\\s\\-\\s[^:]*[:]';
    var dateRegexp = '\\d{2}\\/\\d{2}\\/\\d{2}\\,\\s\\d{1,2}\\:\\d{2}';
    var messageRegexp = new RegExp(dateRegexp + usernameRegexp);
    var splitterRegExp = new RegExp('(?=' + dateRegexp + usernameRegexp + ')');

    /**
     * This method resets the data of the current conversation.
     */
    function reset(){
      calendar = [];
      conversation = new Conversation('#chatMessages');
      keywordAnalyzer  = new KeywordAnalyzer('#keywordsPanel');
      usersAnalyzer = new UsersAnalyzer('#authorsList');
    }

    /**
     * This method adds message to the calendar deposit.
     * @param message
     */
    function addMessageToCalendar(message){
      if(message instanceof  Message){
        var firstDay = calendar[0];
        var messageDate = new Date(message.getDate());
        var daysFromFirst;

        messageDate.setHours(0);
        messageDate.setMinutes(0);
        messageDate.setSeconds(0);
        messageDate.setMilliseconds(0);

        if(!firstDay){
          firstDay = new Day(messageDate);
        }

        //Check number of days form first day to the day of the message
        daysFromFirst = Math.floor((messageDate - firstDay.date)/(1000*60*60*24));

        //Manage message send before first day in calendar
        if(daysFromFirst < 0){
          for(var i = calendar.length - 1; i >= 0; i--) {
            //Move the day to the correct index
            calendar[i - daysFromFirst] = calendar[i];

            //Set the current place as undefined
            calendar[i] = undefined;
          }

          //Set new value to daysFromFirst
          daysFromFirst = 0;
        }

        //Checking if the day exist
        if(!calendar[daysFromFirst]){
          calendar[daysFromFirst] = new Day(messageDate);
        }

        //Finally we add the message to the calendar...
        calendar[daysFromFirst].addMessage(message);
      }
    }

    /**
     * Returns an array of Messages instances
     * @param text
     * @returns {Array}
     */
    function parseData(text){
      var messages = splitText(text);

      function splitText(text){
        var strings = text.split(splitterRegExp);
        return strings.filter(function(e){
          return messageRegexp.test(e);
        })
      };

      return messages.map(function(m, i){
        var metadata = m.match(messageRegexp)[0];
        var content = m.split(metadata)[1];
        var date = new Date(metadata.match(new RegExp(dateRegexp))[0]);
        var username = metadata.match(new RegExp(usernameRegexp))[0];
        username = username.substring(3, username.length - 1);
        var user;
        var userIndex = users.findByProperty(username, 'name');

        if(userIndex === -1){
          user = new Author(username);
          users.push(user);
        }else{
          user = users[userIndex];
        }

        return new Message(date, user, content);
      })
    }

    /**
     * This method serialize the data so chart can use it
     */
    function getSerializedCalendar(){
      var serialized = new Series(),
        data = [];

      for (var i = 0; i < calendar.length; i++) {
        var day = calendar[i];

        //Preventing days without data
        if(day){
          for (var j = 0; j < 24; j++) {
            data.push(day.getTotalMessageInHour(j))
          }
        }
      }

      serialized.data = data;

      return serialized;
    }

    /**
     * This method print the reports
     */
    function printReport(){
      var charts = [],
        mainChart = new DotPolyChart('mainChart'),
        series = [getSerializedCalendar()];

      //Adding the charts to the charts array
      charts.push(mainChart);

      //Set data in charts
      mainChart.setData(series);

      //Paint all the charts
      for (var i = 0; i < charts.length; i++) {
        var chart = charts[i];

        chart.paint();
      }
    }

    /**
     * Method to analyze a new text.
     */
    function analyzeText(text){
      if(typeof text == 'string'){
        var data = parseData(text);

        for(var i = 0; i < data.length; i++){
          addMessageToCalendar(data[i]);
        }
      }
    }

    /**
     * This method set the data of the modules to get them working
     */
    function setDataInModules() {
      //This variable
      var currentSession = 0;

      //Iterate days in calendar
      for(var i = 0; i < calendar.length; i++){
        var day = calendar[i],
          lastMessage;

        //Day may not exist in calendar!!
        if(day){
          //Iterate hours in day
          for(var j = 0; j < 24; j++) {
            var messagesInHour = day.messages[j];

            //Iterate messages in hour
            for (var k = 0; k < messagesInHour.length; k++) {
              var message = messagesInHour[k];

              //Creating a link between messages
              if (lastMessage) {
                message.setPrevious(lastMessage);
                lastMessage.setNext(message);
              }

              //Setting sessions in message
              if(message.getTimeToPrevious() > maxTimeBetweenSessions){
                message.setStartedSession(true);
                currentSession ++;
              }
              message.setInSession(currentSession);

              //Adding message to author
              //message.getAuthor().addMessage(message);

              //Adding edges to the authors graph
              //We will take the last message and create a edges from this author to the
              //author of the current message
              if(lastMessage){
                usersAnalyzer.addInteractionBetween(lastMessage.getAuthor().getName(), message.getAuthor().getName());
              }

              //Send text to keywordAnalyzer
              keywordAnalyzer.addText(message.getContent());

              //Add message to conversation
              conversation.addMessage(message);

              //Set message as lastMessage for later usage
              lastMessage = message;
            }
          }
        }
      }
    }

    //Return the instance of Whatsabi
    return {

      /**
       * This method receives a file from an input, checks its extension and
       * @param event
       */
      readFile: function (event) {
        var file = event.target.files[0],
          reader = new FileReader();

        //Reset
        reset();

        //Check extension
        if (file && file.type == 'text/plain') {

          reader.readAsText(file);

          //When results is ready, pass it to analyser
          reader.onload = function () {
            var text = reader.result;

            analyzeText(text);
            setDataInModules();

            keywordAnalyzer.print();
            conversation.print();
            usersAnalyzer.print();
            printReport();
          };

          reader.onerror = function (e) {
            console.log('Error loading file: ' + e);
          }
        } else {
          console.log('File format incorrect.');
        }
      },

      /**
       * This method restart the app to create a new report.
       */
      restart: function (){
        console.log('New analysis');
      },

      /**
       * This method sent the conversation to the server for future usage.
       */
      saveConversation: function (){
        console.log('Saving conversation...')
      },

      /**
       * This method print the report of a conversation
       */
      printConversation: function () {
        console.log('Printing converstaion...')
      },

      /**
       * This method filter the data showed in the report.
       */
      filterReport: function () {
        console.log('Filtering report');
      },

      /**
       * This method set the time to consider sessionns.
       * @param time
       */
      setMaxTimeBetweenSessions: function (time) {
        if(typeof time == 'Number'){
          maxTimeBetweenSessions = time;
        }
      }
    }
  }

  return {
    getInstance: function () {
      if(!instance){
        instance = init();
      }
      return instance;
    }
  }
}();

var app = Whatsabi.getInstance();
$('#fileInputButtonHidden').on('change', app.readFile);
$('#fileInputButton').click(function () {
  $('#fileInputButtonHidden').click();
});
$('#filterReportButton').on('click', app.filterReport);
$('#saveConversationButton').on('click', app.saveConversation);
$('#showNewConversationPopup').on('click', function () {
  $(this).toggleClass('overAll');
  $('#lightBox').fadeToggle();
});





Array.prototype.contains = function(e){
  return this.find(e) !== undefined;
}

Array.prototype.containsByProperty = function(value, prop){
  return this.findByProperty(value, prop) !== undefined;
}

Array.prototype.find = function(e){
  var index = -1;

  for(var i = 0; i < this.length; i++){
    if(this[i] === e){
      index = i;
      break;
    }
  }
  return index;
}

Array.prototype.findByProperty = function(value, prop){
  return map = this.map(function(e){
    return e[prop]
  }).find(value);
}
