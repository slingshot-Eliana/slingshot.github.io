<?php
session_start();
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

if (isset($_GET['endpractice'])){
		$outFile = "./results/practiceresults.txt";
		$fh = fopen($outFile,'a');
		fwrite($fh, $_SESSION['data']);
		fclose($fh);
		$_SESSION['data']="";
}

?>