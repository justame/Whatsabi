function AuthorAnalyzer(eContainer){
    var deposit = new Graph(),
        container = $(eContainer);

    /**
     * This method add a new Author object as a vertex in the deposit.
     * @param name
     */
    function addAuthor(name){
        deposit.addVertex(new Author(name));
    }

    /**
     * This method return the HTML element of the author in parameter.
     * @param author
     * @param index
     * @returns {string}
     */
    function getHTMLElement(author, index){
        var authorName = author.getName(),
            authorId = authorName + index;

        return '<li id="author' + authorId + '">' +
            '<div class="listElementPanel authorPanel">' +
            '<svg class="authorProfilePic"></svg>' +
            '<h3>' + authorName + '</h3>' +
            '<p>' + author.getTotalMessage() + ' messages. ' +
            author.getTotalMedia() + ' files. ' +
            /*author.getTimeSpent()*/0 + 'h spent.</p>' +
            '</div>' +
            '<div class="authorPanelDetails">' +
            '<p>Iniciadas: 5</p>' +
            '<p>Finalizadas: 2</p>' +
            '<p>Monologos: 10</p>' +
            '<p>Poca interacción con Author3</p>' +
            '<p>Main followers:</p>' +
            '<ul>' +
            '<li>Authro1</li>' +
            '</ul>' +
            '<p>Main following:</p>' +
            '<ul>' +
            '<li>Authro1</li>' +
            '</ul>' +
            '<p>Keyword:</p>' +
            '<ul>' +
            '<li>Keywrod1</li>' +
            '</ul>' +
            '</div>' +
            '</li>'
    }

    /**
     * This method returns the index of the author in the graph vertexes.
     * @param name
     */
    function getAuthorIndex(name) {
        var authors = deposit.getVertexes();

        for(var i = 0; i < authors.length; i++){
            var author = authors[i];

            if(author.getName() == name){
                return i;
            }
        }

        //If the author doesn't exist
        return null;
    }

    /**
     * This method add a author in the authorAnalyzer.
     * @param name
     */
    this.addAuthor = function (name) {
        var index = getAuthorIndex(name);

        if(index == null){
            addAuthor(name);
            index = deposit.getVertexes().length - 1;
        }

        return deposit.getVertexes()[index];
    };

    /**
     * This method create a edge between two existing vertexes.
     * @param from
     * @param to
     */
    this.addInteractionBetween = function (from, to) {
        var fromVertex = getAuthorIndex(from),
            toVertex = getAuthorIndex(to);

        if(fromVertex && toVertex){
            var adjMatrix = deposit.getAdjMatrix();

            //Add one to the existing edge
            adjMatrix[fromVertex][toVertex] = 1;
        }
    };

    /**
     * Method to print the list of authors in the container.
     */
    this.print = function () {
        var authors = deposit.getVertexes();

        //Remove current elements in container
        container.empty();

        //Iterate the deposit to print each author in the container
        for(var i = 0; i < authors.length; i++){
            var author = authors[i];

            container.append(getHTMLElement(author, i));
        }

        //Adding event listener to show authors details panel
        $('.authorPanel').on('click', function () {
            var $this = $(this);

            $this.siblings('.authorPanelDetails').slideToggle();
        });

        //Paint profiles picture of authors
        paintingProfiles();
    };
}
