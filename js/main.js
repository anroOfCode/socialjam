// main.js
// Brian Ford, btford@umich.edu
// 03/25/11

/*jslint white: true, onevar: true, undef: true, newcap: true, nomen: true, regexp: true, plusplus: true, bitwise: true, browser: true, maxerr: 50, indent: 4 */

/*globals $, Vex, console, Audio*/

// Social jam config
var SJM = {
    'width': 600
};

//TODO: put this in a closure
var canvas = $("#can")[0];
var durationIntToStr = function (num) {
    "use strict";
    if (num === 1) {
        return "w";
    } else if (num === 2) {
        return "h";
    } else if (num === 3) {
        return "hd";
    } else if (num === 4) {
        return "q";
    } else {
        return String(num);
    }
};

var makeRenderableNotes = function (notes) {
    "use strict";
    var ren = [], someKey, someDuration, restDuration, totalDuration = 0, i;
    
    for (i = 0; i < notes.length; i += 1) {
        
        someKey = notes[i].key;
        someDuration = notes[i].duration;
        
        console.log(someDuration);
        
        totalDuration += someDuration / 4;
        
        if (someKey === "rest") {
            someKey = "b/4";
            someDuration = durationIntToStr(someDuration) + "r";
        } else {
            someKey = someKey + "/4";
            someDuration = durationIntToStr(someDuration);
        }
        
        ren.push({key: someKey, duration: someDuration});
    }
    
    console.log(totalDuration);
    
    if (totalDuration < 4) {
        restDuration = 4 - totalDuration;
        console.log(restDuration);
        
        if (restDuration === 3) {
            ren.push({key: "b/4", duration: "qr"});
            ren.push({key: "b/4", duration: "hr"});
        } else {
            ren.push({key: "b/4", duration: (durationIntToStr(4 / restDuration) + "r")});
        }
    }
    
    return ren;
};

var render = function (param) {
    "use strict";
    
    var renderer, ctx, stave, notes = [], i, voice, formatter;
    
    renderer = new Vex.Flow.Renderer(canvas, Vex.Flow.Renderer.Backends.CANVAS);

    ctx = renderer.getContext();
    stave = new Vex.Flow.Stave(10, 0, SJM.width);
    
    ctx.clear();
    stave.addClef("treble").setContext(ctx).draw();

    for (i = 0; i < param.length; i += 1) {
        notes.push(new Vex.Flow.StaveNote({ keys: [param[i].key], duration: param[i].duration }));
    }
    // Create a voice in 4/4
    voice = new Vex.Flow.Voice({
        num_beats: 4,
        beat_value: 4,
        resolution: Vex.Flow.RESOLUTION
    });

    // Add notes to voice
    voice.clearTickables(notes);
    voice.addTickables(notes);

    // Format and justify the notes to 500 pixels
    formatter = new Vex.Flow.Formatter().joinVoices([voice]).format([voice], SJM.width);

    // Render voice
    voice.draw(ctx, stave);
};

var renderNice = function (param) {
    "use strict";
    return render(makeRenderableNotes(param));
};

var playNice = function (n) {
    "use strict";
    
    var currentNote = 0, notes, playNote, letters;
    
    letters = ["A", "B", "C", "D"];
    
    notes = n;
    
    playNote = function () {
        if (currentNote >= notes.length) {
            return;
        } else {
            if (notes[currentNote].key !== "rest") {
                var sound = new Audio("res/piano/q/q" + letters[currentNote] + "1.wav");
                sound.play();
            }
            setTimeout(playNote, 300 * 4 / notes[currentNote].duration);
            currentNote += 1;
        }
    };
    playNote();
};

var niceNotes = [
    { key: "c", duration: 4},
    { key: "c", duration: 4},
    { key: "c", duration: 4},
    { key: "c", duration: 4}
];

renderNice(niceNotes);
playNice(niceNotes);


