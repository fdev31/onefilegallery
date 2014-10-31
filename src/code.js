" use strict "

var data = {};
var pass = '';
var page_size = 25;
var cur_image = 0;
var isotope = 0;

var DC = function(query, klass) {
    var q = document.querySelector(query);
    if (q) 
        q.classList.remove(klass);
};
var DCA = function(query, klass) {
    var q = document.querySelectorAll(query);
    for (var i=0; i<q.length; i++) {
        q[i].classList.remove(klass);
    }
};
var AC = function(query, klass) {
    var q = document.querySelectorAll(query);
    for (var i=0; i<q.length; i++) {
        q[i].classList.add(klass);
    }
};

var switch_page = function(nr) {
    isotope.arrange({ filter: '.p'+nr });
    DCA('button', 'current');
    document.querySelectorAll('button')[nr].classList.add('current');
}

var _set_left_image = function(url) {
    setTimeout( function() {
        document.querySelector('#prev_projected').src = url;
    }, 550);
}
var _set_right_image = function(url) {
    setTimeout( function() {
        document.querySelector('#next_projected').src = url;
    }, 500);
}
var _set_image = function() {
    _image_setter = 0;
    document.querySelector('#projected').src = pass + '/' + data[cur_image].f;
    var txt = data[cur_image].f.replace(/.*[/]/, '');
    txt += ' ('+(1+cur_image)+'/'+data.length+')';
    document.querySelector('#projected_name').textContent = txt;
}

var slideshow_id = false;

var _start_show = function() {
    var slideshow_delay = Math.floor( parseFloat( document.querySelector('#delay').value )*1000 );
    slideshow_id = setTimeout( next_image, slideshow_delay );
}
var slideshow_button = function() {
    if (slideshow_id) {
        clearTimeout(slideshow_id);
        slideshow_id = false;
        document.querySelector('#slide_button').innerHTML = '&#x25B6;';
    } else {
        document.querySelector('#slide_button').innerHTML = '&#x25FC;';
        next_image();
        slideshow_id = 1;
    }
}

var _image_setter = 0;

/* only called when a click on the thumbnail image occurs */
var view_image = function(obj, counter) {
    cur_image = counter;
    if ( document.querySelector('#projector').classList.contains('slide-down') ) {
        document.querySelector('div#container').style.visibility = 'hidden';
        DC('#projector', 'slide-down');
        document.querySelector('#projected').src = '';
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
            document.querySelector('#next_button').classList.add('busy');
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
            AC('#prev_button', 'busy');
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
    AC('#projector','slide-down');
    document.querySelector('div#container').style.visibility = 'visible';
    AC('#projected','loading');
    if(slideshow_id) slideshow_button();
}

document.addEventListener('DOMContentLoaded', function() {
    var container = document.querySelector('#container');
    isotope = new Isotope( container, {itemSelector: '.item',   isFitWidth: true, filter:'.p0'});
    pass = prompt("Password:");

    document.querySelector('#dl_ref').attributes.href = pass+'/package.zip';

    var xhr = new XMLHttpRequest();
    xhr.open('GET', './'+pass+'/images.js', true);
    xhr.overrideMimeType('text/javascript; charset=utf-8');

    xhr.onreadystatechange = function(e) {
        if (this.readyState == 4 && this.status == 200) {
            data = JSON.parse(this.responseText);
            var pages = document.querySelector('#pages');

            for(var i=0; i<data.length; i=i+page_size) {
                var p=i/page_size;
                var btn = document.createElement('button');
                btn.onclick = function() {
                    var page = p;
                    return function() {switch_page(page)};
                }();
                btn.innerHTML = '&nbsp;'+p+'&nbsp;';
                pages.appendChild( btn );
            };
            var html = [];
            var d = {};
            var counter = 0;
            for (var i in data) {
                d = data[i];
                html.push('<div class="item p'+Math.floor(counter/page_size)+'" ><img class="tn" onclick="view_image(this, '+counter+')" src="'+pass+'/'+d.t+'" ></img></div>');
                counter++;
            };
            setTimeout( function() {
                var e = document.createElement('div');
                e.innerHTML = html.join('');
                isotope.insert(e);
                document.querySelector('button').classList.add('current');
            }, 100);
            // ugly workaround of the death
            for (n=1;n<5;n++) {
                setTimeout( function() {
                    isotope.arrange();
                }, n*2*100);
            }
        }
    };

    xhr.send(null);

    document.querySelector('#projected').onload = function(e) {
        DC('button.busy', 'busy');
        DC('#projected', 'loading');
        if(!!slideshow_id) {
            _start_show();
        }
    };
    document.onkeydown = function(e) {

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

    };

});

