<?php
session_start();
	 $_SESSION = array();
	 session_destroy();
	 

     session_start();
     session_regenerate_id(); 

echo "<p align='center'>
    Insert your consent form here. 
";



echo "<br />";
echo "<form action='intro.php' method='post'>";
echo "<input type='submit' value='I accept'>";
echo "</form>";
echo "</center>";

echo "</body>";
echo "</html>";

?>
