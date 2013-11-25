/*
 * LightBox Class
 * Author: Robm
 *
 */


Lbox = function(config) {
	if(this.$lbox){
		this.close();
	}
    this.$lbox = 
		$('<div>').attr('id', 'mglb-overlay') 
			.append(
            	$('<div>')
					.attr('class', 'lbox')
					.append(config.content)
					.css({
						height: config.height,
						width: config.width,
						left: ( ( screen.width / 2 ) - ( config.width / 2 ) ) + "px",
						top: ( ( screen.height /  2 ) - ( config.height / 2 ) ) + 'px'
					})
					//.draggable()
        	)
        .hide()
      	.appendTo('body')
      	.fadeIn();	    
        
};

Lbox.prototype.close = function() {
    this.$lbox.fadeOut();
};