var Whatsabi = function () {
  var instance;

  function init(){

    var maxTimeBetweenSessions = 1000*60*60*2;
    var calendar = [];

    var conversation = new Conversation('#chatMessages');
    var keywordAnalyzer  = new KeywordAnalyzer('#keywordsPanel');
    var authorAnalyzer = new AuthorAnalyzer('#authorsList');
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
      authorAnalyzer = new AuthorAnalyzer('#authorsList');
    }

    /**
     * This method adds message to the calendar deposit.
     * @param message
     */
    function addMessageToCalendar(message){
      if(message instanceof  Message){
        var firstDay = calendar[0],
          messageDate = new Date(message.getDate()),
          daysFromFirst;

        //Set to 00:00:00
        messageDate.setHours(0);
        messageDate.setMinutes(0);
        messageDate.setSeconds(0);
        messageDate.setMilliseconds(0);

        //Check if the first day exists and maintain the message queue
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
      }else{
        //If we arrive here, something is wrong!
        console.log('Something wrong adding message to calendar. Message:');
        console.log(message);
      }
    }

    // /**
    //  * This method return the number of the month in the string.
    //  * January = 0, February = 1 ...
    //  * @param string
    //  * @returns {*}
    //  */
    // function getMonthNumber(string){
    //   //This function support only EN,SP and PT languages
    //   var months = {Ene:0,Jan:0,Feb:1,Fev:1,Mar:2,Abr:3,Apr:3,May:4,Mai:4,Jun:5,
    //     Jul:6,Ago:7,Aug:7,Sep:8,Set:8,Oct:9,Out:9,Nov:10,Dec:11,Dez:11};
    //
    //   return months[string];
    // }
    //
    // /**
    //  * This method return an Date object based in the string received as argument.
    //  * @param string
    //  * @returns {Date}
    //  */
    // function formatDate(string){
    //   //We create a date that will be edited with the data of the message
    //   var date = new Date(),
    //     d, y, m, t, h, min, temp;
    //
    //   //Getting year, month and day from the data of message
    //   if ((new RegExp('^' + dateRegExp)).test(string)) {
    //     temp = string.match(dateRegExp)[0].split('/');
    //     y = temp[2];
    //     m = temp[1] - 1;
    //     d = temp[0];
    //   }else{
    //     //No matching format. Console the format
    //     console.log('Error: Data format invalid \'' + string + '\'');
    //
    //     //We will return the current date if there isn't a match
    //     return date;
    //   }
    //
    //   //Getting hour and minutes from the data of the message
    //   t = string.match(new RegExp(hourPattern))[0];
    //   temp = t.match(/\d{1,2}/g);
    //   h = temp[0];
    //   min = temp[1];
    //
    //   if(t.substring(t.length - 2) == 'PM'){
    //     h = parseInt(h)%12+12;
    //   }
    //
    //   //Set the date
    //   date.setFullYear(y);
    //   date.setMonth(m);
    //   date.setDate(d);
    //   date.setHours(h);
    //   date.setMinutes(min);
    //
    //   return date;
    // }

    /**
     * Returns an array of Messages instances
     * @param S
     * @returns {Array}
     */
    function parseMessages(text){
      var messages = splitText(text);

      function splitText(text){
        var strings = text.split(splitterRegExp);
        return strings.filter(function(e){
          return messageRegexp.test(e);
        });
      };

      return messages.map(function(e){
        var metadata = e.match(messageRegexp)[0];
        var content = e.split(metadata)[1];
        var date = metadata.match(new RegExp(dateRegexp))[0];
        var username = metadata.match(new RegExp(usernameRegexp))[0];

        username = username.substring(3, username.length - 1);
        date = new Date(date);

        return new Message(date, username, content);
      });
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
      var data;

      if(typeof text == 'string'){
        data = parseMessages(text);
        console.log(data)

        //Manage each message..
        for(var i = 0; i < data.length; i++){
          var currentMessage = data[i];

          addMessageToCalendar(currentMessage);
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
              message.getAuthor().addMessage(message);

              //Adding edges to the authors graph
              //We will take the last message and create a edges from this author to the
              //author of the current message
              if(lastMessage){
                authorAnalyzer.addInteractionBetween(lastMessage.getAuthor().getName(), message.getAuthor().getName());
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
            authorAnalyzer.print();
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
