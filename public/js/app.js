$(function() {
	//Session
	var session = { };

	function loadSession() {
		$.ajax({
			url: "/user/session",
			method: "GET"
			
		}).done(function(r) {
			session = r
			
			if(typeof(session.name) != 'undefined') {
				login(session.name)
			}
		})
	}
	
	function login(name) {
		$("#registerbtn").hide()
		$("#signinbtn").hide()
		$("#greetuser").show()
		$("#logoutbtn").show()
		$("#uploadbtn").show()
		
		$("#recentbtn")[0].click()
		
		$("#greetuser").find("span").text("Welcome back, " + session.name + "!")
	}
	
	function logout() {
		$("#registerbtn").show()
		$("#signinbtn").show()
		$("#greetuser").hide()
		$("#logoutbtn").hide()
		$("#uploadbtn").hide()
		
		$("#recentbtn")[0].click()
		
		$.ajax({
			url: "/user/logout",
			method: "POST"
			
		}).done(function(r) {
			fancyModal("Logout successful", "green")
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
	
	$('#postSubmit').click(function() {
		$("#newPostStatus").text("File is uploading...")
		
		$.ajax({
			url: "/post/create",
			method: "POST",
			data: new FormData($("#uploadForm")[0]),
			cache: false,
			contentType: false,
			processData: false
			
		}).done(function(r) {
			fancyModal(JSON.stringify(r), "green")
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
			if(r.response) {
				fancyModal("Login successful", "green")
				loadSession()
			} else {
				fancyModal("Invalid login", "red")
			}
		})
    })
	
	//Functions
	function getRandomPost(callback) {
		$.ajax({
			url: "/randompost"
			
		}).done(function(r) {
			callback(r)
		})
	}

	//Onload behaviour 
	getRandomPost(function(post) {
		renderPost($("#recentPost"), post)
	})
	getRandomPost(function(post) {
		renderPost($("#recentPost2"), post)
	})
})

function renderPost(selector, post) {
	var post = "<div class='post' name='" + post.id + "'><h2 class='postTitle'><b>" + post.title + "</b></h2><img src='img/" + post.id + "'/><div><div class='btn btn-success' onclick='upvote(this)'>Upvote (" + post.upvotes + ")</div><div class='btn btn-danger' onclick='downvote(this)'>Downvote (" + post.downvotes + ")</div></div></div>"

	selector.html(post)
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
  return new Promise((resolve) => setTimeout(resolve, time));
}

//Voting
function placeVote(postId, upvote, callback) {
	$.ajax({
		url: "/vote",
		method: "POST",
		data: {
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
	
	placeVote(id, 1, function(post) {
		renderPost(me.parent().parent().parent(), post)
		me.parent().parent().remove()
	})
}

function downvote(me) {
	me = $(me);
	var id = me.parent().parent().attr("name")
	
	placeVote(id, 0, function(post) {
		renderPost(me.parent().parent().parent(), post)
		me.parent().parent().remove()
	})
}