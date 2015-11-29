/**
 * Whatsabi's main role is to parse a text and to give it correct format so the ap
 * can create a Conversation object that the rest of modules can manage.
 * Singleton pattern.
 * @type {{getInstance}}
 */
var Whatsabi = function () {
    var instance;

    function init(){
        //Different regular expressions we will use later
        var linePattern = "\\r\\n|\\r|\\n",
            authorPattern = "[-]\\s.[^:]*[:]\\s",//Match: "- Author name : "
            datePattern1 = "\\w{1,2}\\s\\w{3}",//Match: "de Abr"
            datePattern2 = "\\d{1,2}\\s" + datePattern1,//Match: "12 de Abr"
            datePattern3 = "\\d{1,2}[/]){2}\\d{4}",//Match: "01/12/2014"
            timePattern1 = "\\d{1,2}[:]\\d{2}\\s?[A-Z]{0,2}",//Match: "12:59PM"
        //TODO: Support French characters
            dataHourPattern1 = "((((" + datePattern2 + ")|(" + datePattern3 + "))[,]\\s" + timePattern1 + ")",
            dataHourPattern2 = "(" + timePattern1 + "\\s" + datePattern2 + "(" + datePattern1 + ")?)",
            messageDataPattern =   "^(" + dataHourPattern1 + "|" + dataHourPattern2 + ")\\s",
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
                var current = lines[i];

                if ((new RegExp(messagePattern)).test(current)) {
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
         * This method return an Date object based in the string received as argument.
         * @param string
         * @returns {Date}
         */
        function formatDate(string){

            return new Date();
        }

        /**
         * This method take an array of string and create instances of Messages.
         * Return an Array of Message objects.
         * @param lines
         * @returns {Array}
         */
        function formatLines(lines){
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
                    //Create the an object with the data and push it to the messages array
                    var protoMessage = {
                        date : date,
                        user : author,
                        content : content
                    };

                    console.log(line);

                    messages.push(protoMessage);
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

            if(typeof text == "string"){
                data = formatLines(splitText(text));
            }

            return data;
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
$('#fileInput').on('change', app.readFile);