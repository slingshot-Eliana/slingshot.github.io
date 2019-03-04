<?php
session_start();


echo
"
<html>

<head>
	<title>Angry Blueberries</title>

	<!-- CSS imports -->
	<link href=\"css/main.css\" rel=\"stylesheet\">
	<!-- End CSS imports -->

	<!-- JavaScript imports -->
	<script src=\"https://ajax.googleapis.com/ajax/libs/jquery/2.2.0/jquery.min.js\"></script> <!-- Import jQuery from Google CDN -->
	<script src=\"js/main2.js\"></script>
	<script src=\"js/matter.min.js\"></script>
	<!-- End JavaScript imports -->
	


</head>


<body>
	<param name=\"condition\" value=\"2\">
	<div id=\"container\">
		<div id=\"next-btn\">Next!</div>
		<img src=\"img/bload.gif\" class=\"loading\">
		<img id=\"practice\" src=\"img/practice.gif\" class=\"message\">
		<img id=\"game\" src=\"img/game.gif\" class=\"message\">
	</div>
	
	
</body>
</html>
";

?>
