'use strict';

// register resolved addresses to card
function register_address(jElem, addresses, defer) {
    // append result
    var group = jElem.find('.list-group');
    $.each(addresses, function (i, addr) {
        var badge = $('<span></span>')
            .addClass('status badge badge-secondary')
            .text(gettext('Unknown'))
            .data('address', addr);

        var message = $('<small></small>')
            .addClass('message');

        var item = $('<li></li>')
            .addClass('list-group-item')
            .append(badge)
            .append(addr)
            .append(message);

        group.append(item);
    });

    // finalize
    jElem.find('.card-body').remove();
    jElem.find('.list-group').show();
    jElem.data('resolved', true);
    defer.resolve();
}

// resolve host on initialize
var initialize_events = [];
$('.card').each(function (idx, elem) {
    var jElem = $(elem);
    var hostname = jElem.data('hostname');
    var defer = $.Deferred();
    initialize_events.push(defer);

    if (hostname.match(/\d+\.\d+\.\d+\.\d+/)) {
        register_address(jElem, [hostname], defer);
        return;
    }

    $.get('/api/resolve/', { host: hostname })
        .done(function (data) {
            register_address(jElem, data.address, defer)
        })
        .fail(function (resp) {
            jElem
                .addClass('text-white bg-danger')
                .find('.card-body')
                .text(gettext('Failed to resolve'));
            console.log('Failed to query ' + hostname);
            console.log(resp.responseJSON);
        });
});

// start query
$.when.apply($, initialize_events).done(function () {
    var next_query_time = new Date();
    setInterval(function () {
        var now = new Date();
        var diff_time = next_query_time.getTime() - now.getTime();
        if (diff_time > 0) {
            $('#current-time').text(now);

            var fmts = gettext('%s (%s seconds later)');
            var msg = interpolate(fmts, [next_query_time, Math.ceil(diff_time / 1000)]);
            $('#next-query').text(msg);

            return;
        }

        // update query time
        next_query_time = new Date(now.getTime() + query_interval * 1000);
        $('#last-query').text(now);
        $('#next-query').text('--');

        // start query
        $('.status').each(function (idx, elem) {
            var jElem = $(elem);
            jElem.removeClass()
                .addClass('status badge badge-warning')
                .text(gettext('Checking'));
            jElem.parents('li')
                .children('small')
                .text();

            var address = jElem.data('address');
            var port = jElem.parents('.card').data('port');

            $.get('/api/telnet/', { host: address, port: port, timeout: timeout })
                .done(function (data) {
                    jElem.removeClass()
                        .addClass('status badge badge-success')
                        .text(gettext('Alive'))
                })
                .fail(function (resp) {
                    jElem.removeClass()
                        .addClass('status badge badge-danger')
                        .text(gettext('Error'));
                    jElem.parents('li')
                        .children('small')
                        .text(resp.responseJSON.reason);
                    console.log('Failed to query ' + address);
                    console.log(resp);
                });;

        });

    }, 1000);
});