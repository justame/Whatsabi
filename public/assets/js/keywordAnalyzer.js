function KeywordAnalyzer(eContainer){
    var container = $(eContainer),
        //This occurrences identify the words in the text
        regExp = /[^\w]/,
        //In this array we will store excluded words form previous sessions to
        //exclude them from the beginning
        excludedWords = [],
        deposit, includedKeywords, excludedKeywords;

    //We create two list for included and excluded keywords
    if(container){
        includedKeywords = $('<ul id="includedKeywords" class="keywordAnalyzerList"></ul>');
        excludedKeywords = $('<ul id="excludedKeywords" class="keywordAnalyzerList"></ul>');

        container.append(includedKeywords, excludedKeywords);
    }

    /**
     * Private method to exclude word from analysis.
     * @param word
     */
    function excludeFromDeposit(word) {
        if(deposit){
            deposit.excludeWord(word);
        }
    }

    /**
     * Private method to include word from analysis.
     * @param word
     */
    function includeFromDeposit(word) {
        if(deposit){
            deposit.includeWord(word);
        }
    }

    /**
     * Method to add text to the keyword analyzer.
     * @param text
     */
    this.addText = function (text) {
        var wordList = (text) ? text.split(regExp) : "";

        if(!deposit){
            this.reset();
        }

        deposit.addWordList(wordList);
    };

    /**
     * This method remove all the elements in the lists and create a new empty deposit.
     */
    this.reset = function () {
        //Initialize a new deposit
        deposit = new KeywordTree();

        //Exclude stored excluded words
        deposit.excludeWordList(excludedWords);

        //Remove elements from the list of keywords
        $(".keywordAnalyzerList").children().fadeOut(function () {
            this.remove();
        });
    };

    /**
     * This method returns an Array of Occurrences instances.
     * @returns {Array}
     */
    this.getKeywords = function () {
        if(deposit){
            return deposit.getOccurrences()
        }else {
            return new Array();
        }
    };

    /**
     * Method to print each keyword as a HTML element.
     */
    this.print = function () {
        //Getting the occurrences
        var keywords = this.getKeywords();

        //for each occurrences in the deposit, we insert a element in the container
        for(var i = 0; i < keywords.length; i++){
            var keyword = keywords[i],
                word = keyword.getWord(),
                freq = keyword.getFreq(),
                keywordHTML;

            //Creating the HTML element
            keywordHTML = $('<li data-keyword=' + word + ' data-freq="' + freq + '" class="keywordPanel listElementPanel"><h3>' + word + '</h3><p>' + freq +
                ' occurrences</p><button class="button regularButton tertiaryButton">Hide</button></li>');

            //Adding event listener to button
            keywordHTML.find('button').on('click', function () {
                var button = $(this),
                //Override properties to prevent closures problems
                    word = button.parent().attr('data-keyword'),
                    freq = button.parent().attr('data-freq'),
                    parent = button.parent(),
                    destinyList;

                //Toggling class
                button
                    .toggleClass('tertiaryButton');

                //Setting destiny list, changing the text of the button and excluding/including from the deposit
                if(parent.hasClass('excludedKeyword')){
                    destinyList = includedKeywords;
                    button.html('Hide');
                    excludeFromDeposit(word);
                }else{
                    destinyList = excludedKeywords;
                    button.html('Show');
                    includeFromDeposit(word);
                }

                //Now we need to change the class
                parent
                    .toggleClass('excludedKeyword')//return the parent
                    .fadeOut(function () {
                        //We need to insert the element by freq order
                        var children = destinyList.children(),
                            inserted = false;

                        //Inverted iteration to follow the stack of elements inserted in children by JQuery
                        for(var i = children.length - 1; i >= 0; i--){
                            var child = $(children[i]);

                            //Check freq of each keyword to get the position of the current keyword
                            if(child.attr('data-freq') < freq){
                                //Insert the element before the child
                                parent.insertBefore(child);
                                inserted = true;
                            }
                        }

                        //If we are here
                        if(!inserted) {
                            parent.appendTo(destinyList);
                        }
                    })
                    .fadeIn();
            });

            //Adding the keyword to container
            includedKeywords.append(keywordHTML);
        }
    };
}
