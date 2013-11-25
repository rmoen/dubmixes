/*
	Dubmixes.com
	Footer Javascripts 
	Author Rob Moen	
 */
//init FB object
(function() {
	//get the Facebook javascripts
	var e = document.createElement('script');
	e.type = 'text/javascript';
	e.src = document.location.protocol +
	  '//connect.facebook.net/en_US/all.js';
	e.async = true;
	document.getElementById('fb-root').appendChild(e);

	//do the Facebook init thing
	window.fbAsyncInit = function() {
		FB.init({
			appId      : '124753254321367', // App ID
			channelUrl : 'http://dubmixes.com/channel.html', // Channel File
			status     : true, // check login status
			cookie     : true, // enable cookies to allow the server to access the session
			xfbml      : true  // parse XFBML
		});

		// whenever the user logs in, we redirect the page
	    FB.Event.subscribe('auth.login', function(response) {
			//TODO: Rationalize doUser() here.
			doUser();
	     /* if (response.authResponse) {
	      	console.log('logging in');
		     FB.api('/me', function(response) {
				socket.emit('nickname', response.username, function (set) {
					if (!set) {
						//show nicknames and messages
						$('#messages, #nicknames').show();
						return $('#chat').addClass('nickname-set');
		    		}
		    		$('#nickname-err').css('visibility', 'visible');
		  		});
		       console.log('response', response);
		     }); 
		     
	      }
	      */
	    });
		
		//handle the user if they logout
	   	FB.Event.subscribe('auth.logout', function(response){
	   		socket.emit('logout');
	   		$('#user-photo').remove();
	   	});

		//Init the loginPanel
		doUser();
	};
	
/*
activities: ""
affiliations: Array[0]
birthday: null
birthday_date: null
current_location: Object
email: null
first_name: "Rob"
has_added_app: true
hometown_location: Object
interests: ""
is_app_user: true
locale: "en_US"
meeting_for: null
meeting_sex: null
music: "Mark Farina, Pretty Lights, DIE ANTWOORD, Com Truise, Eyedea, Mac Lethal, ExtremeAnimalz, Meta Zen - Short Circuit Volume 2 - Phantom Hertz Recordings, Mike Patton, The Silent Numbers, Twisted Whistle, Bassnectar, Raw & Order, Gogol Bordello, The Thrash-key Kids, The Glitch Mob"
name: "Rob Moen"
online_presence: null
pic: "http://profile.ak.fbcdn.net/hprofile-ak-snc4/369739_677624212_384987066_s.jpg"
pic_big: "http://profile.ak.fbcdn.net/hprofile-ak-snc4/369739_677624212_384987066_n.jpg"
pic_small: "http://profile.ak.fbcdn.net/hprofile-ak-snc4/369739_677624212_384987066_t.jpg"
pic_square: "http://profile.ak.fbcdn.net/hprofile-ak-snc4/369739_677624212_384987066_q.jpg"
political: null
profile_update_time: "1333928799"
profile_url: "http://www.facebook.com/robtmoen"
relationship_status: null
religion: null
sex: "male"
significant_other_id: null
status: null
timezone: "-7"
uid: "677624212"
username: "robtmoen"


*/	
	
	function doUser(){		
		//get user status
		FB.getLoginStatus(function(response) {
			if (response.authResponse) {
			// logged in and connected user, someone you know
			     //FB.api('/me', function(user) {
		     	FB.api({
		     		method: 'fql.query',
					//query: 'SELECT object_id, post_id FROM like WHERE user_id = me()'
					query: 'SELECT uid, first_name, name, username, pic_small, pic_big, pic_square, pic, affiliations, profile_update_time, timezone, religion, birthday, birthday_date, sex, hometown_location, meeting_sex, meeting_for, relationship_status, significant_other_id, political, current_location, activities, interests, is_app_user, music, status, has_added_app, online_presence, locale, profile_url, email FROM user WHERE uid=me()'
		     
		     
		     	}, function(user) {		     
					socket.emit('nickname', user[0].username, function (set) {
						if (!set) {
							//show nicknames and messages
							$('#messages, #nicknames').show();
							return $('#chat').addClass('nickname-set');
			    		}
			    		$('#nickname-err').css('visibility', 'visible');
			  		});
			       console.log('user', user);
			       
			       $('#loginPanel').before(
			       		$('<div />')
			       			.attr('id', 'user-photo')
			       			.append(
			       				$('<a />').attr('href', user[0].profile_url)
			       					.html(
			       						$('<img>').attr({'src': user[0].pic_small, 'style':'height:22px'})	
			       					)
			       			)
			       );
			       
			     }); 
			} else {
				// no user session available, someone you dont know
         		// do nothing
			} //end if session
						

		}); //end getLoginStatus

  };  //end doUser()
  
	function doLogin(){
	//popup a login box
		FB.login(function(response) {
		   if (response.authResponse) {
		     console.log('Welcome!  Fetching your information.... ');
		     FB.api('/me', function(response) {
		       console.log('Good to see you, ' + response.name + '.');
		       console.log('response', response);
		     });
		   } else {
		     console.log('User cancelled login or did not fully authorize.');
		   }
		 });
	 
	} //end doLogin()

 

}());


/*	
	FB.api({
		method: 'fql.query',
		//query: 'SELECT object_id, post_id FROM like WHERE user_id = me()'
		query: 'SELECT uid, first_name, name, username, pic_small, pic_big, pic_square, pic, affiliations, profile_update_time, timezone, religion, birthday, birthday_date, sex, hometown_location, meeting_sex, meeting_for, relationship_status, significant_other_id, political, current_location, activities, interests, is_app_user, music, status, has_added_app, online_presence, locale, profile_url, email FROM user WHERE uid=me()'

	}, function(response) {
		
		//update login to chat
		socket.emit('nickname', response[0].username, function (set) {
			if (!set) {
				//show nicknames and messages
				$('#messages, #nicknames').show();
				return $('#chat').addClass('nickname-set');
    		}
    		$('#nickname-err').css('visibility', 'visible');
  		});
	
	});  

*/		
