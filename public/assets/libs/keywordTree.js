function Tree(value){
    var root = value,
        children = [];

    this.setRoot = function (newRoot) {
        root = newRoot;
    };

    this.getRoot = function () {
        return root;
    };

    this.getChildren = function () {
        return children;
    };

    this.addChild = function (child) {
        if(child instanceof Tree){
            children.push(child);
        }
    };

    this.removeChild = function (index) {
        children.splice(index, 1);
    };

    this.isLeaf = function () {
        return !children.length;
    };

    this.isEmpty = function() {
        return !root;
    };
}

/**
 * This class model each occurrence in the text. It is used to return a list of words with its frequency
 * @param value
 * @param freq
 * @constructor
 */
function Occurrence(value, freq){
    var word = value,
        times = freq || 1;

    this.getWord = function () {
        return word;
    };

    this.getFreq = function () {
        return times;
    };
}

/**
 * This class model the container of words in a text.
 * Each node in the tree will represent a character. We will reserve the leaf children to store the frequency.
 * We get the full word following the corresponding branch.
 * "*" will be used in leaves to mark excluded words.
 *
 * Structure example for the list: "dad", "dad, "daddy", "dog", "dog", "dog", "mom", "mom" and "mother", where
 * the word "daddy" is excluded of the list of occurrences:
 *
 *                                   {&&}
 *                                 ___|___
 *                               /        \
 *                             [d]       [m]
 *                             _|_        |
 *                            /   \      [o]
 *                          [a]   [o]     |
 *                           |     |     / \
 *                          [d]   [g]  [m] [t]
 *                          / \    |    |   |
 *                        (2) [d] (3)  (2) [h]
 *                             |            |
 *                            [y]          [e]
 *                             |            |
 *                            (1*)         [r]
 *                                          |
 *                                         (1)
 *
 * Nodes can contain any character: letter, number, symbols, space... it only depends of what you consider word
 * when your are inserting them to the tree.
 * @param wordList
 * @constructor
 */
function KeywordTree(wordList) {
    //Tree as data structure
    var wordsDeposit = new Tree("&&");

    /**
     * Method to add a word to the tree. Case the word already exists, we increase frequency.
     * @param word
     * @param tree
     */
    function addWord(word, tree){
        if(word.length < 1){
            //Iterate the tree to get the counter leaf
            for (var i = 0; i < tree.getChildren().length; i++) {
                var leaf = tree.getChildren()[i];

                //The leaf in the tree will be the counter, only one leaf can exists, so once we found it
                //we can count plus one freq.
                if(leaf.isLeaf()){
                    var root = leaf.getRoot(),
                        rootString = root + "",
                    //We check if the root contains a mark "*"
                        excluded = rootString.indexOf("*") > -1,
                        nRoot;

                    if(excluded){
                        //If the word is excluded, we will count++ and keep the mark "*"
                        rootString = rootString.substring(0, rootString.length - 1);
                        //Prevent eval("")
                        if(rootString.length < 1){
                            rootString = 0;
                        }

                        //Count plus one and keep the mark
                        nRoot = eval(rootString) + 1 + "*";
                    }else{
                        nRoot = root + 1;
                    }

                    //We set the correct value in the root
                    leaf.setRoot(nRoot);
                    //Nothing else to do here, return!
                    return;
                }
            }

            //If we get here, this branch doesn't have any leaf. We create one new tree and add it
            tree.addChild(new Tree(1));
        }else{
            var firstCharacter = word[0],
                nChild;

            //Iterate the tree to get the child with the first character
            for (var j = 0; j < tree.getChildren().length; j++) {
                var child = tree.getChildren()[j];

                //If we find it, we store it in the variable
                if(child.getRoot() == firstCharacter){
                    nChild = child;
                }
            }

            //In case the character doesn't exist, we must create it and add it
            if(!nChild){
                //Create it
                nChild = new Tree(firstCharacter);
                tree.addChild(nChild);
            }

            //We continue this process recursively from the child for the rest of the string
            addWord(word.slice(1), nChild)
        }
    }

    /**
     * Method to get a list of Occurrence objects with the words in a tree.
     * The exclude parameter filter those words marked as excluded.
     * @param word
     * @param tree
     * @param exclude
     * @returns {Array}
     */
    function findOccurrences(word, tree, exclude){
        var occurrences = [];

        //If the tree is a leaf, the word is complete
        //Now we need to find out whether the word is excluded and if it is, exclude it or include it depending of the
        //exclude parameter
        if(tree.isLeaf()){
            var freq = tree.getRoot(),
            //Convert to string to find the mark "*"
                freqString = freq + "",
            //Check if it exists mark "*"
                marked = freqString.substring(freqString.length - 1) == "*";


            //Adding the word with its frequency to the occurrences list accordingly with exclude parameter
            if(!exclude){
                if(marked){
                    freq = eval(freqString.substring(0, freqString.length - 2));
                }
                occurrences.push(new Occurrence(word, freq));
            }else if(exclude && !marked){
                occurrences.push(new Occurrence(word, freq));
            }
        }else{
            //For each child, we will get its occurrences
            for (var i = 0; i < tree.getChildren().length; i++) {
                var child = tree.getChildren()[i],
                    childWord = word,
                    childWords;

                //Concatenating the word. If the current child is a leaf, we don't concatenate
                //to prevent the concatenation of the own freq!
                if(!child.isLeaf()){
                    childWord += child.getRoot();
                }

                //Get words in this child recursively
                childWords = findOccurrences(childWord, child, exclude);

                //We iterate the words in the child and push them to the list
                for(var j = 0; j < childWords.length; j++){
                    var occurrence = childWords[j];

                    occurrences.push(occurrence);
                }
            }
        }

        return occurrences;
    }

    /**
     * Method to get the words stored in the tree with its frequency ordered by freq and alphabet.
     * With exclude parameter we can filter the words marked as excluded.
     * @param exclude
     * @returns {Array}
     */
    function getOccurrences(exclude){
        var occurrences = findOccurrences("", wordsDeposit, exclude);

        occurrences =  occurrences.sort(function(a,b){
            var d = b.getFreq() - a.getFreq();

            //If frequencies are equal, order list by character
            if(d == 0){
                var aWord = a.getWord(),
                    bWord = b.getWord();

                if(aWord < bWord){
                    d = -1;
                }else if(aWord > bWord){
                    d = 1;
                }
            }

            return d;
        });

        return occurrences;
    }

    /**
     * Method to get the node of the last character in the word passed.
     * @param word
     * @param tree
     */
    function getNode(word, tree){
        if(word.length < 1){
            return tree;
        }else{
            var children = tree.getChildren();

            for(var i = 0;i < children.length;i++){
                var child = children[i];

                if(child.getRoot() == word[0]){
                    return getNode(word.slice(1), child)
                }
            }

            //If we get here, there isn't a child with the first character, so the word isn't stored
            return null;
        }
    }

    /**
     * Method to add word to the tree
     * @param word
     */
    this.addWord = function(word) {
        //Only no-empty strings will be allowed!
        if(typeof word == "string" && word.length > 0){
            addWord(word, wordsDeposit);
        }
    };

    /**
     * Method to add a list of words.
     * @param words
     */
    this.addWordList = function (words) {
        if(words instanceof Array){
            for(var i = 0;i < words.length;i++){
                var word = words[i];

                this.addWord(word);
            }
        }
    };

    /**
     * Method to excluded word of the tree. Excluded word won't be shown in the occurrences list
     * @param word
     */
    this.excludeWord = function(word) {
        //Only no-empty strings will be allowed!
        if(typeof word == "string" && word.length > 0){
            //First we find the node of the word
            var tree = getNode(word, wordsDeposit),
            //Check the tree isn't null and get the children list
                children = (tree)? tree.getChildren(): [];

            //Iterate its children to get the leaf with the freq
            for(var i = 0;i < children.length; i++){
                var child = children[i];

                //If leaf exists, we get the freq and break the loop
                if(child.isLeaf()){
                    var freq = child.getRoot(),
                        rootString = freq + "",
                    //We check if the root contains a mark "*"
                        excluded = rootString.indexOf("*") > -1;

                    //If the word isn't excluded yet, we marked as excluded
                    if(!excluded){
                        child.setRoot(rootString + "*");
                    }

                    break;
                }
            }
        }
    };

    /**
     * Method to exclude a list of words.
     * @param words
     */
    this.excludeWordList = function (words) {
        if(words instanceof Array){
            for(var i = 0;i < words.length;i++){
                var word = words[i];

                this.excludeWord(word);
            }
        }
    };

    /**
     * Method to include word of the tree. it includes a word that is was excluded previously
     * @param excludedWord
     */
    this.includeWord = function(excludedWord) {
        //Only no-empty strings will be allowed!
        if(typeof excludedWord == "string" && excludedWord.length > 0){
            //First we find the node of the word
            var tree = getNode(excludedWord, wordsDeposit),
            //Check the tree isn't null and get the children list
                children = (tree)? tree.getChildren(): [];

            //Iterate its children to get the leaf with the freq
            for(var i = 0;i < children.length; i++){
                var child = children[i];

                //If leaf exists, we get the freq and break the loop
                if(child.isLeaf()){
                    var freq = child.getRoot(),
                        rootString = freq + "",
                    //We check if the root contains a mark "*"
                        excluded = rootString.indexOf("*") > -1;

                    //If the word isn't excluded yet, we marked as excluded
                    if(excluded){
                        freq = rootString.substring(0, rootString.length - 1);

                        //Check the freq isn't an empty string
                        if(freq.length < 1){
                            freq = "0"
                        }

                        //Set the root as a number
                        child.setRoot(eval(freq));
                    }

                    break;
                }
            }
        }
    };

    /**
     * Method to get all the words in the tree with its frequency
     * @returns {Array}
     */
    this.getAllOccurrences = function() {
        return getOccurrences(false);
    };

    /**
     * Method to get all the word not-excluded in the tree with its frequency.
     * @returns {Array}
     */
    this.getOccurrences = function () {
        return getOccurrences(true);
    };

    /**
     * Method to get the frequency of a specific word. Return 0 if the word isn't stored
     * @param word
     */
    this.getFrequency = function (word) {
        var freq = 0;

        //Only no-empty strings will be allowed!
        if(typeof word == "string" && word.length > 0){
            //First we find the node of the word
            var tree = getNode(word, wordsDeposit),
            //Check the tree isn't null and get the children list
                children = (tree)? tree.getChildren(): [];

            //Iterate its children to get the leaf with the freq
            for(var i = 0;i < children.length; i++){
                var child = children[i];

                //If leaf exists, we get the freq and break the loop
                if(child.isLeaf()){
                    freq = child.getRoot();
                    break;
                }
            }
        }

        return freq;
    };

    //Case we init the keywordTree with a list of words, we store them in the tree
    if(wordList instanceof Array){
        for (var i = 0; i < wordList.length; i++) {
            var word = wordList[i];

            this.addWord(word);
        }
    }
}