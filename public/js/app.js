$(function() {
	
	//Button behaviour
	$('#newPostFileRemove').click(function() {
		$("#newPostFile").val("")
	})
	
	$('#newPostSubmit').click(function() {
		$("#status").text("File is uploading...")
		
		$.ajax({
			url: "/post/create",
			method: "POST",
			data: new FormData($("#uploadForm")[0]),
			cache: false,
			contentType: false,
			processData: false
			
		}).done(function(r) {
			$("#status").text(JSON.stringify(r))
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