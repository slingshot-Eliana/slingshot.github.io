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

//stuff here


		include 'init.php';		
		$doneit=ipCheck();
		$doneit=false;				
		if (!$doneit){
			init(4);	
			if ($_SESSION['cond']==0 || $_SESSION['cond']==2){
				$per=3;
			}
			else{
				$per=15;
			}
			echo "Thank you for playing Angry Blueberries!  This is a video game in which you help blueberries wage battle against waffles.  You see, the blueberries just want to commune with nature.  But the waffles want to use the blueberries to conquer breakfast tables everywhere.  Help the blueberries as they fight for their lives!  You'll be playing for the chance to win $15 gift certificates to Amazon.com! <br><br>
This is a classic slingshot video game, played using only your mouse.  You shoot the blueberries at the waffles and each time you hit a waffle you earn a point for knocking the waffle out of nature.  Below is a screenshot of the game:<br><br><center>
<img src=\"instructions.gif\"></center><br><br>
On each level, there are 7 waffles.  You earn one point for each waffle that you hit, with a 3 point bonus if you knock off all 7 waffles in a level (a maximum of 10 points per level).  To load a blueberry, simply click the blueberry chute (the grey rectangle in the lower left of the screen).  Once the blueberry is loaded into the slingshot, pull the blueberry back and aim.  Fire the blueberry by releasing it.  It's that simple.  Watch out for obstacles in the level--if you hit the blackholes, it'll be a wasted shot.<br><br>
For each level, you will have $per blueberries that you can fire. ";

if ($_SESSION['cond']<2){
	echo "Once you use up your shots, you won't be able to use any more until you move to the next level.";
}
else{
	echo "After you use up these initial shots, you will begin to borrow shots from future levels.  Each additional shot (beyond the initial $per) used on a level will subtract two shots from the total remaining berries that you have.";
}

echo "<br><br>You can move on from a level whenever you want--just click the 'next' button near the top left of the screen.  You do not have to use all of your berries on each level.  Any unused berries will carry over to future levels.<br><br>The scoreboard will tell you how many berries you have fired on each round, how many berries remain for the game, how many points you've earned on the level, and how many points you've earned overall.  For each point, you'll earn an entry into a lottery for the $15 gift certificates. The more points you earn, the better your chances of winning!<br><br>
We'll get you started with a few practice rounds.  To begin, <a href='applet.php'>click here.</a> <b>Note: the game might take a few minutes to load, and you might see a blank screen until it loads.  Please be patient.</b>";

		}
		else{
			echo "<font color=\"#000000\">Sorry, but you have been denied access to this survey. <b>It appears that someone has already completed the survey 			from the computer you are using.  Only one survey may be completed per computer.</b>
			</font></body></html>";
		}
	
		
	



echo "</div>";
?>