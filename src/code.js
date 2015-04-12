" use strict "

var data = {};
var pass = '';
var page_size = 25;
var cur_image = 0;
var isotope = 0;
var popup_delay = 3000; // 3s delay for popups

var _popups = [];
var _cur_popup = 0;
var expertise_level = 0; // user heuristic UI experience

function display_popup (content, opts) {
    var opts = opts || {};
    var flush = !! opts.flush;

    if (_cur_popup != 0 && !flush) {
        if ( _popups.length > 0 && content != _popups[_popups.length-1][0] )
            _popups.push([content, opts])
    } else {
        var o = QS('#popup');
        o.innerHTML = content;
        o.classList.remove("slide-down");
        if (!!!opts.stay) {
            _cur_popup = setTimeout(remove_popup, popup_delay);
        }
        if( !!opts.onshow )
            opts.onshow();
    }
}

function remove_popup() {
    var o = QS('#popup');
    clearTimeout(_cur_popup);
    _cur_popup = 0;
    if (_popups.length != 0) {
        var content = _popups.pop();
        display_popup( content[0], content[1] );
    } else {
        o.classList.add('slide-down');
    }
}

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

var QSA = function(query) {
    return document.querySelectorAll(query);
};

var QS = function(query) {
    return document.querySelector(query);
};

var CE = function(tag) {
    return document.createElement(tag);
}

var switch_page = function(nr) {
    isotope.arrange({ filter: '.p'+nr });
    DCA('button', 'current');
    QSA('button')[nr].classList.add('current');
}

var _set_left_image = function(url) {
    setTimeout( function() {
        QS('#prev_projected').src = url;
    }, 550);
}
var _set_right_image = function(url) {
    setTimeout( function() {
        QS('#next_projected').src = url;
    }, 500);
}
var _set_image = function() {
    _image_setter = 0;
    QS('#projected').src = pass + '/' + data[cur_image].f;
    var txt = data[cur_image].f.replace(/.*[/]/, '');
    txt += ' ('+(1+cur_image)+'/'+data.length+')';
    QS('#projected_name').textContent = txt;
}

var slideshow_id = false;

var _start_show = function() {
    var slideshow_delay = Math.floor( parseFloat( QS('#delay').value )*1000 );
    slideshow_id = setTimeout( next_image, slideshow_delay );
}
var _slideshow_pressed = 0;

function show(list) {
    for (var i=0; i < list.length; i++) {
        QS(list[i]).style.visibility = "";
    }
}
function hide(list) {
    for (var i=0; i < list.length; i++) {
        QS(list[i]).style.visibility = "hidden";
    }
}
var slideshow_button = function() {
    if (_slideshow_pressed) {
        clearTimeout(_slideshow_pressed);
        _slideshow_pressed = 0;
    }
    var p = QS('#projected');
    if (slideshow_id) {
        clearTimeout(slideshow_id);
        slideshow_id = false;
        show(['#projected_name', '#next_button', '#prev_button']);
        QS('#slide_button').classList.remove('icon_stop');
        QS('#slide_button').classList.add('icon_play');

        p.style.transform = 'translate(0, 0) scale(1.0)';
        setTimeout(_set_image, 300);
    } else {
        hide(['#projected_name', '#next_button', '#prev_button']);
        QS('#slide_button').classList.remove('icon_play');
        QS('#slide_button').classList.add('icon_stop');
        slideshow_id = 1;
        _slideshow_pressed = setTimeout(next_image, 1300);
        p.style.transform = 'translate(0, 0) scale(1.1)';
        setTimeout( function() {
//            var o = (p.offsetTop / 2);
            p.style.transform = 'translate(0, -16px) scale(1.1)';
        }, 300);
    }
}

var _image_setter = 0;

/* only called when a click on the thumbnail image occurs */
var view_image = function(obj, counter) {
    if (expertise_level == 0) {
        display_popup('Click on the "play" icon to start slideshow, you can use ARROWS and ESCAPE here');
        expertise_level ++;
    }
    cur_image = counter;
    if ( QS('#projector').classList.contains('slide-down') ) {
        QS('div#container').style.visibility = 'hidden';
        DC('#projector', 'slide-down');
        QS('#projected').src = pass + '/' + data[cur_image].t;
    }
    if (!!_image_setter) {
        clearTimeout(_image_setter )
    }
    _image_setter = setTimeout( _set_image, 250);
}

var next_image = function(user_action) {
    var user_action = user_action || false;
    if (user_action && !!slideshow_id) {
        if (cur_image+1 < data.length)
            cur_image ++;
        slideshow_button();
    } else {
        if (cur_image+1 < data.length) {
            if (cur_image > 0)
                _set_left_image(pass + '/' + data[cur_image].f);
            QS('#next_button').classList.add('busy');
            setTimeout( function() {
                cur_image++;
                _set_image();
                if (cur_image+1 < data.length) {
                    _set_right_image(pass + '/' + data[cur_image+1].f);
                }
            }, 10);
        } else {
            if (!! slideshow_id) {
                _set_image();
                slideshow_button();
            } else {
                display_popup('<button id="replaybut" onclick="cur_image = -1; next_image()">Replay</button>');
            }
        }
    }
}

var prev_image = function(user_action) {
    var user_action = user_action || false;
    if ( !! QS('#replaybut') )
        remove_popup();
    if (user_action && !!slideshow_id) {
        if (cur_image > 0)
            cur_image --;
        slideshow_button();
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
    QS('div#container').style.visibility = 'visible';
    AC('#projected','loading');
    if(slideshow_id) slideshow_button();
}

function start_process() {
    var container = QS('#container');
    isotope = new Isotope( container, {itemSelector: '.item',   isFitWidth: true, filter:'.p0'});

    QS('#dl_ref').style.visibility = "hidden";
    QS('#dl_ref').setAttribute('href','./'+ pass+'/package.zip');

    var xhr = new XMLHttpRequest();
    xhr.open('GET', './'+pass+'/images.js', true);
    xhr.overrideMimeType('text/javascript; charset=utf-8');

    xhr.onreadystatechange = function(e) {
        if (this.readyState == 4 && this.status == 200) {
            data = JSON.parse(this.responseText);
            if (!!data.version) { /* only version 0 (flat) & v1 is supported */
                data = uncompress_resources(data);
            }
            var pages = QS('#pages #page_list');

            for(var i=0; i<data.length; i=i+page_size) {
                var p=i/page_size;
                var btn = CE('button');
                btn.onclick = function() {
                    var page = p;
                    return function() {switch_page(page)};
                }();
                btn.innerHTML = '&nbsp;'+(p+1)+'&nbsp;';
                pages.appendChild( btn );
            };
            var html = [];
            var d = {};
            var counter = 0;
            for (var i in data) {
                d = data[i];
                if(!!!d.s) {
                    var size = '';
                } else {
                    if(d.s > 1100000) {
                        var size ="&nbsp;" + (Math.floor(d.s / 1000)/1000.0) + " MB";
                    } else {
                        var size = "&nbsp;" + Math.floor(d.s / 1000) + " kB";
                    }
                }
                html.push('<div title="'+d.f+size+'" class="item p'+Math.floor(counter/page_size)+'" ><img class="tn" onclick="view_image(this, '+counter+')" src="'+pass+'/'+d.t+'" ></img></div>');
                counter++;
            };


            setTimeout( function() {
                var e = CE('div');
                e.innerHTML = html.join('');
                isotope.insert(e);
                if ( data.length > page_size )
                    QS('button').classList.add('current');
            }, 100);
            // ugly workaround of the death
            for (n=1;n<5;n++) {
                setTimeout( function() {
                    isotope.arrange();
                }, n*2*100);
            }

            QS('#dl_ref').style.visibility = "visible";
        } else if(this.readyState == 4) {
            display_popup("<h1>Error loading images</h1>Perhaps the code is incorrect.", {'flush': true});
            QS('#dl_ref').style.visibility = "hidden";
            change_code();
        }
    };

    xhr.send(null);

    QS('#projected').onload = function(e) {
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
    if (expertise_level == 0)
        display_popup('Welcome ! Click on an image to launch the viewer !');
}

function _start_bootstrap(code) {
    remove_popup();
    pass = code || QS("#codepopup input").value;
    start_process();
}

function change_code() {
    QS('#container').innerHTML = '';
    QS('#page_list').innerHTML = '';
    display_popup('<form action="#" onsubmit="_start_bootstrap(); return false;" id="codepopup" >Code: <input type="text" ></input></form>', {'stay': true,
                  onshow: function() { QS('#codepopup input').focus() }
    });
}


function uncompress_resources(keys_values_array) {
/*
 * IN:  { 'c': ['link', 'age'], 'r': [ ['toto', 1], ['tata', 4], ['titi', 42] ] }
 *
 * OUT: [ {'link': 'toto', 'age': 1}, {'name': 'tata', 'age': 4}, {'name': 'titi', 'age': 42} ]
 */
    var keys = keys_values_array.c;
    var list_of_values = keys_values_array.r;
    var ret = [];

    for (var i=0; i<list_of_values.length; i++) {
        var values = list_of_values[i];
        var item = {};
        for (var pid=0; pid<keys.length; pid++) {
            item[ keys[pid] ] = values[pid];
        }
        ret.push( item );
    }
    return ret;
};


var default_configuration = {}

document.addEventListener('DOMContentLoaded', function() {

  /* set configuration from query string <URL>#key=value[,key2=value2,...]*/
  var options = document.location.href.match('.*#(.*)');

  if(!!options) {
      options = options[1].split(/ *,/);
      var tmp=null;
      for(var i=0; i<options.length; i++) {
          tmp = options[i].split(/=/);
          default_configuration[tmp[0]] = tmp[1]
      }
  }
  /* Start automatically or ask the user for a code */
  if(!!!default_configuration.code) {
      display_popup('<form action="#" onsubmit="_start_bootstrap(); return false;" id="codepopup" >Code: <input type="text" ></input></form>', {'stay': true});
      QS('#codepopup input').focus();
  } else {
      _start_bootstrap(default_configuration.code);
  }

//    display_popup('Welcome ! Click on an image to launch the viewer !');

});

