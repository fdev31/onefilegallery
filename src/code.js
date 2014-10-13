$(function() {
    $('#container').isotope({itemSelector: '.item',   isFitWidth: true});
    var pass = prompt("Password:");
    $('#dl_ref').attr('href', pass+'/packages.zip');
    $.get('./'+pass+'/images.js')
        .done(function(res) {
            var data = JSON.parse(res);
            var cont = $('#container');
            var html = [];
            var d = {};
            for (var i in data) {
                d = data[i];
                html.push('<div class="item" data-link="'+pass+'/'+d.f+'"><a href="'+pass+'/'+d.f+'"><img src="'+pass+'/'+d.t+'" ></img></a></div>');
            };
            setTimeout( function() {
                cont.isotope('insert', $(html.join('')));
            }, 100);
            setTimeout( function() {
                cont.isotope('arrange');
            }, 2000);
        });

});

