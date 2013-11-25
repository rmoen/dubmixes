
// socket.io specific code
var socket = io.connect();
$(function () {
socket.on('connect', function () {
	$('#chat').addClass('connected');
});

socket.on('play', function (playThis) {
	//place playthis code into playing
	$('#playing').empty().append(playThis.playing);
});

socket.on('announcement', function (msg) {
	$('#lines').append($('<p>').append($('<em>').text(msg)));
});

socket.on('nicknames', function (nicknames) {
	$('#nicknames').empty().append($('<span>Online: </span>'));
	for (var i in nicknames) {
		$('#nicknames').append($('<div>').text(nicknames[i]));
	}
});

socket.on('user message', message);

socket.on('reconnect', function () {
	$('#lines').remove();
	message('System', 'Reconnected to the server');
});

socket.on('reconnecting', function () {
	message('System', 'Attempting to re-connect to the server');
});

socket.on('error', function (e) {
	message('System', e ? e : 'A unknown error occurred');
});

function message (from, msg) {
	$('#lines').append($('<p>').append($('<b>').text(from), msg));
}

	// dom manipulation

	var groupsCache = null,
		playlistsCache = null;

	/* LOAD GROUPS */
	
	function loadGroups(){
//		SC.get("/groups.json", {limit: 2000}, function(groups){
		SC.get("/groups.json", {limit: 2000}, function(groups){
			var $group;
			var $playsurface = $('#playsurface');
			
			//build home page interface
			$('#playcontrols')
				.empty()
				.append(
					$('<button>').text('Playlists').attr({'id': 'playlists-btn', 'class': 'float-right'})
				).append(
					$('<div>').attr('id', 'ajax-loader')
				).append(
					$('<span>').text('Groups')
				);
				
			$playsurface.empty();
			//$playsurface.append($('<h3>').text('Groups'));
			for(var i =0;i<groups.length; i++) {
				if(groups[i].name) {
					$group = $('<div>')
						.attr('class', 'sc-group')
						.append(					
							$('<img />').attr({'src': groups[i].artwork_url, 'class': 'thumb-right'})
						).append(
							$('<div>').text(groups[i].name.substring(0, 60))
						).append(
							$('<p>').text(groups[i].short_description.substring(0, 60)) // only 60 characters 
						).append(
							$('<span>').attr('class', 'scgroup-id').text(groups[i].id)
						).append(
							$('<span>').attr('class', 'scgroup-name').text(groups[i].name)
						).append(
							$('<br />').attr('class', 'clear')	
						);
					$playsurface.append($group);
				}
			}
			//cache groups
			groupsCache = $playsurface.html();
		});
	}
	
	/* LOAD PLAYLISTS */
	
	function loadPlaylists() {
		//https://api.soundcloud.com/
		SC.get("/playlists.json", {limit: 2000}, function(playlists){
			var $playlist;
			var $playsurface = $('#playsurface');
			
			//build home page interface
			$('#playcontrols')
				.empty()
				.append(
					$('<button>').text('Groups').attr({'id': 'groups-btn', 'class': 'float-right'})
				).append(
					$('<div>').attr('id', 'ajax-loader')
				).append(
					$('<span>').text('Playlists')
				);
				
			$playsurface.empty();
			//$playsurface.append($('<h3>').text('Groups'));
//			console.log( playlists );
			for(var i =0;i<playlists.length; i++) {
				if(playlists[i].title.length > 0) {
					$playlist = $('<div>')
						.attr('class', 'sc-playlist')
						.append(					
							$('<img />').attr({'src': playlists[i].artwork_url, 'class': 'thumb-right'})
						).append(
							$('<div>').text(playlists[i].title.substring(0, 60))
						).append(
							$('<p>').text(playlists[i].description.substring(0, 60)) // only 60 characters 
						).append(
							$('<span>').attr('class', 'scplaylist-id').text(playlists[i].id)
						).append(
							$('<span>').attr('class', 'scplaylist-title').text(playlists[i].title)
						).append(
							$('<br />').attr('class', 'clear')	
						);
					$playsurface.append($playlist);
				}
			} 
			//cache playlists
			playlistsCache = $playsurface.html();
		});
	
	}
	
	
	
	function playTrack (track, user_id){
		SC.oEmbed( track, {auto_play: true}, function(oembed){	
			console.log("oEmbed response: ",oembed );
			var out	= $(oembed.html).data('userid', user_id);
			//var playThis = $('#playing').empty().append(out);
			var playThis = {
				'groups': groupsCache,
				'playing': oembed.html
			};
			//console.log('now emitting', playThis);
			socket.emit('play', playThis);
			return false;
		});
		
	}
	
	//hijack member links
	$('.trackTitle__username').live('click', function( e ) {
		e.preventDefault();
		var permaLink = $(this).attr('href');
		
	});
	//load playlists
	$('#playlists-btn').live('click', function( e ) {
		$(this).hide();
		$('#playcontrols').find('button').hide();
		$('#ajax-loader').show();
		loadPlaylists();
	});
	//load tracks
	$('#groups-btn').live('click', function( e ) {
		$(this).hide();
		$('#playcontrols').find('button').hide();
		$('#ajax-loader').show();
		loadGroups();
	});
	//https://api.soundcloud.com/groups/1211/tracks.json	
	$('.sc-group').live('click', function( e ){
		$('#playcontrols').find('button').hide();
		$('#ajax-loader').show();
		var _this = $(this);
		SC.get("/groups/" + _this.find('.scgroup-id').text() + "/tracks.json",  function(tracks){
			var $track;
			var $playsurface = $('#playsurface');
			//build home page interface
			$playsurface.empty();
			//$playsurface.append($('<h3>').text('Tracks'));
			$('#playcontrols')
				.empty()
				.append(
					$('<span>').html('Tracks - <em>' + _this.find('.scgroup-name').text().substring(0, 75) + '</em>')
				).append(
					$('<button>').text('Groups').attr({'id': 'groups-btn', 'class': 'float-right'})
				).append(
					$('<div>').attr('id', 'ajax-loader')
				).append(
					$('<br />').attr('class', 'clear')
				);
			for(var i =0;i<tracks.length; i++) {
				
				if(tracks[i].title) {
					$track = $('<div>')
						.attr('class', 'sc-track')
						.append(					
							$('<img />').attr({'src': tracks[i].artwork_url, 'class': 'thumb-right'})
						).append(
							$('<div>').text(tracks[i].title.substring(0, 50))
						).append(
							$('<p>').text(tracks[i].description.substring(0, 60)) //100 characters
						).append(
							$('<br />').attr('class', 'clear')	
						).data('sctrack-userid', tracks[i].user_id)
						.data('sctrack-link', tracks[i].permalink_url);
					$playsurface.append($track);
				}
			}
	  });	
	});
	
	$('#playsurface div').live('hover', function(){
		$(this).addClass('playsurface-hover');
	});
	$('#playsurface div').live('mouseleave', function(){
		$(this).removeClass('playsurface-hover');
	});	
	
	
	$('.sc-track').live('click', function( e ){	
		playTrack($(this).data('sctrack-link'), $(this).data('sctrack-userid'));
	});
	
	$('#set-nickname').submit(function (ev) {
		socket.emit('nickname', $('#nick').val(), function (set) {
			if (!set) {
				//show nicknames and messages
				$('#messages, #nicknames').show();
				return $('#chat').addClass('nickname-set');
    		}
    		$('#nickname-err').css('visibility', 'visible');
  		});
  		return false;
	});
	
	$('#send-message').submit(function () {
		message('me', $('#message').val());
		socket.emit('user message', $('#message').val());
		clear();
		$('#lines').get(0).scrollTop = 10000000;
		return false;
	});
	
	$('#playNow').click(function () {
		var playVal = $('#playSomething').find('#playThis').val();
		socket.emit('play', playVal);
		return false;
	});
	function clear () {
		$('#message').val('').focus();
    }
    
	//load groups if cache isn't present
	if($('#playsurface').children().length < 1) {
		loadGroups();
		console.log('not loading groups from cache');
	}
	
    

});