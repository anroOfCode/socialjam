// main.js
// Brian Ford, btford@umich.edu
// 03/25/11

/*jslint white: true, onevar: true, undef: true, newcap: true, nomen: true, regexp: true, plusplus: true, bitwise: true, browser: true, maxerr: 50, indent: 4 */

/*globals $, Vex, console, Audio, Notes, window*/

// Social jam config

//TODO: put this in a closure
var canvas = $("#can")[0];
var broCanvas = $("#broCan")[0];

var myNotes = new Notes(canvas);
var broNotes = new Notes(broCanvas);

//playNice(niceNotes);

// get user id from query string

var query = window.location.search.slice(1, window.location.search.length);

var querySep = query.indexOf("&");

var userId = parseInt(query.slice(0, querySep), 10);
var sessionId = parseInt(query.slice(querySep + 1), 10);
var timestamp; // set by init()

var sendMyMusic = function () {
    "use strict";
    
    var json = {
        "session": sessionId,
        "user": userId,
        "timestamp": timestamp,
        "content": myNotes.getNotes(),
        "instrument": myNotes.getInstrument()
    };

    $.ajax({
        url: "http://andrewbrobinson.com/sj/server.php?action=push",
        type: "POST",
        data: json,
        success: function (data) {
            $('#result').html("<pre>" + data + "</pre>");
            //alert('Load was performed.');
        }
    });
};

var getMusic = function () {
    "use strict";
    
    var json = {
        "session": sessionId,
        "user": userId,
        "timestamp": timestamp
    };

    $.ajax({
        url: "http://andrewbrobinson.com/sj/server.php?action=pull",
        type: "POST",
        data: json,
        success: function (data) {
            
            if (data) {
                var parsedData = $.parseJSON(data), i;
                console.log(parsedData);
                
                if (typeof parsedData.content === "string") {
                    parsedData.content = [];
                }
                
                for (i = 0; i < parsedData.content.length; i += 1) {
                    parsedData.content[i].duration =
                        parseInt(parsedData.content[i].duration, 10);
                }

                timestamp = parsedData.timestamp;
                broNotes.setNotes(parsedData.content);
                broNotes.setInstrument(parsedData.instrument || "piano");
            }
            
            setTimeout(getMusic, 100);
        }
    });
};

var initMusic = function () {
    "use strict";
    var json = {
        "session": sessionId
    };
    
    $.ajax({
        url: "http://andrewbrobinson.com/sj/server.php?action=init",
        type: "POST",
        data: json,
        success: function (data) {
            var parsedData = $.parseJSON(data), i;
            
            console.log(parsedData.data[0]);
            
            if (typeof parsedData.data[0].content === "string") {
                parsedData.data[0].content = [];
            }
            
            if (typeof parsedData.data[1].content === "string") {
                parsedData.data[1].content = [];
            }
            
            // parse strings to ints
            for (i = 0; i < parsedData.data[0].content.length; i += 1) {
                parsedData.data[0].content[i].duration =
                    parseInt(parsedData.data[0].content[i].duration, 10);
            }
            
            for (i = 0; i < parsedData.data[1].content.length; i += 1) {
                parsedData.data[1].content[i].duration =
                    parseInt(parsedData.data[1].content[i].duration, 10);
            }
            
            if (parseInt(parsedData.data[0].userid, 10) === userId) {
                myNotes.setNotes(parsedData.data[0].content);
                myNotes.setInstrument(parsedData.data[0].instrument);
                broNotes.setNotes(parsedData.data[1].content);
                broNotes.setInstrument(parsedData.data[1].instrument);
            } else {
                myNotes.setNotes(parsedData.data[1].content);
                myNotes.setInstrument(parsedData.data[1].instrument);
                broNotes.setNotes(parsedData.data[0].content);
                broNotes.setInstrument(parsedData.data[0].instrument);
            }
            
            timestamp = parsedData.timestamp;
            
            getMusic();
        }
    });
};

// Event Handlers
///////////////////////////////////////////////////////////////////////////////
$("#play").click(function () {
    "use strict";
    myNotes.play();
    broNotes.play();
});

$("#clear").click(function () {
    "use strict";
    myNotes.clear();
    sendMyMusic();
});

$("#editing > span").click(function () {
    "use strict";
    myNotes.addNote({key: this.id, duration: 4});
    sendMyMusic();
});

$("#instrument").change(function () {
    "use strict";
    myNotes.setInstrument(this.value);
});

// start the magic
initMusic();
