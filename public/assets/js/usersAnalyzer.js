function UsersAnalyzer(eContainer){
  var users = new Graph();
  var container = $(eContainer);

  function getInteractionsWithHerOwn(name){
    var index = getAuthorIndex(name);

    return users.getAdjMatrix()[index][index];
  }

  function getMainFollowing(name){
    var authorIndex = getAuthorIndex(name),
      interactions = users.getAdjMatrix()[authorIndex],
      authors = users.getVertexes(),
      max, maxIndex;

    for(var i = 0; i < interactions.length; i++){
      var current = interactions[i];

      if( i != authorIndex){
        if(!max){
          max = current;
          maxIndex = i;
        }else if(max && current > max){
          max = current;

          maxIndex = i;
        }
      }
    }

    return authors[maxIndex];
  }

  function getLessFollowing(name){
    var authorIndex = getAuthorIndex(name),
      interactions = users.getAdjMatrix()[authorIndex],
      authors = users.getVertexes(),
      min = 0,
      minIndex = 0;

    for(var i = 0; i < interactions.length; i++){
      var current = interactions[i];

      //Ignore interactions with herself
      if( i != authorIndex){
        //If max is null, set current as max
        if(!min){
          min = current;
          minIndex = i;

        //Check if current is greater than max
        }else if(current < min){
          min = current;

          minIndex = i;
        }
      }
    }

    return authors[minIndex];
  }

  function getMainFollower(name){
    var authorIndex = getAuthorIndex(name),
      adjMatrix = users.getAdjMatrix(),
      authors = users.getVertexes(),
      max, maxIndex;

    for(var i = 0; i < adjMatrix.length; i++){
      var current = adjMatrix[i][authorIndex];

      //Ignore interactions with herself
      if( i != authorIndex){
        //If max is null, set current as max
        if(!max){
          max = current;
          maxIndex = i;

        //Check if current is greater than max
        }else if(max && current > max){
          max = current;

          maxIndex = i;
        }
      }
    }

    return authors[maxIndex];
  }

  /**
   * This method add a new Author object as a vertex in the users.
   * @param name
   */
  function addAuthor(name){
    users.addVertex(new Author(name));
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
      Math.round(author.getTimeSpent()/1000/60/60) + 'h spent.</p>' +
      '</div>' +
      '<div class="authorPanelDetails">' +
      '<p>Iniciadas: ' + author.getStartedSessions() + '</p>' +
      '<p>Finalizadas: ' + author.getEndedSessions() + '</p>' +
      '<p>Monologos: ' + getInteractionsWithHerOwn(authorName) + '</p>' +
      '<p>Poca interacción con ' + getLessFollowing(authorName).getName() + '</p>' +
      '<p>Main followers: </p>' +
      '<ul>' +
      '<li>' + getMainFollower(authorName).getName() + '</li>' +
      '</ul>' +
      '<p>Main following:</p>' +
      '<ul>' +
      '<li>' + getMainFollowing(authorName).getName() + '</li>' +
      '</ul>' +
      '<p>Keyword:</p>' +
      '<ul>' +
      '<li>' + author.getMostUsedWord() + '</li>' +
      '</ul>' +
      '</div>' +
      '</li>'
  }

  /**
   * This method returns the index of the author in the graph vertexes.
   * @param name
   */
  function getAuthorIndex(name) {
    var authors = users.getVertexes();

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
      index = users.getVertexes().length - 1;
    }

    return users.getVertexes()[index];
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
      var adjMatrix = users.getAdjMatrix();

      //Add one to the existing edge
      adjMatrix[fromVertex][toVertex]++;
    }
  };

  /**
   * Method to print the list of authors in the container.
   */
  this.print = function () {
    var authors = users.getVertexes();

    //Remove current elements in container
    container.empty();

    //Iterate the users to print each author in the container
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
