$(function() {
	
	//Button behaviour
	$('#newPostFileRemove').click(function() {
		$("#newPostFile").val("")
	})
	
	$("#modalFooter").click(function() {
		$(this).slideUp()
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
		
		$.ajax({
			url: "/user/create",
			method: "POST",
			data: {
				name: form.find("input[name=name]").val(),
				pass: form.find("input[name=pass]").val()
			}
			
		}).done(function(r) {			
			if(r.response) {
				fancyModal("Registered successfully", "green")
			} else {
				fancyModal("Registration failed", "red")
			}
		})
    })
	
	$('#loginSubmit').click(function() {
	var form = $(this).parent().parent()
		
		$.ajax({
			url: "/user/login",
			method: "POST",
			data: {
				name: form.find("input[name=name]").val(),
				pass: form.find("input[name=pass]").val()
			}
			
		}).done(function(r) {
			if(r.response) {
				fancyModal("Login succesful", "green")
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