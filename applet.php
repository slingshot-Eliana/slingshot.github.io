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
	<script src=\"js/main.js\"></script>
	<script src=\"js/matter.min.js\"></script>
	<!-- End JavaScript imports -->
	


</head>
";
if (isset($_SESSION['loaded'])){
	
	echo "It appears that you refreshed the page. You cannot continue at this time. You may try again later by returning to the consent form: <a href='consent.php'>Click here</a> ";
	
}
else if (isset($_SESSION['cond'])){

$condition=$_SESSION['cond'];
$_SESSION['loaded']=1;

echo "
<body>
	<param name=\"condition\" value=\"$condition\">
	<div id=\"container\">
		<div id=\"next-btn\">Next!</div>
		<img src=\"img/bload.gif\" class=\"loading\">
		<img id=\"practice\" src=\"img/practice.gif\" class=\"message\">
		<img id=\"game\" src=\"img/game.gif\" class=\"message\">
	</div>
	
	<center><h2>NOTE: DO NOT REFRESH THIS PAGE. DOING SO MIGHT PREVENT YOU FROM EARNING CREDIT FOR THIS HIT.</h2></center>
</body>
</html>
";
}
else{
	echo "You cannot load this page at this time. Please return to the consent form: <a href='consent.php'>Click here</a>.";
	
}
?>
