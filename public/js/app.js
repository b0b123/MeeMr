var session = { }

$(function() {
	//Session
	function loadSession() {
		$.ajax({
			url: "/user/session",
			method: "GET"
			
		}).done(function(r) {
			session = r
			
			if(typeof(session.name) != 'undefined') {
				login()
				
			} else {
				//Tutorial
				fancyModal("Welcome! Scroll down or click the image to find new memes! (Click to dismiss)", "#337ab7")
			}
			
			//Onload behaviour 
			$(".feedbtn")[0].click()
		})
	}
	
	function login() {
		$("#registerbtn").hide()
		$("#signinbtn").hide()
		$("#greetuser").show()
		$("#logoutbtn").show()
		$("#uploadbtn").show()
		
		$(".feedbtn")[0].click()
		
		$(".username").text(session.name)
	}
	
	function logout() {
		$("#registerbtn").show()
		$("#signinbtn").show()
		$("#greetuser").hide()
		$("#logoutbtn").hide()
		$("#uploadbtn").hide()
		
		session = { }
		$.ajax({
			url: "/user/logout",
			method: "POST"
			
		}).done(function(r) {
			fancyModal("Logout successful", "green")
			
			loadSession()
		})
	}
	
	loadSession();
	
	//Button behaviour
	$('#newPostFileRemove').click(function() {
		$("#newPostFile").val("")
	})
	
	$("#modalFooter").click(function() {
		$(this).slideUp()
	})
	
	$("#logoutbtn").click(function() {
		logout();
	})
	
	$(".feedbtn").click(function() {
		var sort = $(this).text()
				
		$("#currentPostSort").text(sort)
		$("#feedTitle").text(sort)
		
		nextPost(false, "#post")
	})
	
	$('#searchbar').keypress(function(e) {
		if (e.which == 13) {
			$(".feedbtn")[0].click()
			return false
		}
	})
	
	$('#postSubmit').click(function() {		
		$.ajax({
			url: "/post/create",
			method: "POST",
			data: new FormData($("#uploadForm")[0]),
			cache: false,
			contentType: false,
			processData: false
			
		}).done(function(r) {
			if(typeof(r.err) != 'undefined') {
				fancyModal("Upload failed: " + r.err, "red")
			} else {
				fancyModal("Your post was uploaded successfully", "green")
			}
		})
    })
	
	$('#registerSubmit').click(function() {	
		var form = $(this).parent().parent()
		var name = form.find("input[name=name]").val()
		var pass = form.find("input[name=pass]").val()
		var cpass = form.find("input[name=cpass]").val()
		
		if(pass != cpass) {
			fancyModal("Registration failed: Passwords do not match", "red")
			return;
		}
		
		$.ajax({
			url: "/user/create",
			method: "POST",
			data: {
				name: name,
				pass: pass
			}
			
		}).done(function(r) {			
			if(typeof(r.err) != 'undefined') {
				fancyModal("Registeration failed: " + r.err, "red")
			} else {
				fancyModal("Registered successfully", "green")
				loadSession()
			}
		})
    })
	
	$('#loginSubmit').click(function() {
		var form = $(this).parent().parent()
		var name = form.find("input[name=name]").val()
		var pass = form.find("input[name=pass]").val()
		form.find("input[name=pass]").val("")
		
		$.ajax({
			url: "/user/login",
			method: "POST",
			data: {
				name: name,
				pass: pass
			}
			
		}).done(function(r) {
			if(r.success) {
				fancyModal("Login successful", "green")
				loadSession()
			} else {
				fancyModal("Invalid login", "red")
			}
		})
    })
	
	$('#changePassSubmit').click(function() {
		var form = $(this).parent()
		var oldPass = form.find("input[name=oldPass]").val()
		var newPass = form.find("input[name=newPass]").val()
		var cnewPass = form.find("input[name=cnewPass]").val()
		
		if(newPass != cnewPass) {
			fancyModal("Changing password failed: Passwords do not match", "red")
			return;
		}
		
		$.ajax({
			url: "/user/changePass",
			method: "POST",
			data: {
				token: session.token,
				oldPass: oldPass,
				newPass: newPass
			}
			
		}).done(function(r) {
			if(typeof(r.err) != 'undefined') {
				fancyModal("Changing password failed: " + r.err, "red")
			} else {
				fancyModal("Changed password successfully", "green")
			}
		})
    })
	
	//Zooming using cross-browser compatible scroll event listening
	var mousewheelevt = (/Firefox/i.test(navigator.userAgent)) ? "DOMMouseScroll" : "mousewheel" // FF doesn't recognize mousewheel as of FF3.x
	
	if (document.attachEvent) { // if IE (and Opera depending on user setting)
		document.attachEvent("on"+mousewheelevt, function(e) { onScrollEvent(e); })
	} else if (document.addEventListener) { // WC3 browsers
		document.addEventListener(mousewheelevt, function(e) { onScrollEvent(e); }, false)
	}
	
	function onScrollEvent(e) {
		var up;
		if(e.wheelDelta != undefined) {
			up = e.wheelDelta > 0;
		} else {
			up = e.detail < 0;
		}
		
		e.preventDefault()
		nextPost(up, "#post")
	}
})

function renderPost(selector, post) {
	if(typeof(post.err) != 'undefined') {
		if(post.top) {
			$(selector).html("<h1 style='color:red'><center><b>¡ʎɐʍ ƃuoɹM</b></center></h1>")			
		} else {
			$(selector).html("<h1 style='color:green'><center><b>Congratulations!</b><br>You have finally reached the end of the internet! There's nothing more to see, no more links to visit. You've done it all.</center></h1>")
		}
		return
	}
	
	var loggedIn = typeof(session.name) != 'undefined'
	
	var upvoteBtn = "<div class='btn btn-success' onclick='upvote(this)'>Upvote (" + post.upvotes + ")</div>"
	var downvoteBtn = "<div class='btn btn-danger' onclick='downvote(this)'>Downvote (" + post.downvotes + ")</div>"
	var upvoteView = "<h4 style='color:green;'>" + post.upvotes + " upvotes</h4>"
	var downvoteView = "<h4 style='color:red;'>" + post.downvotes + " downvotes</h4>"
	var categoryView = "<h4 style='color:grey;' class='pull-right'>Category: " + post.category + "</h4>"
	
	var post = "<div class='post' name='" + post.id + "'><h2 class='postTitle'><b>" + post.title + "</b></h2><img onclick='nextPost(false, \"#post\")' src='img/" + post.id + "'/><div>" + (loggedIn ? upvoteBtn : upvoteView) + (loggedIn ? downvoteBtn : downvoteView) + categoryView + "</div></div>"

	$(selector).html(post)
}

function fancyModal(message, color) {
	$("#modalText").text(message)
	$("#modalFooter").css("background-color", color)
	$("#modalFooter").slideDown(function() {
		sleep(3000).then(() => {
			//$("#modalFooter").slideUp()
		})
	})
}

function sleep (time) {
	return new Promise((resolve) => setTimeout(resolve, time))
}

function getRandomPost(callback) {
	$.ajax({
		url: "/randompost"
		
	}).done(function(r) {
		callback(r)
	})
}

function getNextPost(up, callback) {
	$.ajax({
		url: "/nextpost",
		data: {
			token: session.token,
			sort: $("#currentPostSort").text(),
			search: $("#searchbar").val(),
			up: up
		}
		
	}).done(function(r) {
		callback(r)
	})
}

var canNextPost = true
function nextPost(up, selector) {
	if(canNextPost) {
		canNextPost = false
		
		$(selector).slideUp(function() {
			getNextPost(up, function(post) {
				renderPost(selector, post)
				$(selector).slideDown()
				canNextPost = true
			})
		})
	}
}

//Voting
function placeVote(postId, upvote, callback) {
	$.ajax({
		url: "/vote",
		method: "POST",
		data: {
			token: session.token,
			postId: postId,
			upvote: upvote
		}
	}).done(function(r) {
		callback(r)
	})
}

function upvote(me) {
	me = $(me);
	var id = me.parent().parent().attr("name")
	
	placeVote(id, 1, function(data) {
		if(typeof(data.err) != 'undefined') {
			fancyModal(data.err, "red")
		
		} else {
			renderPost(me.parent().parent().parent(), data)
			me.parent().parent().remove()
		}
	})
}

function downvote(me) {
	me = $(me);
	var id = me.parent().parent().attr("name")
	
	placeVote(id, 0, function(data) {
		if(typeof(data.err) != 'undefined') {
			fancyModal(data.err, "red")
		
		} else {
			renderPost(me.parent().parent().parent(), data)
			me.parent().parent().remove()
		}
	})
}