
var app = {
    initialize: function() {
        this.bindEvents();
    },
    // Bind Event Listeners
    //
    // Bind any events that are required on startup. Common events are:
    // 'load', 'deviceready', 'offline', and 'online'.
    bindEvents: function() {
        document.addEventListener('deviceready', this.onDeviceReady, false);
    },
    resetPlayer: function(audioUrl) {
        this.audioURL = audioUrl;
        this.player = new Audio(this.audioURL);
    },
    setVariables: function() {
        this.resetPlayer('http://10.1.12.185/my-way.mp3');
        this.isPlaying = false;
        this.readyStateInterval = null;
        this.playButton = document.getElementById('playbutton');
        this.stopButton = document.getElementById('stopbutton');
        this.textPosition = document.getElementById('textposition');
    },
    // deviceready Event Handler
    //
    // The scope of 'this' is the event. In order to call the 'receivedEvent'
    // function, we must explicitly call 'app.receivedEvent(...);'w
    onDeviceReady: function() {
        app.receivedEvent('deviceready');
        app.setVariables();
    },
    // Update DOM on a Received Event
    receivedEvent: function(id) {
        var parentElement = document.getElementById(id);
        var listeningElement = parentElement.querySelector('.listening');
        var receivedElement = parentElement.querySelector('.received');
        listeningElement.setAttribute('style', 'display:none;');
        receivedElement.setAttribute('style', 'display:block;');
        console.log('Received Event: ' + id);
    },
    buttonPlayPressed: function() {
        if (this.isPlaying) {
            this.pause();
        }
        else {
            this.play();
        }
    },
    play: function () {
        this.player.play();
        app.changeState('play');
        this.readyStateInterval = setInterval(function () {
            if (app.player.readyState <= 2) {
                app.textPosition.innerHTML = 'loading...';
            }
        }, 1000);
        this.player.addEventListener("timeupdate", function () {
            var s = parseInt(app.player.currentTime % 60);
            var m = parseInt((app.player.currentTime / 60) % 60);
            var h = parseInt(((app.player.currentTime / 60) / 60) % 60);
            if (app.isPlaying && app.player.currentTime > 0) {
                app.textPosition.innerHTML = pad2(h) + ':' + pad2(m) + ':' + pad2(s);
            }
        }, false);
        this.player.addEventListener("error", function () {
            console.log('this.player ERROR');
        }, false);
        this.player.addEventListener("canplay", function () {
            console.log('this.player CAN PLAY');
        }, false);
        this.player.addEventListener("waiting", function () {
            app.changeState('pause');
        }, false);
        this.player.addEventListener("playing", function () {
            app.changeState('play');
        }, false);
        this.player.addEventListener("ended", function () {
            app.stop();
            if (window.confirm('Streaming failed. Possibly due to a network error. Retry?')) {
                onConfirmRetry();
            }
        }, false);
    },
    pause: function () {
        this.changeState('pause');
        clearInterval(this.readyStateInterval);
        this.player.pause();
    },
    stop: function () {
        this.changeState('stop');
        clearInterval(this.readyStateInterval);
        this.player.pause();
        this.textPosition.innerHTML = '';
        this.resetPlayer('http://10.1.12.185/my-way.mp3');
    },
    changeState: function(state) {
        this.isPlaying = state == 'play';
        this.playButton.innerHTML = '<img src="file:///android_res/drawable/ic_button_play.png" />';
        if (state == 'play') {
            this.playButton.innerHTML = '<img src="file:///android_res/drawable/ic_button_pause.png" />';
        }
    }
};

app.initialize();

function onError(error) {
    console.log(error.message);
}

function onConfirmRetry(button) {
    if (button == 1) {
        app.play();
    }
}

function pad2(number) {
    return (number < 10 ? '0' : '') + number
}
