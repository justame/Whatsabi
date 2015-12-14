/**
 * Whatsabi's main role is to parse a text and to give it correct format so the ap
 * can create a Conversation object that the rest of modules can manage.
 * Singleton pattern.
 * @type {{getInstance}}
 */
var Whatsabi = function () {
    var instance;

    function init(){

        var maxTimeBetweenSessions = 1000*60*60*2,
            calendar = [],
            //Init modules
            conversation = new Conversation('#chatMessages'),
            keywordAnalyzer  = new KeywordAnalyzer('#keywordsPanel'),
            authorsAnalyzer = new AuthorAnalyzer('#authorsList'),
            //Different regular expressions we will use later
            linePattern = "\\r\\n|\\r|\\n",
            authorPattern = "[-]\\s.[^:]*[:]\\s",//Match: "- Author name : "
            datePattern1 = "\\d{1,2}(\\s\\w{1,2})?\\s[A-z|\u00E0-\u00FC]{3}(\\s[A-z|\u00E0-\u00FC])?",//Match: "12 de Abr"
            datePattern2 = "\\d{1,2}[\/]\\d{2}[\/]\\d{4}",//Match: "01/12/2014"
            hourPattern = "\\d{1,2}[:]\\d{2}\\s?[A-Z]{0,2}",//Match: "12:59PM"
            //Match: "26/10/2015, 10:34 AM" | "26/10/2015, 10:34" | "5 de Abr, 2:42AM" | "5 de Abr, 2:42"
            dataHourPattern = "((" + datePattern1 + ")|(" + datePattern2 + "))[,]?\\s" + hourPattern,
            //Match: "26/10/2015, 10:34 AM " | "26/10/2015, 10:34 " | "5 de Abr, 2:42AM " | "5 de Abr, 2:42 "
            messageDataPattern = "^" + dataHourPattern + "\\s",
            //Match: "26/10/2015, 10:34 AM - Author name : " | "26/10/2015, 10:34 - Author name : " |
            // "5 de Abr, 2:42AM - Author name : " | "5 de Abr, 2:42 - Author name : "
            messagePattern = messageDataPattern + authorPattern;

        /**
         * This method resets the data of the current conversation.
         */
        function reset(){
            calendar = [];
            conversation = new Conversation('#chatMessages');
            keywordAnalyzer  = new KeywordAnalyzer('#keywordsPanel');
            authorsAnalyzer = new AuthorAnalyzer('#authorsList');
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
                console.log("Something wrong adding message to calendar. Message:");
                console.log(message);
            }
        }

        /**
         * This method take a text and search for Whatsapp message patterns, then it returns an array of strings.
         * Each string represents a message in the text.
         * @param text
         * @returns {Array}
         */
        function splitText(text){
            var data = [],
                //Firstly we split the text in lines
                lines = text.split(new RegExp(linePattern));

            //Iterating each line to check if it is a user or a system message
            //We discard messages from the system
            for (var i = 0; i < lines.length; i++) {
                var current = lines[i],
                    messageRegExp = new RegExp(messagePattern);

                if (messageRegExp.test(current)) {
                    //If the current line follows the correct message pattern,
                    //we include it to the array of data
                    data.push(current);

                }else if(i>0 && typeof current == "string" && current.length > 0 && !(new RegExp(messageDataPattern)).test(current)){
                    //If the line doesn't follow the pattern of a message, it may be a system message
                    //or a piece of content from the previous message. So we must confirm whether it is
                    //a piece of content to concatenate with previous line. We must also prevent concatenate
                    //with element out of range of array.

                    data[data.length - 1] += current;
                }
            }

            return data;
        }

        /**
         * This method return the number of the month in the string.
         * January = 0, February = 1 ...
         * @param string
         * @returns {*}
         */
        function getMonthNumber(string){
            //This function support only EN,SP and PT languages
            var months = {Ene:0,Jan:0,Feb:1,Fev:1,Mar:2,Abr:3,Apr:3,May:4,Mai:4,Jun:5,
                Jul:6,Ago:7,Aug:7,Sep:8,Set:8,Oct:9,Out:9,Nov:10,Dec:11,Dez:11};

            return months[string];
        }

        /**
         * This method return an Date object based in the string received as argument.
         * @param string
         * @returns {Date}
         */
        function formatDate(string){
            //We create a date that will be edited with the data of the message
            var date = new Date(),
                d, y, m, t, h, min, temp;

            //Getting year, month and day from the data of message
            //Format: "12 de Abr"
            if((new RegExp("^" + datePattern1)).test(string)){
                temp = string.match(datePattern1)[0];
                y = date.getFullYear();
                m = getMonthNumber(temp.match(/[A-z|\u00E0-\u00FC]{3}/)[0]);
                d = temp.match(/\d{1,2}/)[0];

            //Format: "01/12/2014"
            } else if ((new RegExp("^" + datePattern2)).test(string)) {
                temp = string.match(datePattern2)[0].split("/");
                y = temp[2];
                m = temp[1] - 1;
                d = temp[0];
            }else{
                //No matching format. Console the format
                console.log("Error: Data format invalid \"" + string + "\"");

                //We will return the current date if there isn't a match
                return date;
            }

            //Getting hour and minutes from the data of the message
            t = string.match(new RegExp(hourPattern))[0];
            temp = t.match(/\d{1,2}/g);
            h = temp[0];
            min = temp[1];

            if(t.substring(t.length - 2) == "PM"){
                h = parseInt(h)%12+12;
            }

            //Set the date
            date.setFullYear(y);
            date.setMonth(m);
            date.setDate(d);
            date.setHours(h);
            date.setMinutes(min);

            return date;
        }

        /**
         * This method take an array of string and create instances of Messages.
         * Return an Array of Message objects.
         * @param lines
         * @returns {Array}
         */
        function formatMessage(lines){
            var messages = [],
                messageData, date, author, content, aux;

            //Iterate the lines array to format each message
            for(var i = 0;i < lines.length; i++){
                var line = lines[i];

                //Get the data of the message from the line
                messageData = line.match(new RegExp(messagePattern))[0];

                //Isolate the content
                content = line.substring(messageData.length);

                //Split date and author from the message data
                aux = messageData.split(" - ");
                date = formatDate(aux[0]);
                author = aux[1].slice(0, -2);
                author = authorsAnalyzer.addAuthor(author);

                //Before add the formatted text to the array, we confirm everything is ok
                //and log the data in he console if something was wrong
                if(date instanceof Date && !isNaN(date.getDate()) && author instanceof Author && typeof content == "string"){
                    //Create the a message object with the data and push it to the messages array
                    var message = new Message(date, author, content);

                    messages.push(message);
                }else{
                    console.log("%c Something was wrong formatting the message:", 'color: #FF0000');
                    console.log(line);
                    console.log("Date: " + date);
                    console.log("Author: " + author);
                    console.log("Content: " + content);
                }
            }

            return messages;
        }

        /**
         * Method to analyze a new text.
         */
        function analyzeText(text){
            var data;

            if(typeof text == "string"){
                data = formatMessage(splitText(text));

                //Manage each message..
                for(var i = 0; i < data.length; i++){
                    var currentMessage = data[i];

                    addMessageToCalendar(currentMessage);
                    //conversation.addMessage(currentMessage);
                    //keywordAnalyzer.addText(currentMessage.getContent());
                }
            }

            //keywordAnalyzer.print();
            //conversation.print();
            //authorsAnalyzer.print();
        }

        /**
         * This method set the data of the modules to get them working
         */
        function setDataInModules() {
            //This variable
            var currentSession = 0;

            //Iterate days in calendar
            for(var i = 0; i < calendar.length; i++){
                var day = calendar[i];

                //Day may not exist in calendar!!
                if(day){
                    //Iterate hours in day
                    for(var j = 0; j < 24; j++) {
                        var messagesInHour = day.messages[j],
                            lastMessage;

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

                            //Adding edges to the authors graph
                            //We will take the last message and create a edges from this author to the
                            //author of the current message
                            if(lastMessage){
                                authorsAnalyzer.addInteractionBetween(lastMessage.getAuthor().getName(), message.getAuthor().getName());
                            }

                            //Send text to keywordAnalyzer
                            keywordAnalyzer.addText(message.getContent());

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
                    };

                    reader.onerror = function (e) {
                        console.log('Error loading file: ' + e);
                    }
                } else {
                    console.log('File format incorrect.');
                }
            },

            /**
             * This method sent the conversation to the server for future usage.
             */
            saveConversation: function (){
                console.log("Saving conversation...")
            },

            /**
             * This method print the report of a conversation
             */
            printConversation: function () {
                console.log("Printing converstaion...")
            },

            /**
             * This method filter the data showed in the report.
             */
            filterReport: function () {
                console.log("Filtering report");
            },

            /**
             * This method set the time to consider sessionns.
             * @param time
             */
            setMaxTimeBetweenSessions: function (time) {
                if(typeof time == "Number"){
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