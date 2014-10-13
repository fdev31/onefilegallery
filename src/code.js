" use strict "

var data = {};
var pass = '';
var page_size = 25;

var switch_page = function(nr) {
    $('#container').isotope({ filter: '.p'+nr });
    $('button').removeClass('current');
    $($('button').get(nr)).addClass('current');
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
                html.push('<div class="item p'+Math.floor(counter/page_size)+'" data-link="'+pass+'/'+d.f+'"><a href="'+pass+'/'+d.f+'"><img src="'+pass+'/'+d.t+'" ></img></a></div>');
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
                }, n*2*1000);
            }
        });

});

