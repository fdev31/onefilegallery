" use strict "

var data = {};
var pass = '';
var page_size = 25;
var cur_image = 0;

var switch_page = function(nr) {
    $('#container').isotope({ filter: '.p'+nr });
    $('button').removeClass('current');
    $($('button').get(nr)).addClass('current');
}

var _set_next_image = function(url) {
    setTimeout( function() {
        $('#next_projected').attr('src', url);
    }, 150);
}
var _set_image = function() {
    $('#projected').attr('src', pass + '/' + data[cur_image].f);
    var txt = data[cur_image].f.replace(/.*[/]/, '');
    txt += ' ('+(1+cur_image)+'/'+data.length+')';
    $('#projected_name').text( txt );
}

var view_image = function(obj, counter) {
    cur_image = counter;
    _set_image();
    $('#projector').removeClass('slide-down');
}

var next_image = function() {
    if (cur_image+1 < data.length) {
        cur_image++;
        _set_image();
        if (cur_image+1 < data.length) {
            _set_next_image(pass + '/' + data[cur_image+1].f);
        }
    }
}
var prev_image = function() {
    if (cur_image > 0) {
        cur_image--;
        _set_image();
        if (cur_image > 0) {
            _set_next_image(pass + '/' + data[cur_image-1].f);
        }
    }
}

$(function() {
    $('#container').isotope({itemSelector: '.item',   isFitWidth: true, filter:'.p0'});
    pass = prompt("Password:");
    $('#dl_ref').attr('href', pass+'/packages.zip');
    $.get('./'+pass+'/images.js')
        .done(function(res) {
            data = JSON.parse(res);
            var pages = $('#pages');
            for(var i=0; i<data.length; i=i+page_size) {
                var p=i/page_size;
                pages.append( $('<button onclick="switch_page('+p+')">&nbsp;'+(p+1)+'&nbsp;</button>') );
            };
            var cont = $('#container');
            var html = [];
            var d = {};
            var counter = 0;
            for (var i in data) {
                d = data[i];
                html.push('<div class="item p'+Math.floor(counter/page_size)+'" ><img class="tn" onclick="view_image(this, '+counter+')" src="'+pass+'/'+d.t+'" ></img></div>');
                counter++;
            };
            setTimeout( function() {
                cont.isotope('insert', $(html.join('')));
                $('button:first').addClass('current');
            }, 100);
            // ugly workaround of the death
            for (n=1;n<5;n++) {
                setTimeout( function() {
                    cont.isotope('arrange');
                }, n*2*100);
            }
        });

    $(document).keydown(function(e) {

        switch(e.which) {

            case 27: // escape
                $('#projector').addClass('slide-down');
                break;

            case 37: // left
                prev_image();
                break;

            case 38: // up
                prev_image();
                break;

            case 39: // right
                next_image();
                break;

            case 40: // down
                next_image();
                break;

            default: return; // exit this handler for other keys
        }
        e.preventDefault(); // prevent the default action (scroll / move caret)

});

});

