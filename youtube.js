
VideoDB = new Mongo.Collection('videos');


if(Meteor.isClient){
    // All Helpers
    Template.player.helpers({
        'HelperStatus': function(){
            return Session.get('playerStatus') || 'waiting';
        },
        'OnlineHelper': function(){
            return Session.get('OnlineError') || "";
        }

    });

    Template.player.events({
        'click .ready': function( event ){
            // READY BUTTON CLICKED

            event.preventDefault();
            console.log(Session.get('watching'));
            var getVideo = VideoDB.findOne({
                uniqueURL: Session.get('watching')
            });

            if(getVideo){
                var readyList = getVideo.ready;
                var FriendName = this;

                readyList.push(FriendName);
                $("#"+FriendName).hide();
            }

        },
        'submit form': function(event){
            // GO BUTTON CLICKED

            event.preventDefault();
            var getVideo = VideoDB.findOne({
                uniqueURL: Session.get('watching')
            });

            if(getVideo){
                var list = getVideo.connected;
                var FriendName = event.target.FriendName.value;

                Session.set('userName', FriendName);

                for(var i = 0; i < list.length; i++){
                    if(list[i] == FriendName){
                        Session.set('OnlineError', 'Name already taken. Choose another one.');
                        return;
                    }
                }


                Session.set('OnlineError', '');
                list.push(FriendName);

                VideoDB.update({_id: getVideo._id}, {$set: {connected: list, status: 'READY!'}});
                //console.log(getVideo);
            }
        }
    });


    // All events
    Template.index.events({
        'click #button': function(){
            Session.set('selectedPlayer', $('#url').val());
            //url = $('#url').val();
            //console.log(url);
        },
        'submit form': function(event){
            // INITIAL SUBMIT
            event.preventDefault();

            var regex = /[?&]([^=#]+)=([^&#]*)/g,
                url = event.target.url.value,
                params = {},
                match;
            while(match = regex.exec(url)) {
                params[match[1]] = match[2];
            }

            var uniqueURL = Math.random().toString(36).slice(2);
            var videoURL = params['v'];
            var name = event.target.name.value;

            Session.set('userName', name);

            VideoDB.insert({
                createdBy: name,
                createdAt: new Date(),
                youtubeURL: videoURL,
                uniqueURL: uniqueURL,
                status: 'Waiting',
                connected: [],
                ready: []
            });

            Router.go('/watch/'+uniqueURL);
        }
    });

    // All Methods
    Meteor.methods({

    });

    LoadVideo = function (url){
        // YouTube API will call onYouTubeIframeAPIReady() when API ready.
        // Make sure it's a global variable.
        onYouTubeIframeAPIReady = function () {

            // New Video Player, the first argument is the id of the div.
            // Make sure it's a global variable.
            player = new YT.Player("player", {

                height: "400",
                width: "600",

                videoId: url,

                // Events like ready, state change,
                events: {

                    onReady: function (event) {

                        // Play video when player ready.
                        //event.target.playVideo();
                    }
                }
            });
        };
        YT.load();
    }


    // Routes
    Router.route('/watch/:uniqueURL', function () {
        // HOUSEKEEPING
        Session.set('OnlineError', '');


        var uniqueURL = this.params.uniqueURL;

        var videoInfo = VideoDB.findOne({
            uniqueURL: uniqueURL
        });
        Session.set('watching', uniqueURL);
        if(videoInfo){
            LoadVideo(videoInfo.youtubeURL);

            //UserSession.set('watching', 'someone');
            //console.log(UserSession.list());

            if(Session.get('watching')){

            }
        }

        this.render('player', {data: videoInfo});
        console.log(Session.get('userName'));


    });

    Router.route('/', function () {
        document.body.innerHTML = '';
        this.render('index');
    })
    // Routes End
}

if(Meteor.isServer) {

}