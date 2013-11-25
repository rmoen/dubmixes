
/*  
 * Dubmixes.com
 * Author: Robm
 *
 */

DM = function ($) {	
	this.lbox = null;
	this.signupFrm = null;
	this.loginFrm = null;
	
	var _this = this;
	
/* Attach Events */

	$('#loginBtn').live('click', function( e ){
		_this.showLogin();
		e.preventDefault();
	});
	
	$('#signupBtn').live('click', function ( e ){
		_this.showSignup();
		e.preventDefault();
	});
		
	$('.lboxClose').live('click', function( e ){
		e.preventDefault();
		_this.closeModal();
	});
	
	$('#doSignup, #doLogin').live('click', function( e ){
		e.preventDefault();
		var $form = $( this )
			.parent()
			.parent()
			.find('#loginSignupFrm');
			
		_this.$ajaxLoader = $form
			.find('.ajax-loader')
			.show();
			
		$.ajax({
			type: 'post',
  			url: '/api/loginSignup',
  			data: $('#loginSignupFrm').serialize(),
  			cache: false,
  			success: function( data ){
  				_this.$ajaxLoader.hide();
				console.log ( data );
				_this.closeModal();
				//reload member panel
				_this.refreshLoginPanel();
				
  			}, 
  			error: function( error ) {
  				console.log( 'there was an error' );
  			}
  			
		});
	});
	
	$('.logoutBtn').live('click', function( e ){
		e.preventDefault();
		$.ajax({
			type: 'get',
			url: '/api/logout',
			cache: false,
			success: function( data ) {
				console.log( data );
				//reload member panel
				_this.refreshLoginPanel();
			},
			errror: function( err ) {
				console.log ('there was an error logging out');
			}
		});
	});
	
};

DM.prototype.showLogin = function(){
	this.closeModal();

	var loginBtn = $('<button>')
					.attr({'id': 'doLogin', 'class': 'green button'})
					.text('Login');
	this.loginFrm = $('<form>')
					.attr('id', 'loginSignupFrm')
						.append(
							$('<div>').attr('class', 'ajax-loader') )
						.append(
							$('<h3>').text('Login') )
						.append(
							$('<input>').attr({'type': 'text', 'name': 'email', 'placeholder': 'Your Email'}) )
						.append(
							$('<input>').attr({'type': 'password', 'name': 'passwd', 'placeholder': 'Your Password'}) )
						.append(
							$('<br />').attr('style', 'clear:both') )
						.append( loginBtn )
						.append(
							$('<button>').attr({'class': 'lboxClose button'}).text('Close') );			

	
	this.lbox = new Lbox({
		'content': this.loginFrm,
		'height': 200,
		'width': 225
	});
	$(this.loginFrm).find('input')[0].focus();	
}

DM.prototype.showSignup = function(){
	this.closeModal();
		
	var signupBtn = $('<button>')
					.attr({'id': 'doSignup', 'class': 'green button'})
					.text('Signup');
		
	this.signupFrm = $('<form>')
					.attr('id', 'loginSignupFrm')
						.append(
							$('<div>').attr('class', 'ajax-loader') )
						.append(
							$('<h3>').text('EZ Signup') )
						.append(
							$('<input>').attr({'type': 'text', 'name': 'email', 'placeholder': 'Your Email'}) )
						.append(
							$('<input>').attr({'type': 'password', 'name': 'passwd', 'placeholder': 'Your Password'}) )
						.append(
							$('<br />').attr('style', 'clear:both') )
						.append( signupBtn )
						.append(
							$('<button>').attr({'class': 'lboxClose button'}).text('Close') );


	this.lbox = new Lbox(this.signupFrm);	
	$(this.loginFrm).find('input')[0].focus();
};

DM.prototype.redirect = function(location) {
	if(location) {
		window.location.href = location;
	} else {
		window.location.href = '/';	
	}		
};

DM.prototype.refreshLoginPanel = function() {
	$.ajax({
		type: 'get',
		url: '/api/getloginPanel',
		cache: false,
		success: function(data) {
			$('#loginPanel').html(data);
		},
		error: function() {
			console.log('error reloading login panel');
		}
	});
};

DM.prototype.closeModal = function() {
	if ( this.lbox !== null ) {
		if( this.$ajaxLoader ) {
			this.$ajaxLoader.hide();
		}
		this.lbox.close();
	}
};

/*
 * Create MG instance
 */

var dm = new DM(jQuery);