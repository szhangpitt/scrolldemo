function loadData() {
	IN.API.Profile("me")
    .fields(["id", "firstName", "lastName", "pictureUrl","headline","publicProfileUrl"])
    .result(function(result) {
      profile = result.values[0];
      profHTML = "<p><a href=\"" + profile.publicProfileUrl + "\">";
      profHTML += "<img class=img_border align=\"left\" src=\"" + profile.pictureUrl + "\"></a>";      
      profHTML += "<a href=\"" + profile.publicProfileUrl + "\">";
      profHTML += "<h2 class=myname>" + profile.firstName + " " + profile.lastName + "</a> </h2>";
      profHTML += "<span class=myheadline>" + profile.headline + "</span>";
      $("body").append(profHTML);
    });
}