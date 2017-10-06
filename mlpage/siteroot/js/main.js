/**
 * main.js
 * http://www.codrops.com
 *
 * Licensed under the MIT license.
 * http://www.opensource.org/licenses/mit-license.php
 * 
 * Copyright 2015, Codrops
 * http://www.codrops.com
 */
;(function(window) {

	'use strict';

	/**
	 * some helper functions
	 */
	
	/**********************************************/
	/** https://gist.github.com/desandro/1866474 **/
	/**********************************************/
	var lastTime = 0;
	var prefixes = 'webkit moz ms o'.split(' ');
	// get unprefixed rAF and cAF, if present
	var requestAnimationFrame = window.requestAnimationFrame;
	var cancelAnimationFrame = window.cancelAnimationFrame;
	// loop through vendor prefixes and get prefixed rAF and cAF
	var prefix;
	for( var i = 0; i < prefixes.length; i++ ) {
		if ( requestAnimationFrame && cancelAnimationFrame ) {
			break;
		}
		prefix = prefixes[i];
		requestAnimationFrame = requestAnimationFrame || window[ prefix + 'RequestAnimationFrame' ];
		cancelAnimationFrame  = cancelAnimationFrame  || window[ prefix + 'CancelAnimationFrame' ] ||
		window[ prefix + 'CancelRequestAnimationFrame' ];
	}

	// fallback to setTimeout and clearTimeout if either request/cancel is not supported
	if ( !requestAnimationFrame || !cancelAnimationFrame ) {
		requestAnimationFrame = function( callback, element ) {
			var currTime = new Date().getTime();
			var timeToCall = Math.max( 0, 16 - ( currTime - lastTime ) );
			var id = window.setTimeout( function() {
				callback( currTime + timeToCall );
			}, timeToCall );
			lastTime = currTime + timeToCall;
			return id;
		};

		cancelAnimationFrame = function( id ) {
			window.clearTimeout( id );
		};
	}

	function throttle(fn, delay) {
		var allowSample = true;

		return function(e) {
			if (allowSample) {
				allowSample = false;
				setTimeout(function() { allowSample = true; }, delay);
				fn(e);
			}
		};
	}

	// from http://www.quirksmode.org/js/events_properties.html#position
	function getMousePos(e) {
		var posx = 0;
		var posy = 0;
		if (!e) var e = window.event;
		if (e.pageX || e.pageY) 	{
			posx = e.pageX;
			posy = e.pageY;
		}
		else if (e.clientX || e.clientY) 	{
			posx = e.clientX + document.body.scrollLeft
				+ document.documentElement.scrollLeft;
			posy = e.clientY + document.body.scrollTop
				+ document.documentElement.scrollTop;
		}
		return {
			x : posx,
			y : posy
		}
	}

	// equation of a line
	function lineEq(y2, y1, x2, x1, currentVal) {
		// y = mx + b
		var m = (y2 - y1) / (x2 - x1),
			b = y1 - m * x1;

		return m * currentVal + b;
	}

	var support = {transitions : Modernizr.csstransitions, preserve3d : Modernizr.preserve3d},
		transEndEventNames = {'WebkitTransition': 'webkitTransitionEnd', 'MozTransition': 'transitionend', 'OTransition': 'oTransitionEnd', 'msTransition': 'MSTransitionEnd', 'transition': 'transitionend'},
		transEndEventName = transEndEventNames[Modernizr.prefixed('transition')],
		onEndTransition = function(el, callback) {
			var onEndCallbackFn = function( ev ) {
				if( support.transitions ) {
					if( ev.target != this ) return;
					this.removeEventListener( transEndEventName, onEndCallbackFn );
				}
				if( callback && typeof callback === 'function' ) { callback.call(this); }
			};
			if( support.transitions ) {
				el.addEventListener( transEndEventName, onEndCallbackFn );
			}
			else {
				onEndCallbackFn();
			}
		},
		// main container
		//container = document.querySelector('.container'),
		// the 3D element - the room
    //room = container.querySelector('.cube'),
		// the seat rows inside the 3D element
    //rows = [].slice.call(room.querySelectorAll('.rows > .row')),
		// total amount of rows
		//totalRows = rows.length,
		// seats
		seats = [].slice.call(document.querySelectorAll('.row__seat')),
		// the plan/map
		plan = document.querySelector('.plan'),
		buyAction = document.querySelector('button.action--buy'),
		// seats on the plan/map
		planseats = [].slice.call(plan.querySelectorAll('.row__seat')),
		// the screen
		//monitor = room.querySelector('.screen'),
		// the video element
		//video = monitor.querySelector('video'),
		// play video control
		//playCtrl = monitor.querySelector('button.action--play'),
		// intro element
		//intro = monitor.querySelector('.intro'),
		// 'select your seats' control
    //selectSeatsCtrl = document.querySelector('button.action--seats'),
		// the tilt control
		tiltCtrl = document.querySelector('.action--lookaround'),
		// how much the camera rotates when the user moves the mouse
		tiltRotation = {
			rotateX : 25, // a relative rotation of -25deg to 25deg on the x-axis
			rotateY : 15  // a relative rotation of -15deg to 15deg on the y-axis
		},
		// controls whether the tilt is active or not
		tilt = false,
		// window sizes
		winsize = {width: window.innerWidth, height: window.innerHeight},
		// width of one seat
		seat_width = seats[0].offsetWidth,
		// number of seats per row
		//seats_row = rows[0].children.length,
		// the sum of the room´s left margin with the room´s right margin is four times the width of a seat 
		side_margin = 4 * seat_width,
		
		// if the following is changed, the CSS values also need to be adjusted (and vice-versa)
		// distance from first row to the screen
		row_front_gap = 800,
		// distance between rows
		row_back = 100,
		// the gap of seats in the middle of the room (equivalent to two columns of seats)
		row_gap_amount = 2,
		// perspective value
		perspective = 2000,
		// transition settings for the room animations (moving camera to seat)
		transitionOpts = {'speed' : 1000, 'easing' : 'cubic-bezier(.7,0,.3,1)'},

		// the room dimentions
		roomsize = {
			//x : seats_row * seat_width + side_margin + row_gap_amount * seat_width,
			y : 1000, // SCSS $cube_y
			z : 3000 // SCSS $cube_z
		},
		// the initial values for the room transform
		initTransform = {
			translateX : 0,
			translateY : roomsize.y/3.5, // view from top..
			translateZ : 0,
			rotateX : -15, // ..looking down
			rotateY : 0
		},
		// the current room transform
		roomTransform = initTransform;
    console.log('Ready');

	function init() {
		// scale room to fit viewport
		//scaleRoom();
		// initial view (zoomed screen)
		//applyRoomTransform({'translateX' : 0, 'translateY' : 0, 'translateZ' : 1300, 'rotateX' : 0, 'rotateY' : 0});
		// bind events
		initEvents();
	}

	function applyRoomTransform(transform) {
		room.style.WebkitTransform = room.style.transform = transform ? 'translate3d(0,0,' + perspective + 'px) rotate3d(1,0,0,' + transform.rotateX + 'deg) rotate3d(0,1,0,' + transform.rotateY + 'deg) translate3d(' + transform.translateX + 'px, ' + transform.translateY + 'px, ' + transform.translateZ + 'px)'
																	  : 'translate3d(0,0,' + perspective + 'px) rotate3d(1,0,0,' + roomTransform.rotateX + 'deg) rotate3d(0,1,0,' + roomTransform.rotateY + 'deg) translate3d(' + roomTransform.translateX + 'px, ' + roomTransform.translateY + 'px, ' + roomTransform.translateZ + 'px)';
	}

	function applyRoomTransition(settings) {
		var settings = settings || transitionOpts;
		//room.style.WebkitTransition = '-webkit-transform ' + settings.speed + 'ms ' + settings.easing;
		//room.style.transition = 'transform ' + settings.speed + 'ms ' + settings.easing;
	}

	function removeRoomTransition() {
		room.style.WebkitTransition = room.style.transition = 'none';
	}

	function scaleRoom() {
		//var factor = winsize.width / roomsize.x;
		//container.style.WebkitTransform = container.style.transform = 'scale3d(' + factor + ',' + factor + ',1)';
	}

	function initEvents() {
		// select a seat
		var onSeatSelect = function(ev) { selectSeat(ev.target); };
		planseats.forEach(function(planseat) {
			planseat.addEventListener('click', onSeatSelect);
		});

		// enabling/disabling the tilt
		var onTiltCtrlClick = function() {
			// if tilt is enabled..
			if( tilt ) {
				disableTilt();
			}
			else {
				enableTilt();
			}
		};
		tiltCtrl.addEventListener('click', onTiltCtrlClick);

		// mousemove event / tilt functionality
		var onMouseMove = function(ev) {
			requestAnimationFrame(function() {
				if( !tilt ) return false;

				var mousepos = getMousePos(ev),
					// transform values
					rotX = tiltRotation.rotateX ? roomTransform.rotateX -  (2 * tiltRotation.rotateX / winsize.height * mousepos.y - tiltRotation.rotateX) : 0,
					rotY = tiltRotation.rotateY ? roomTransform.rotateY +  (2 * tiltRotation.rotateY / winsize.width * mousepos.x - tiltRotation.rotateY) : 0;
		
				// apply transform
				applyRoomTransform({'translateX' : roomTransform.translateX, 'translateY' : roomTransform.translateY, 'translateZ' : roomTransform.translateZ, 'rotateX' : rotX, 'rotateY' : rotY});
			});
		};
		document.addEventListener('mousemove', onMouseMove);

		// select seats control click (intro button): show the room layout
		var onSelectSeats = function() { 
			classie.remove(intro, 'intro--shown');
			classie.add(plan, 'plan--shown');
			classie.add(playCtrl, 'action--faded');
			zoomOutScreen(function() {
				showTiltCtrl();
			}); 
		};
    buyAction.addEventListener('click',buyTickets);
		//selectSeatsCtrl.addEventListener('click', onSelectSeats);

		// play video
		//playCtrl.addEventListener('click', videoPlay);
		// ended video event
		//video.addEventListener('ended', videoLoad);

		// window resize: update window size
		//window.addEventListener('resize', throttle(function(ev) {
			//winsize = {width: window.innerWidth, height: window.innerHeight};
      //scaleRoom();
		//}, 10));
	}

	function showTiltCtrl() {
		classie.add(tiltCtrl, 'action--shown');
	}

	// select a seat on the seat plan
	function selectSeat(planseat) {
		if( classie.has(planseat, 'row__seat--reserved') ) {
			return false;
		}
		if( classie.has(planseat, 'row__seat--selected') ) {
			classie.remove(planseat, 'row__seat--selected');
			return false;
		}
		// add selected class
		classie.add(planseat, 'row__seat--selected');

		if( support.preserve3d ) {
			// the real seat
			var seat = seats[planseats.indexOf(planseat)];
			// show the seat´s perspective
			previewSeat(seat);
		}
	}

	// preview perspective from the selected seat. Moves the camera to that position.
	function previewSeat(seat) {
	}

	function zoomOutScreen(callback) {
		applyRoomTransition({'speed' : 1500, 'easing' : 'ease'});
		applyRoomTransform(initTransform);
		onEndTransition(room, function() {
			removeRoomTransition();
			callback.call();
		});
	}

	function disableTilt() {
		classie.add(tiltCtrl, 'action--disabled');
		tilt = false;
	}

	function enableTilt() { 
		classie.remove(tiltCtrl, 'action--disabled');
		tilt = true;
	}

	function videoPlay() {
		// hide the play control
		classie.remove(playCtrl, 'action--shown');
		video.currentTime = 0;
		video.play();
	}

	function videoLoad() {
		// show the play control
		classie.add(playCtrl, 'action--shown');
		video.load();
	}

  function buyTickets(){
    //var selectedSeats = [].slice.call(plan.querySelectorAll('.row__seat--selected'))[0];
    var selectedSeats = plan.querySelectorAll('.row__seat--selected');
    var seatsArray = [];
    var seatsString = '';
    var comma = '';
    [].forEach.call( selectedSeats, function(item) {
      seatsArray.push($(item).attr('data-tooltip'));
      seatsString += comma + $(item).attr('data-tooltip');
      comma = ',';
    });

    //choice = { "choice": seatsArray };
    choice = { "value": seatsString };
    console.log('Selected seats:');
    //console.log(seatsArray);
    console.log(seatsString);
    //alert(seatsArray);
    alert(seatsString);
    post();
  }


  var choice = { "choice": [11,22,39] }, on_close_url='', session_pk='';
  var requestParams = new URLSearchParams(window.location.search);
  if (!requestParams.has('session_pk') || !requestParams.has('on_close_url')) {
    console.log('Fatal Error! Missing required params!')
  } else {
    session_pk = requestParams.get('session_pk');
    on_close_url = requestParams.get('on_close_url');
    console.log('session_pk: '+ session_pk);
    console.log('on_close_url: '+ on_close_url);
  }
  var server='https://dashboard.fstrk.io/login/api/server_register_answer/'+session_pk,
    redirectUrl = on_close_url;


  function success(res) {
    console.log("Server response: "+JSON.stringify(res));
    document.location = redirectUrl;
    //window.open(redirectUrl,'_blank');
    return;

    if (res && res.result == 'OK') {
      //$('#successAlert').show();
      document.location = redirectUrl;
    }
    else
    {
      console.log('Waiting for {"result":"OK"}');
      //$('#errorAlert').show();
    }
  }

  function post(){
    //$('#successAlert').hide();
    //$('#errorAlert').hide();
    //server = $('#dataToSend').val();
    //redirectUrl = $('#redirectTo').val();
    console.log('Sending data to: '+ server);
    $.ajax({
      type: "POST",
      //url: "http://localhost:8087/api/choice",
      url: server,
      data: JSON.stringify(choice),
      contentType: "application/json; charset=utf-8",
      dataType: "json",
      success: function(data){ success(data); },
      failure: function(errMsg) {
        alert(errMsg);
      }
    });
    console.log('post sent');
    return false;
  }


	init();

})(window);
