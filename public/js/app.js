$(function() {
	
	//Button behaviour
	$('#newPostFileRemove').click(function() {
		$("#newPostFile").val("")
	})
	
	$('#newPostSubmit').click(function() {
		$("#newPostStatus").text("File is uploading...")
		
		$.ajax({
			url: "/post/create",
			method: "POST",
			data: new FormData($("#uploadForm")[0]),
			cache: false,
			contentType: false,
			processData: false
			
		}).done(function(r) {
			$("#newPostStatus").text(JSON.stringify(r))
		})
    })
	
	$('#newUserSubmit').click(function() {		
		$.ajax({
			url: "/user/create",
			method: "POST",
			data: {
				//TODO name and pass
			}
			
		}).done(function(r) {
			$("#newUserStatus").text(JSON.stringify(r))
		})
    })
	
	$('#loginUserSubmit').click(function() {		
		$.ajax({
			url: "/user/login",
			method: "POST",
			data: {
				//TODO name and pass
			}
			
		}).done(function(r) {
			$("#loginUserStatus").text(JSON.stringify(r))
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