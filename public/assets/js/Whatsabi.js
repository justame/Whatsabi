/**
 * Whatsabi's main role is to parse a text and to give it correct format so the ap
 * can create a Conversation object that the rest of modules can manage.
 * Singleton pattern.
 * @type {{getInstance}}
 */
var Whatsabi = function () {
    var instance;

    function init(){

        var conversation,
            //Different regular expressions we will use later
            linePattern = "\\r\\n|\\r|\\n",
            authorPattern = "[-]\\s.[^:]*[:]\\s",//Match: "- Author name : "
            datePattern1 = "\\d{1,2}\\s\\w{1,2}\\s\\w{3}",//Match: "12 de Abr"
            datePattern2 = "\\d{1,2}[\/]\\d{2}[\/]\\d{4}",//Match: "01/12/2014"
            hourPattern = "\\d{1,2}[:]\\d{2}\\s?[A-Z]{0,2}",//Match: "12:59PM"
            //Match: "26/10/2015, 10:34 AM" | "26/10/2015, 10:34" | "5 de Abr, 2:42AM" | "5 de Abr, 2:42"
            dataHourPattern = "((" + datePattern1 + ")|(" + datePattern2 + "))[,]\\s" + hourPattern,
            //Match: "26/10/2015, 10:34 AM " | "26/10/2015, 10:34 " | "5 de Abr, 2:42AM " | "5 de Abr, 2:42 "
            messageDataPattern =   "^" + dataHourPattern + "\\s",
            //Match: "26/10/2015, 10:34 AM - Author name : " | "26/10/2015, 10:34 - Author name : " |
            // "5 de Abr, 2:42AM - Author name : " | "5 de Abr, 2:42 - Author name : "
            messagePattern =    messageDataPattern + authorPattern;

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

                    data[data.length - 2] += current;
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
                author = aux[1].slice(0,-2);

                //Before add the formatted text to the array, we confirm everything is ok
                //and log the data in he console if something was wrong
                if(date instanceof Date && author.length > 0 && typeof content == "string"){
                    //Create the a message object with the data and push it to the messages array
                    var message = new Message(date, author, content);

                    messages.push(message);
                }else{
                    console.log("Something was wrong formatting the message:");
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

            //Init conversation variable with a new Conversation instance
            conversation = new Conversation('#chatMessages');

            if(typeof text == "string"){
                data = formatMessage(splitText(text));

                for(var i = 0; i < data.length; i++){
                    conversation.addMessage(data[i]);
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

                //Check extension
                if (file.type == 'text/plain') {

                    reader.readAsText(file);

                    //When results is ready, pass it to analyser
                    reader.onload = function () {
                        var text = reader.result;

                        analyzeText(text);
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
                console.log("New analysis");
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