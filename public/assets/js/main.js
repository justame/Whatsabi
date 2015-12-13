//Control points with hover state. When a dot is in :hover state the rest of dots with the same class ".dotSession####"
//will be also active as hover
//When a dot of this class is clicked, it will open the chat panel and scroll to the message that began the session which
//will has an id like "#begSession####"
$('*[class^="dotSession"]')
    .on('click', function () {
        var triggerButton = $('#chatPanelTrigger'),
            $this = $(this),
        //Get the correct class
            dotClass = $this.attr('class').match(/dotSession[0-9]/)[0],
            begId;

        begId = dotClass.replace("dot","#beg");

        //If panel is hidden, show
        if(!triggerButton.hasClass('active')){
            triggerButton.click();
        }

        //Scroll chat to the beginning message
        $('#chatMessages').animate({ //TODO: offset calculation
                scrollTop: $(begId).offset().top },
            500);

    })
    .on('mouseenter mouseleave', function () {
        var $this = $(this),
        //Get the correct class
            dotClass = '.' + $this.attr('class').match(/dotSession[0-9]/);

        //Toggle the class to all the dots
        $(dotClass).toggleClass('dotActive');
    });


//Popover trigger
$('.popover').prev('.button').on('click', function () {
    $(this).next('.popover').fadeToggle();
});




//Sliding panels
$('*[id$="Trigger"]').on('click', function () {
    var $this = $(this),
        id = $this.attr('id'),
        panelId = '#' + id.replace("Trigger","");

    $this.toggleClass('active');

    $(panelId)
        .animate({width:'toggle'})
        .children().fadeToggle()
        .find('.authorPanelDetails').slideUp();
});

$('#showKeywordsPanel').on('click', function () {
    $('#keywordsPanel').slideToggle();
});
$('#showAuthorsComparePanel').on('click', function () {
    $('#authorsComparePanel').slideToggle();
});

//Showing authors details panel
$('.authorPanel').on('click', function () {
    var $this = $(this);

    $this.siblings('.authorPanelDetails').slideToggle();
});

//Showing authors profiles
function paintingProfiles(){
    var pics = $('.authorProfilePic'),
        colors = ['#78E7BC','#CFF09E','#F44D53','#A8DBA8','#F29363','#78BD9A','#3D8686','#0B486B'];

    for(var i = 0;i < pics.length;i++){
        paintProfileIcon(pics[i], colors[i%8])
    }
}
function paintProfileIcon(eContainer, color){
    var canvas = Snap(eContainer),
        container = $(eContainer),
        bodyColor = color,
        backgroundColor = container.css('background-color'),
        w = container.css('width'),//container width
        b;//border of head

    w = eval(w.substring(0, w.length - 2));
    b = w/16;

    //printing the body
    canvas.ellipse(w/2,w+b,w/2-b,w/2).attr({
        fill: bodyColor
    });

    //Printing the head
    canvas.circle(w/2,w/2-b,w/4+b).attr({
        fill: bodyColor,
        stroke: backgroundColor,
        strokeWidth: b
    });
}

paintingProfiles();