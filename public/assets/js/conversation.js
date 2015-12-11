/**
 * Conversation class will model a chat between different persons. This class will be
 * responsible for sort the message and format them for analysis.
 * This class stores the messages in two different data structures:
 *
 * - Queue: Each message has a reference to the next. This class has pointers to the
 * first one and the last one. This way we can have direct access to the full conversation.
 *
 * - Array of days: In this array we store instances of Day, days have 24 properties, one for
 * each hour in a day. This way, each index in the array represents a day. Index 0 represent the
 * day of the first message. With this data structure we can have direct access to each day-hour
 * like this: Array[day - firstDay][12]
 *
 * @constructor
 */
function Conversation(eContainer){
    var messagesCounter = 0,
        container = $(eContainer),
        creationDate = new Date(),
        //This array will model a calendar
        calendar = [],
        //Pointers to the first and last messages in the conversation
        firstMessage = null,
        lastMessage = null,
        //Variable to control the behaviour of the conversation HTML element
        messagesInContainer = 0,
        limitMessagesInContainer = 200,
        limitMessagesPerAction = 50,
        firstMessageInContainer, lastMessageInContainer;

    /**
     * This method injects messages HTML elements at the bottom of the conversation panel.
     */
    function injectAtBottom() {
        console.log("Injecting at bottom");

        var message = (lastMessageInContainer) ? lastMessageInContainer : firstMessage,
            lastDate,
            counter = 0;

        //Set the first message to print as the first message printed in the panel
        //Only if there is not message already printed
        if(!firstMessageInContainer){
            firstMessageInContainer = message;
        }

        //now we iterate the linked list of message to print them as HTML element in the panel
        while(message && counter < limitMessagesPerAction){
            var mDate = message.getDate();

            //We first need to check whether it is necessary to inject a new date sticker
            if(!lastMessageInContainer || Math.round(lastMessageInContainer.getDate().getTime()/1000/60/60/24) != Math.round(mDate.getTime()/1000/60/60/24)){
                var id = "chatDay" + message.getDayString();

                container.append('<li id="' + id + '" class="dateSticker">' + message.getDayString() + '</li>');
            }

            //Adding the message to the day container
            container.append('<li class="message whitePanel">' +
                '<h4>' + message.getAuthor() + '</h4>' +
                '<div>' + message.getContent() + '</div>' +
                '<span class="messageDateDetail">' + mDate.getHours() + ":" + mDate.getMinutes() + '</span></li>');

            //Setting lastDate for the next iteration and moving the message pointer to the next message
            lastDate = message.getDate();
            message = message.getNext();
            counter++;
            messagesInContainer++;

            lastMessageInContainer = message;
        }
    }

    /**
     * This method injects messages HTML elements at the top of the conversation panel.
     */
    function injectAtTop() {
        console.log("injecting Top");

        var message = (firstMessageInContainer) ? firstMessageInContainer : firstMessage,
            lastDate,
            counter = 0;

        //Set the first message to print as the first message printed in the panel
        //Only if there is not message already printed
        if(!firstMessageInContainer){
            firstMessageInContainer = message;
        }

        //now we iterate the linked list of message to print them as HTML element in the panel
        while(message && counter < limitMessagesPerAction){
            var mDate = message.getDate();

            //We first need to check whether it is necessary to inject a new date sticker
            if(!firstMessageInContainer || Math.round(firstMessageInContainer.getDate().getTime()/1000/60/60/24) != Math.round(mDate.getTime()/1000/60/60/24)){
                var id = "chatDay" + message.getDayString();

                container.prepend('<li id="' + id + '" class="dateSticker">' + message.getDayString() + '</li>');
            }

            //Adding the message to the day container
            container.prepend('<li class="message whitePanel">' +
                '<h4>' + message.getAuthor() + '</h4>' +
                '<div>' + message.getContent() + '</div>' +
                '<span class="messageDateDetail">' + mDate.getHours() + ":" + mDate.getMinutes() + '</span></li>');

            //Setting lastDate for the next iteration and moving the message pointer to the next message
            lastDate = message.getDate();
            message = message.getPrevious();
            counter++;
            messagesInContainer++;

            firstMessageInContainer = message;
        }
    }

    /**
     * This method remove messages HTML elements from the bottom of the conversation panel
     */
    function removeFromBottom() {
        console.log("Removing from bottom");

        var children = container.children(),
            childrenlength = children.length,
            index = 0;

        while(messagesInContainer > limitMessagesInContainer){
            var currentChild = $(children[childrenlength - index]);

            if(currentChild.hasClass("message")){
                //Set minus one elements in the list
                messagesInContainer--;

                //Set the pointer of first message printed
                lastMessageInContainer = lastMessageInContainer.getPrevious();
            }

            //Remove the element
            currentChild.remove();

            //Counting one more element to follow the index in the array
            index++;
        }




        console.log("First Message " + firstMessageInContainer.getContent());
        console.log("Messages in screen " + $("#chatMessages").children().length);
        console.log("Last Message " + lastMessageInContainer.getContent());
    }

    /**
     * This method remove messages HTML elements from the top of the conversation panel
     */
    function removeFromTop() {
        console.log("Removing from top");
        var children = container.children(),
            index = 0,
            lastDateSticker;

        //Remove elements from the top until the number of message in the counter
        //doesn't overpass the limit
        while(messagesInContainer > limitMessagesInContainer){
            var currentChild = $(children[index]);

            //If the element is a message, we will remove it
            if(currentChild.hasClass("message")){
                //Remove message
                currentChild.remove();

                //Set minus one elements in the list
                messagesInContainer--;

                //Set the pointer of first message printed
                firstMessageInContainer = firstMessageInContainer.getNext();

            //If the element is a dateSticker, it will be removed only if it¡s followed by another one
            }else if(currentChild.hasClass("dateSticker")){
                if(lastDateSticker){
                    //Remove sticker
                    lastDateSticker.remove();
                }

                //Set the sticker as the lastDateSticker to get access later
                lastDateSticker = currentChild;
            }

            //Counting one more element to follow the index in the array
            index++;
        }


        console.log("First Message " + firstMessageInContainer.getContent());
        console.log("Messages in screen " + $("#chatMessages").children().length);
        console.log("Last Message " + lastMessageInContainer.getContent());

    }

    /**
     * This message store a new message in the data structures.
     * @param message
     */
    this.addMessage = function (message) {
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

            //Manage unordered message
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

            if(!firstMessage){
                firstMessage = lastMessage = message;
            }else{
                message.setPrevious(lastMessage);
                lastMessage.setNext(message);
                lastMessage = message;
            }

            //Checking if the day exist
            if(!calendar[daysFromFirst]){
                calendar[daysFromFirst] = new Day(messageDate);
            }

            //Finally we add the message to the calendar...
            calendar[daysFromFirst].addMessage(message);

            //Count one more message in the conversation
            messagesCounter++;
        }else{
            //If we arrive here, something is wrong!
            console.log("Something wrong adding message to calendar. Message:");
            console.log(message);
        }
    };

    /**
     * This method returns the first message in the chat
     * @returns {*}
     */
    this.getFirst = function () {
        return firstMessage;
    };

    /**
     * This method returns the last message in the chat
     * @returns {*}
     */
    this.getLast = function () {
        return lastMessage;
    };

    /**
     * This method returns the date of creation the conversation.
     * @returns {Date}
     */
    this.getCreationDate = function () {
        return creationDate;
    };

    /**
     * This method print the first messages from the conversation.
     */
    this.print = function () {
        injectAtBottom();
    };

    /**
     * This method returns the number of messages stored in the conversation
     * @returns {number}
     */
    this.getTotalMessages = function () {
        return messagesCounter;
    };

    //Binding scroll actions to the injecting and removing methods to automate the control
    //of the messages in the panel
    container.scroll(function(e){
        var elem = $(e.currentTarget),
            scrollTop = elem.scrollTop();

        if (elem[0].scrollHeight - scrollTop == elem.innerHeight()){
            injectAtBottom();

            //Check if we need to remove messages from the top
            if(messagesInContainer >= limitMessagesInContainer){
                removeFromTop();
            }
        }else if(scrollTop == 0){
            injectAtTop();

            //Check if we need to remove messages from the bottom
            if(messagesInContainer >= limitMessagesInContainer){
                removeFromBottom();
            }
        }
    });
}