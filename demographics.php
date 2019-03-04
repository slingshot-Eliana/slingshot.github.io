<?php

session_start();


echo "<html> <title>Angry Blueberries</title><body><head><STYLE TYPE=\"text/css\">

 a:link{color: #cc3300;}
a:visited{color: #cc3300;}
body{ background-color: #D4C094; font-family:Verdana, sans-serif; font-size: 12pt; text-align: center;}
table.gboard {border-spacing: 0px; vertical-align: center; text-align: center; border-width: 4px; border-style: solid; border-collapse: collapse; border-color: #000000; font-family: Verdana,sans-serif; font-size: 30pt;}
td.bcell{background-color: #1A5600; padding: 0px; vertical-align: middle; border-style: solid; border-width: 4px; border-color: #000000;}
td.acell{background-color: #ffffff; padding: 0px; vertical-align: middle; border-style: solid; border-width: 4px; border-color: #000000;}
table.tblnobord {border-spacing: 0px; vertical-align: middle; text-align: left; border-width: 0px; border-style: solid; border-collapse: collapse; font-family: Verdana,sans-serif; font-size: 16pt;}
td.tdnobord{padding: 5px; vertical-align: middle; border-style: solid; border-width: 0px;}
tr.trnobord{background-color: #ffffff;}
tr.moused{background-color: #eeeeee;}
td.tdbleft{border-left: 4px solid #000000;}
td.tddash{background-color: #383838; padding: 5px; vertical-align: top; border-style: solid; border-width: 2px; border-color: #444444;}
table.tblborder {border-spacing: 0px; vertical-align: center; text-align: center; border-width: 2px; border-style: solid; border-collapse: collapse; border-color: #aaaaaa; font-family: Verdana,sans-serif; font-size: 16pt;}

#points, #round, #rleft, #tleft {font-size: 16pt; color: #ffffff;}
#container {text-align: left; padding: 2px; border-style: solid; border-width: 8px; border-color: #000000; background-color: #ffffff; width: 800px; margin-left:auto; margin-right: auto; margin-top: 10px;}
#preload {display: none;}
</STYLE>

</head>


";

echo "<div id=\"container\">";

echo "<script type=\"text/javascript\" src=\"formcheck.js\"></script><br><br><b>Demographics</b><br /><br />";
	echo "You are nearly finished.  Please answer the remaining demographics questions below.<br><br>
	";
	echo "<form method='post' action='finished.php'>";
	echo "Gender: <input type='radio' name='gender' value='m' />M ";
	echo "<input type='radio' name='gender' value='f' />F";
	echo "<br /><br />Age: <input type='text' size='3' name='age' />";
	echo "<br /><br />Race/Ethnicity: <input type='text' size='20' name='race' />";
	//echo "<br /><br />Email: <input type='text' size='20' name='email' />";
	echo "<br /><br /><input type='submit' onClick='valform(this.parentNode); return false;' value='Submit' />";
	echo "</form>";
	
	//write data.
$temp=explode("_",$_GET['trace']);
$temp2=explode("_",$_GET['tracetimes']);
$temp3=explode("_",$_GET['traceerrors']);
$str="";
$str2="";
$str3="";
for ($i=0;$i<count($temp)-1;$i++){
	$str.=$temp[$i]."#";
	$str2.=$temp2[$i]."#";
	$str3.=$temp3[$i]."#";
}
	
if ($_GET['lberries']>0)
	$_SESSION['data'].=$_SESSION['subjnum'].",".$_SESSION['cond'].",".$_GET['count'].",".$_GET['lberries'].",".$_GET['lpoints'].",$str,$str2,$str3 \n";

		$outFile = "./results/results.txt";
		$fh = fopen($outFile,'a');
		fwrite($fh, $_SESSION['data']);
		fclose($fh);
		
		
		 
	 
?>