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

//K.addText('Lorem Ipsum es simplemente el texto de relleno de las imprentas y archivos de texto. Lorem Ipsum ha sido el texto de relleno estándar de las industrias desde el año 1500, cuando un impresor (N. del T. persona que se dedica a la imprenta) desconocido usó una galería de textos y los mezcló de tal manera que logró hacer un libro de textos especimen. No sólo sobrevivió 500 años, sino que tambien ingresó como texto de relleno en documentos electrónicos, quedando esencialmente igual al original. Fue popularizado en los 60s con la creación de las hojas "Letraset", las cuales contenian pasajes de Lorem Ipsum, y más recientemente con software de autoedición, como por ejemplo Aldus PageMaker, el cual incluye versiones de Lorem Ipsum.Es un hecho establecido hace demasiado tiempo que un lector se distraerá con el contenido del texto de un sitio mientras que mira su diseño. El punto de usar Lorem Ipsum es que tiene una distribución más o menos normal de las letras, al contrario de usar textos como por ejemplo "Contenido aquí, contenido aquí". Estos textos hacen parecerlo un español que se puede leer. Muchos paquetes de autoedición y editores de páginas web usan el Lorem Ipsum como su texto por defecto, y al hacer una búsqueda de "Lorem Ipsum" va a dar por resultado muchos sitios web que usan este texto si se encuentran en estado de desarrollo. Muchas versiones han evolucionado a través de los años, algunas veces por accidente, otras veces a propósito (por ejemplo insertándole humor y cosas por el estilo).Al contrario del pensamiento popular, el texto de Lorem Ipsum no es simplemente texto aleatorio. Tiene sus raices en una pieza cl´sica de la literatura del Latin, que data del año 45 antes de Cristo, haciendo que este adquiera mas de 2000 años de antiguedad. Richard McClintock, un profesor de Latin de la Universidad de Hampden-Sydney en Virginia, encontró una de las palabras más oscuras de la lengua del latín, "consecteur", en un pasaje de Lorem Ipsum, y al seguir leyendo distintos textos del latín, descubrió la fuente indudable. Lorem Ipsum viene de las secciones 1.10.32 y 1.10.33 de "de Finnibus Bonorum et Malorum" (Los Extremos del Bien y El Mal) por Cicero, escrito en el año 45 antes de Cristo. Este libro es un tratado de teoría de éticas, muy popular durante el Renacimiento. La primera linea del Lorem Ipsum, "Lorem ipsum dolor sit amet..", viene de una linea en la sección 1.10.32 El trozo de texto estándar de Lorem Ipsum usado desde el año 1500 es reproducido debajo para aquellos interesados. Las secciones 1.10.32 y 1.10.33 de "de Finibus Bonorum et Malorum" por Cicero son también reproducidas en su forma original exacta, acompañadas por versiones en Inglés de la traducción realizada en 1914 por H. Rackham.Hay muchas variaciones de los pasajes de Lorem Ipsum disponibles, pero la mayoría sufrió alteraciones en alguna manera, ya sea porque se le agregó humor, o palabras aleatorias que no parecen ni un poco creíbles. Si vas a utilizar un pasaje de Lorem Ipsum, necesitás estar seguro de que no hay nada avergonzante escondido en el medio del texto. Todos los generadores de Lorem Ipsum que se encuentran en Internet tienden a repetir trozos predefinidos cuando sea necesario, haciendo a este el único generador verdadero (válido) en la Internet. Usa un diccionario de mas de 200 palabras provenientes del latín, combinadas con estructuras muy útiles de sentencias, para generar texto de Lorem Ipsum que parezca razonable. Este Lorem Ipsum generado siempre estará libre de repeticiones, humor agregado o palabras no características del lenguaje, etc.');
//K.print();
