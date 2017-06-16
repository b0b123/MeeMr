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
})

function renderPost(selector, post) {
	var post = "<div class='post'><h2 class='postTitle'><b>" + post.title + "</b></h2><img src='img/" + post.id + "'/></div>"

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