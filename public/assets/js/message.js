/**
 * Message class models each message in the conversation. This class includes a
 * pointer to the next message so it can work as a node in a queue.
 * @param date
 * @param name
 * @param text
 * @constructor
 */
function Message(date, user, content){
    var date = date;
    var user = user;
    var content = content;
    var startedSession = false;
    var previous = null;
    var next = null;
    var inSession;

    this.date = date;
    this.user = user;
    this.content = content;
    
    /**
     * This method set the pointer to the previous message.
     * @param message
     * @returns {boolean}
     */
    this.setPrevious = function (message) {
        if(message instanceof Message){
            previous = message;
            return true;
        }else{
            return false;
        }
    };

    /**
     * This method set the pointer to the next message.
     * @param message
     * @returns {boolean}
     */
    this.setNext = function (message) {
        if(message instanceof Message){
            next = message;
            return true;
        }else{
            return false;
        }
    };

    /**
     * This method set the session that the message belongs.
     * @param session
     */
    this.setInSession = function (session) {
        if(typeof session == "number"){
            inSession = session;
        }
    };

    /**
     * This method set whether the message started a new session in the conversation or not.
     * @param started
     */
    this.setStartedSession = function (started) {
        if(typeof started == "boolean"){
            startedSession = started;
        }
    };

    /**
     * This method returns the previous message.
     * @returns {Message}
     */
    this.getPrevious = function () {
        return previous;
    };

    /**
     * This method returns the next message.
     * @returns {Message}
     */
    this.getNext = function () {
        return next;
    };

    /**
     * This method returns the date when the message was sent.
     * @returns {Date}
     */
    this.getDate = function () {
        return date;
    };

    /**
     * This method returns the day when the message was created as a string
     * with dd/mm/yyyy format.
     */
    this.getDayString = function () {
        var string = date.getDate() + '/' + (date.getMonth() + 1) + '/' + date.getFullYear();

        return string;
    };

    /**
     * This method returns the user of the conversation.
     * @returns {*}
     */
    this.getAuthor = function () {
        return user;
    };

    /**
     * This method returns the content of the conversation.
     * @returns {*}
     */
    this.getContent = function () {
        return content;
    };

    /**
     * This method returns the date (in milliseconds) to the next message in the conversation.
     * @returns {number}
     */
    this.getTimeToPrevious = function () {
        if(previous){
            return Math.abs(previous.getDate().getTime() - date.getTime());
        }
    };

    /**
     * This method returns the date (in milliseconds) to the next message in the conversation.
     * @returns {number}
     */
    this.getTimeToNext = function () {
        if(next){
            return next.getDate().getTime() - date.getTime();
        }
    };

    /**
     * This method returns the id of the session in which the message was sent.
     * @returns {number}
     */
    this.getSession = function () {
        return inSession;
    };

    /**
     * This method returns a boolean value to confirm if the message started a new session.
     * @returns {boolean}
     */
    this.getStartedSession = function () {
        return startedSession;
    };

    /**
     * This method returns a boolean value to confirm if the message ended a session.
     * @returns {boolean}
     */
    this.getEndedSession = function () {
        //If there isn't next message or it started a session, this one ended another a session
        if(!next ||next.getStartedSession()){
            return true;
        }
    };
}
