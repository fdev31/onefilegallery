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

var _set_left_image = function(url) {
    setTimeout( function() {
        $('#prev_projected').attr('src', url);
    }, 550);
}
var _set_right_image = function(url) {
    setTimeout( function() {
        $('#next_projected').attr('src', url);
    }, 500);
}
var _set_image = function() {
    _image_setter = 0;
    $('#projected').attr('src', pass + '/' + data[cur_image].f);
    var txt = data[cur_image].f.replace(/.*[/]/, '');
    txt += ' ('+(1+cur_image)+'/'+data.length+')';
    $('#projected_name').text( txt );
}

var slideshow_id = false;

var _start_show = function() {
    var slideshow_delay = Math.floor( parseFloat( $('#delay').val() )*1000 );
    slideshow_id = setTimeout( next_image, slideshow_delay );
}
var slideshow_button = function() {
    if (slideshow_id) {
        clearTimeout(slideshow_id);
        slideshow_id = false;
        $('#slide_button').html('&#x25B6;');
    } else {
        $('#slide_button').html('&#x25FC;');
        next_image();
        slideshow_id = 1;
    }
}

var _image_setter = 0;

/* only called when a click on the thumbnail image occurs */
var view_image = function(obj, counter) {
    cur_image = counter;
    if ( $('#projector').hasClass('slide-down') ) {
        $('#projector').removeClass('slide-down');
        $('#projected').attr('src', '');
    }
    if (!!_image_setter) {
        clearTimeout(_image_setter )
    }
    _image_setter = setTimeout( _set_image, 250);
}

var next_image = function(user_action) {
    var user_action = user_action || false;
    if (user_action && !!slideshow_id) {
        cur_image ++;
    } else {
        if (cur_image+1 < data.length) {
            _set_left_image(pass + '/' + data[cur_image].f);
            $('#next_button').addClass('busy');
            setTimeout( function() {
                cur_image++;
                _set_image();
                if (cur_image+1 < data.length) {
                    _set_right_image(pass + '/' + data[cur_image+1].f);
                }
            }, 10);
        } else {
            if (!! slideshow_id) {
                slideshow_button();
            }
        }
    }
}

var prev_image = function(user_action) {
    var user_action = user_action || false;
    if (user_action && !!slideshow_id) {
        cur_image --;
    } else {
        if (cur_image > 0) {
            $('#prev_button').addClass('busy');
            setTimeout( function() {
                _set_right_image(pass + '/' + data[cur_image].f);
                cur_image--;
                if (cur_image > 0) {
                    _set_left_image(pass + '/' + data[cur_image-1].f);
                }
                _set_image();
            } , 10);
        }
    }
}

var close_projector = function() {
    $('#projector').addClass('slide-down');
    $('#projected').addClass('loading');
    if(slideshow_id) slideshow_button();
}

$(function() {
    $('#container').isotope({itemSelector: '.item',   isFitWidth: true, filter:'.p0'});
    pass = prompt("Password:");
    $('#dl_ref').attr('href', pass+'/package.zip');
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

    $('#projected').on('load', function(e) {
        $('button.busy').removeClass('busy');
        $('#projected').removeClass('loading');
        if(!!slideshow_id) {
            _start_show();
        }
    });
    $(document).keydown(function(e) {

        switch(e.which) {

            case 27: // escape
                if (!!slideshow_id) {
                    slideshow_button();
                } else {
                    close_projector();
                }
                break;

            case 37: // left
                prev_image(true);
                break;

            case 38: // up
                prev_image(true);
                break;

            case 39: // right
                next_image(true);
                break;

            case 40: // down
                next_image(true);
                break;

            default: return;
        }
        e.preventDefault();

    });

});

