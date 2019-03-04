// See MatterJS getting started: https://github.com/liabru/matter-js/wiki/Getting-started
// Look at slingshot example on GitHub: https://github.com/liabru/matter-js/blob/master/examples/slingshot.js
// which can be tried out here: http://brm.io/matter-js/demo/#slingshot

$(document).ready(function()
{
	if(window.location.href.indexOf("localhost") > -1)
		debug = true;

	if(debug)
		console.log("Ready");

	initialize()
});


var debug = false; // Set to true to enable some console logs


// Collision Filters
var defaultFilterCategory = 0x0001;
var blueberryFilterCategory = 0x0002;
var standFilterCategory  = 0x0004;
var waffleFilterCategory  = 0x0008;
var wafflesList = [];
var waffleIdsRemoved = {};

// CONFIG - Initial settings for score stuff
// These can be set using query params
var berriesPerLevel = 4; // berries given for the level ("lberries" query param)
var initialBankBerries = 25; // starting value of shown "total berries" aka bank ("bankberries" query param)
var berryBankPenalty = 3; // cost of using one bank berry ("bankpenalty" query param)
// (e.g. with penalty of 3, shooting twice deducts 6 from bank). If -1 cannot use berry bank (level ends if out?)

// Score display values
var levelBerries = 0;
var bankBerries = initialBankBerries; // displayed as "Total Berries"
var levelPoints = 0;
var totalPoints = 0;

var levelNumber = 0;
var practicing = true;
var runningSimulation = true;

// Trace variables
var tracePoints = {}; // waffles hit with each berry
var traceTimes = {}; // time each blueberry took to fire

// Engine to be made
var engine;

// Elastic variables
var elastic;
var anchor;

// World objects
var currentBlueberry; // currently loaded blueberry

var currentBars = []; // current vertical and horizontal bars (obstacles)
var currentObjects = []; // current waffles & holes
var currentBerries = []; // current berries that have been fired

var gridObjs = []; // the grid objects that stand in for waffles for simulation
var hitGridObjects = []; // coordinates for grid objects (waffle stand ins) that were hit during simulation

// Create Matter world
function initialize()
{
	// Get the condition state from the param
	var conditionParam = parseInt($("param").attr("value"));

	/**
	 * If it reads 0 from the condition file, then it will set
	 * lberries to 3, bankberries to 30, and bankpenalty to -1
	 * If it reads 1, lberries=15, bankberries=150, bankpenalty=-1
	 * If 2, lberries=3, bankberries=30, bankpenalty=2
	 * If 3, lberries=15, bankberries=150, bankpenalty=2
	 */

	if(debug)
		console.log("Condition Param: " + conditionParam);

	if(conditionParam == 0)
	{
		berriesPerLevel = 3;
		initialBankBerries = 30;
		berryBankPenalty = -1
	}
	else if(conditionParam == 1)
	{
		berriesPerLevel = 15;
		initialBankBerries = 150;
		berryBankPenalty = -1;
	}
	else if(conditionParam == 2)
	{
		berriesPerLevel = 3;
		initialBankBerries = 30;
		berryBankPenalty = 2;
	}
	else if(conditionParam == 3)
	{
		berriesPerLevel = 15;
		initialBankBerries = 150;
		berryBankPenalty = 2;
	}

	bankBerries = initialBankBerries;

	// Set variables from URL
	var queryParams = window.location.search.substr(1); // strips '?' from string start (e.g. '?query1=34&query2=15' -> 'query1=34&query2=15')
	var paramsArray = queryParams.split("&"); // split queries by ampersand to an array (e.g. 'query1=3&query2=5' -> ['query1=3', 'query2=5'])
	var paramsHash = {}; // hash of query params for later
	var paramBroken = []; // broken up param by splitting on equals (e.g. 'query1=3' -> ['query1', '3'])

	paramsArray.forEach(function(paramString)
	{
		paramBroken = paramString.split('=');
		if(paramBroken.length == 2)
			paramsHash[paramBroken[0]] = paramBroken[1]; // hash[query_key] = query_value
	});

	if(paramsHash["lberries"] && parseInt(paramsHash["lberries"]))
		berriesPerLevel = parseInt(paramsHash["lberries"]);

	if(paramsHash["bankberries"] && parseInt(paramsHash["bankberries"]))
	{
		initialBankBerries = parseInt(paramsHash["bankberries"]);
		bankBerries = initialBankBerries;
	}

	if(paramsHash["bankpenalty"] && parseInt(paramsHash["bankpenalty"]))
		berryBankPenalty = parseInt(paramsHash["bankpenalty"]);

	// module aliases
	var Engine = Matter.Engine,
		Render = Matter.Render,
		World = Matter.World,
		Bodies = Matter.Bodies,
		Vector = Matter.Vector;

	// create an engine
	engine = Engine.create({
		enableSleeping: true,
	});

	engine.world.gravity.scale = 0.00025;

	// create a renderer
	var render = Render.create({
		element: $("#container")[0],
		engine: engine,
		options: {
			background: "url('img/bg.jpg')",
			wireframes: false,
			width: 720,
			height: 500,
		}
	});

	var intersectingWaffles = [];

	// Setup bounds of the game with four "walls"
	var ground = Bodies.rectangle(360, 520, 720, 40, { isStatic: true, label: "wall-ground", restitution: 1, collisionFilter: { category: defaultFilterCategory } } );
	var ceiling = Bodies.rectangle(360, -20, 720, 40, { isStatic: true, label: "wall-ceiling", restitution: 1, collisionFilter: { category: defaultFilterCategory } } );
	var leftWall = Bodies.rectangle(-20, 250, 40, 500, { isStatic: true, label: "wall-left", restitution: 1, collisionFilter: { category: defaultFilterCategory } } );
	var rightWall = Bodies.rectangle(740, 250, 40, 500, { isStatic: true, label: "wall-right", restitution: 1, collisionFilter: { category: defaultFilterCategory } } );

	// Create the basic stand
	var stand = Bodies.rectangle(100, 448, 20, 100, { render: {fillStyle: "#646464", strokeStyle: "black"}, isStatic: true, sleepThreshold: -1, collisionFilter: { mask: null } });

	// Spawn the first blueberry
	currentBlueberry = spawnBlueberry();

	// Setup score stuff
	loadLevelScores();

	// Setup the slingshot
	anchor = { x: 100, y: 400 };
	elastic = Matter.Constraint.create({
		pointA: anchor,
		bodyB: currentBlueberry,
		stiffness: 0.05,
	});

	// add all of the bodies to the world - order determines render order
	World.add(engine.world, [ground, leftWall, rightWall, ceiling, stand, elastic, currentBlueberry]);

	// Spawn all waffles, holes, and obstacle bars
	setupLevel();

	// add mouse control
	var mouse = Matter.Mouse.create(render.canvas);

	var mouseConstraint = Matter.MouseConstraint.create(engine, {
		mouse: mouse,
		collisionFilter: { mask: blueberryFilterCategory },
		constraint: {
			stiffness: 1,
			render: {
				visible: false
			}
		}
	});

	World.add(engine.world, mouseConstraint);

	// keep the mouse in sync with rendering
	render.mouse = mouse;

	// run the engine
	Engine.run(engine);

	// run the renderer
	Render.run(render);

	// Add afterRender hook to draw UI, which is done custom on the canvas
	Matter.Events.on(render, "afterRender", function()
	{
		var ctx = render.canvas.getContext('2d'); // fetch the canvas

		// Draw main UI of status text
		ctx.font = '22px unmaskedBB';
		ctx.fillStyle = "black";
		ctx.fillText('Level Berries: '	+ levelBerries,10, 20);
		ctx.fillText('Total Berries: '	+ bankBerries, 180, 20);
		ctx.fillText('Level Points: '	+ levelPoints, 370, 20);
		ctx.fillText('Total Points: '	+ totalPoints, 520, 20);
	});

	// Add afterUpdate hook for mouse handling
	Matter.Events.on(engine, 'afterUpdate', function()
	{
		// Spawn blueberry on click of the stand
		// specifically check if mouse is over the stand using a query, then check for left mouse click
		if(Matter.Query.point([stand], mouseConstraint.mouse.position).length == 1
			&& mouseConstraint.mouse.button == 0 && elastic.bodyB == null && !runningSimulation)
		{
			loadSlingBlueberry();
		}

		// If a blueberry is attached to the slingshot, the blueberry is over the anchor and moving, and the mouse has been let go, detach the blueberry
		if (elastic.bodyB && mouseConstraint.mouse.button === -1 && Vector.magnitude(currentBlueberry.velocity) > 3 && Vector.magnitude(Vector.sub(currentBlueberry.position, anchor)) < 20)
		{
			elastic.bodyB.collisionFilter = { category: defaultFilterCategory, mask: defaultFilterCategory }; // reset collision filter so blueberry isn't draggable
			elastic.bodyB = null;
			elastic.pointB = anchor;

			if(!runningSimulation) // only track points if this is the actual GAME
				blueberryFired();
		}
		else if(elastic.bodyB && mouseConstraint.mouse.button !== -1)
		{
			var maxDistance = 90;
			var towardsAnchor = Vector.sub(anchor, currentBlueberry.position);
			var distance = Matter.Vector.magnitude(towardsAnchor);

			if(distance > maxDistance)
			{
				// compute position by creating the diff between the anchor and berry we want
				var properPosition = Vector.sub(anchor, Vector.mult(towardsAnchor, (maxDistance/distance)));
				Matter.Body.setPosition(elastic.bodyB, properPosition);
				Matter.Body.setAngularVelocity(elastic.bodyB, 0); // disable rotation
			}
		}

		if (currentBlueberry)
		{
			if(runningSimulation)
			{
				var intersectingGrids = Matter.Query.region(gridObjs, currentBlueberry.bounds); // check for grids hit
				intersectingGrids.forEach(function(object)
				{
					if(hitGridObjects.indexOf(object.position) == -1) // if not already in list
						hitGridObjects.push(object.position); // push it
				});
			}
			else
			{
				for(var i = 0; i < currentBerries.length; i++)
				{
					var currBerry = currentBerries[i];

					if(currBerry == elastic.bodyB) // if still attached to slingshot
						continue; // skip it

					var intersectingWaffles = Matter.Query.region(wafflesList, currBerry.bounds); // check for waffles that intersect, since they do not have collision on (to prevent momentum loss)
					World.remove(engine.world, intersectingWaffles);

					intersectingWaffles.forEach(function(waffle)
					{
						hitWaffle(waffle, currBerry.id);
					});
				}
			}
		}
	});

	// On drag end, cut velocity on berry
	Matter.Events.on(mouseConstraint, "enddrag", function()
	{
		if(elastic.bodyB)
			Matter.Body.setVelocity(elastic.bodyB, {x: 0, y: 0});
	});

	// Collision detection
	Matter.Events.on(engine, "collisionStart", function(data)
	{
		var bodyA = data.pairs[0].bodyA;
		var bodyB = data.pairs[0].bodyB;
		var labelA = bodyA.label;
		var labelB = bodyB.label;

		// Blueberry is always the second contact body, so check for that before continuing
		if(labelB == "blueberry")
		{
			if(labelA == "hole") // on hole & blueberry collision, remove the blueberry
			{
				World.remove(engine.world, [bodyB]);

				if(!canFireBlueberry())
					checkLevelEnd();
			}
		}
	});

	// Setup next button click event
	$("#next-btn").click(function() {
		// If next button is pressed when not loading, send store message
		// unless out of berries in non-practice round, which is handled by demographics.php
		if(!runningSimulation && (practicing || bankBerries > 0))
			sendStoreMessage();

		if(bankBerries > 0) // if you have berries allow next level
			nextLevel();
		else
			outOfBlueberries();
	});
}

// Loads a blueberry into the slingshot and sets up elastic for it
function loadSlingBlueberry(isSimulation)
{
	if(canFireBlueberry() || isSimulation) // don't worry about having berries to fire if simulating
	{
		// Spawn blueberry and update elastic connection
		currentBlueberry = spawnBlueberry();
		Matter.World.add(engine.world, currentBlueberry);
		elastic.pointB = {x: 0, y: 0};
		elastic.bodyB = currentBlueberry;

		// if not a simulated blueberry, track when it was loaded and set zero points
		if(!isSimulation)
		{
			traceTimes[currentBlueberry.id] = new Date();
			tracePoints[currentBlueberry.id] = 0;
		}
	}
}

// Spawn a blueberry at the slingshot stand and return it
function spawnBlueberry()
{
	return Matter.Bodies.circle(100, 400, 9, { render: {sprite: { texture: "img/bb.gif" } }, label:"blueberry",
		sleepThreshold: -1, collisionFilter: { category: blueberryFilterCategory }, restitution: 1, friction: 0});
}

// Call back after a blueberry has been fired. Handles the blueberry counter
function blueberryFired()
{
	if(levelBerries < berriesPerLevel) // if still have berries left for this level
	{
		levelBerries++; // indicate we fired a berry
		bankBerries--; // and bank by one
	}
	else // otherwise
	{
		levelBerries++; // indicate we fired a berry
		bankBerries -= berryBankPenalty; // remove from bank at the penalty rate
	}

	if(bankBerries <= 0)
		bankBerries = 0; // fix potential negative bank value

	currentBerries.push(currentBlueberry);

	// set tracetimes to time since loaded this berry
	traceTimes[currentBlueberry.id] = new Date() - traceTimes[currentBlueberry.id];

	var selfBerry = currentBlueberry;

	// If on fire you have more berries, just self destroy on timeout
	if(canFireBlueberry())
	{
		// Self destruct in 15 seconds
		setTimeout(destroyBerry, 15000);
	}
	else
	{
		setTimeout(function()
		{
			// only continue if we sucessful destroyed the berry. Otherwise we're on a new level
			// this can happen if a player fires off the last blueberry then hits next level before it has to be
			if(destroyBerry())
			{
				checkLevelEnd();
			}
		}, 15000);
	}


	function destroyBerry()
	{
		var berryIndex = currentBerries.indexOf(selfBerry);

		if(berryIndex != -1)
		{
			currentBerries.splice(berryIndex, 1);
			Matter.World.remove(engine.world, selfBerry);
			return true;
		}
		else
		{
			return false; // didn't destroy berry, since it's already gone
		}
	}
}

// Handles logic for the next button and end of level transitioning
function nextLevel()
{
	if(runningSimulation) // prevent next level working when loading
		return;

	if(levelNumber == 3 && practicing) // if this is the fourth practice level
	{
		endPractice(); // end practice
	}
	else
	{
		levelNumber++;
		loadLevelScores();
		setupLevel();
	}
}

// Sets up the world for a new level
function setupLevel()
{
	// Remove objects from the world
	Matter.World.remove(engine.world, currentObjects);
	Matter.World.remove(engine.world, currentBars);
	Matter.World.remove(engine.world, currentBerries);
	currentBerries = [];
	wafflesList = []; // empty out waffle list to prevent collision with skipped waffles

	if(currentBlueberry)
	{
		Matter.World.remove(engine.world, currentBlueberry);
		currentBlueberry = null;
	}

	spawnBars();
	spawnObjects();
}

// Loads score values for current level
function loadLevelScores()
{
	levelBerries = 0;
	levelPoints = 0;
}

// Returns a boolean indicating whether the user can fire a blueberry
function canFireBlueberry()
{
	return (levelBerries < berriesPerLevel && bankBerries > 0) // if you haven't hit penalty and have shots left
			|| (bankBerries > 0 && berryBankPenalty > -1); // if you can use the bank (penalty != -1) and there's a shot left in the bank
}

// Called when you cannot fire another blueberry on the current level
function checkLevelEnd()
{
	// Send message unless out of berries in non-practice round, which is handled by demographics.php
	if(practicing || bankBerries > 0)
		sendStoreMessage();

	if(berryBankPenalty > -1) // if you can use the bank, they are out of blueberries
		outOfBlueberries();
	else if(bankBerries > 0) // if you cannot use the bank as a loan, but have some in the bank, skip to next level
		nextLevel();
	else // if you cannot use the bank and have none in there anyway, game over
		outOfBlueberries();
}


// Called when a player is out of blueberries
function outOfBlueberries()
{
	if(practicing == true) // if practice, reset stuff, show new message and continue
		endPractice();
	else
	{
		//window.location.href = window.location.href.replace("applet.php", "demographics.php" + getDataParameters());
	}
}

// Ends practice - resets data and loads next level with message
function endPractice()
{
	// Reset bank berries and score
	bankBerries = initialBankBerries;
	totalPoints = 0;

	// levelNumber = 0; // reset level number

	practicing = false; // disable practice mode

	nextLevel(); // load next level

	$("#game, .loading").show(); // show game text and loading
}

// Spawns the seven level waffles and two holes
function spawnObjects()
{
	// Checks all other objects and hit possibility space and returns if these coordinates are a hit grid spot
	function inHitGrids(xCoordinate, yCoordinate)
	{
		var overlap = false;

		// Check remaining locations in the hit possiblity space
		hitGridObjects.forEach(function(object)
		{
			if(object.x == xCoordinate && object.y == yCoordinate)
				overlap = true;
		});

		// Check already spawned objects (like waffles)
		currentObjects.forEach(function(object)
		{
			if(object.position.x == xCoordinate && object.position.y == yCoordinate)
				overlap = true;
		});

		return overlap;
	}

	// Gets random potential coordinates for an object returned in an array [x, y]
	function randomCoordinates()
	{
		randomX = 30 * Math.round(Math.random() / 30 * (720 - 210))  + 210 - 15;
		randomY = 30 * Math.round(Math.random() / 30 * (500 - 50)) + 50 - 15;
		return [randomX, randomY];
	}

	// Spawns boxes to fill the entire play space for capturing hit volume
	function spawnGridBoxes()
	{
		if(gridObjs.length > 0) // if grid objects have already been spawned
			return; // don't bother

		// Playable grid size is (720 - 210)/30 by (500 - 50)/30 = 17 by 15
		for(var x = 0; x < 18; x++)
		{
			for(var y = 0; y < 16; y++)
			{
				spawnGridObject(30 * x + 210 - 15, 30 * y + 50 - 15);
			}
		}

		Matter.World.add(engine.world, gridObjs);

		function spawnGridObject(x_in, y_in)
		{
			var gridObj = Matter.Bodies.rectangle(x_in, y_in, 30, 30, { render: {visible: false}, label: "grid-obj",
				isStatic: true, collisionFilter: { category: waffleFilterCategory } });
			gridObjs.push(gridObj);
		}
	}

	function simulateBerry()
	{
		if(debug)
			console.log("simulateBerry()");
		if(!currentBlueberry) // if no berry atm, spawn one
			loadSlingBlueberry(true);

		hitGridObjects = []; // clear hit grid objects, since new berry simulation

		// Prevent blueberry from being draggable, and make it sleep
		currentBlueberry.collisionFilter = { category: defaultFilterCategory, mask: defaultFilterCategory }; // reset collision filter so blueberry isn't draggable
		currentBlueberry.sleepThreshold = 10;
		currentBlueberry.render.visible = false;

		// Setup random launch location
		Matter.Body.setPosition(currentBlueberry, {x: randomRange(20, 90), y: randomRange(410, 480)});

		Matter.Events.on(currentBlueberry, 'sleepStart', onBerrySimulateEnd);
	}

	// Called when the berry goes to sleep (stops moving)
	function onBerrySimulateEnd()
	{
		if(debug)
			console.log("onBerrySimulateEnd()");
		Matter.World.remove(engine.world, currentBlueberry); // remove the berry from the world
		currentBlueberry = null;
		currentBerries = []; // also empty currentBerries array

		if(hitGridObjects.length < 10) // the berry didn't really hit much, so rerun
			simulateBerry();
		else
			spawnFinalObjects();
	}

	function spawnFinalObjects()
	{
		if(debug)
			console.log("spawnFinalObjects()");
		currentObjects = []; // clear old objects from array

		// We need to spawn 9 items total - 7 waffles & 2 holes, so run nine times
		for(var i = 0; i < 9; i++)
		{
			// Slingshot is at x = 100
			// World is 720 wide by 500 tall
			// Waffles are 30px by 30px, so need distance from world edge (esp. top with UI)
			// From old project range is 210 < x < 720, 50 < y < 500. Processing and Matter.js
			// seem to spawn objects differently, so we subtract 15 to prevent passing world edges

			if(i <= 6) // waffles spawn at a random hitGridObject
			{
				var randomHitGridIndex = randomRange(0, hitGridObjects.length - 1)
				var randomHitGridObj = hitGridObjects[randomHitGridIndex]; // grab a hit grid to spawn a waffle at
				hitGridObjects.splice(randomHitGridIndex, 1); // and remove it from array
				currObj = spawnWaffle(randomHitGridObj.x, randomHitGridObj.y);
			}
			else
			{
				// Random numbers setup as random * range + min. Note that Math.random is in the range (0, 1)
				randomCoords = randomCoordinates(); // get random coordinates

				// and regenerate till no overlap with hit grids
				while(inHitGrids(randomCoords[0], randomCoords[1]))
				{
					randomCoords = randomCoordinates();
				}

				// Useful for debugging
				// console.log("Object" + (i+1) + " - (" + randomCoords[0] + "," + randomCoords[1] + ")");

				currObj = spawnHole(randomCoords[0], randomCoords[1]);
			}

			currentObjects.push(currObj);
		}

		Matter.World.add(engine.world, currentObjects);

		// We're done!
		runningSimulation = false; // indicate we're done with runningSimulation = false

		$(".message, .loading").hide(); // and hiding loading
	}

	// The main function execution
	var currObj, randomX, randomY, randomCoords;

	// Time to simulate
	runningSimulation = true; // mark runningSimulatiojn
	$(".loading").show(); // and show loading

	spawnGridBoxes();
	simulateBerry();
}

// Spawn a waffle at a given location
function spawnWaffle(x, y)
{
	var waffle = Matter.Bodies.rectangle(x, y, 30, 30, {  render: {sprite: { texture: "img/waffle.jpg" }}, label: "waffle",
		isStatic: true, sleepThreshold: -1, collisionFilter: { category: waffleFilterCategory } });
	wafflesList.push(waffle);
	return waffle;
}

// Function for when a waffle was hit. Handles score implementing and tracking if the waffle has been hit before
function hitWaffle(waffle, berryId)
{
	if(waffleIdsRemoved[waffle.id] == undefined) // if this waffle has not been removed
	{
		// increment score
		levelPoints++;
		totalPoints++;

		// set or increment tracePoints for this berry
		if(berryId in tracePoints)
			tracePoints[berryId]++;

		if(levelPoints == 7) // if all waffles cleared - grant 3 point bonus and go to next level
		{
			levelPoints += 3;
			totalPoints += 3;

			// Send message unless out of berries in non-practice round, which is handled by demographics.php
			if(practicing || bankBerries > 0)
				sendStoreMessage();

			if(practicing && (levelNumber == 3 || !canFireBlueberry())) // if finished fourth practice round or out of berries
			{
				endPractice(); // end practice
			}
			else
			{
				if(bankBerries > 0) // if you have berries allow next level
					nextLevel();
				else
					outOfBlueberries();
			}
		}

		// and store that it has been removed
		waffleIdsRemoved[waffle.id] = true;
	}
}

// Spawn a black hole at a given location
function spawnHole(x, y)
{
	return Matter.Bodies.circle(x, y, 15, { render: {sprite: { texture: "img/hole.gif" } }, label: "hole",
		isStatic: true, sleepThreshold: -1, collisionFilter: { category: defaultFilterCategory } });
}

// Spawns the vertical and horizontal bars that are in a level
function spawnBars()
{
	var rows = 1 / 30 * (720 - 210);
	var cols = 1 / 30 * (500 - 50);

	var barsToSpawn = randomRange(1, 3); // Goes from 1 to 3
	var currBarr;
	currentBars = []; // reset to empty bars array

	for(var i = 0; i < barsToSpawn; i++)
	{
		// Note: Old code used a random range that excluded the upper bound
		// since this randomRange includes the upper bound, all upper bounds are one lower

		if(levelNumber == 0 || practicing == true)
		{
			if(randomRange(1, 3) == 1) // 33% probability vertical
				currBarr = spawnBar(randomRange(0, cols-3) * 30 + 210, randomRange(4, rows-4) * 30 + 50, 100, false);
			else // horizontal
				currBarr = spawnBar(randomRange(0, cols-3) * 30 + 210, randomRange(4, rows-4) * 30 + 50, 100, true);
		}
		else
		{
			if(randomRange(1, 3) == 1) // 33% probability vertical
				currBarr = spawnBar(randomRange(0, cols-3) * 30 + 210, randomRange(0, rows-4) * 30 + 50, 100, false);
			else // horizontal
				currBarr = spawnBar(randomRange(0, cols-3) * 30 + 210, randomRange(0, rows-4) * 30 + 50, 100, true);
		}

		currentBars.push(currBarr);
	}

	Matter.World.add(engine.world, currentBars);
}

// Spawns a bar
function spawnBar(topX, topY, length, isHorizontal)
{
	if(isHorizontal)
		return Matter.Bodies.rectangle(topX, topY, length, 3, { render: {fillStyle: "#646464", strokeStyle: "black"}, isStatic: true, sleepThreshold: -1 });
	else
		return Matter.Bodies.rectangle(topX, topY, 3, length, { render: {fillStyle: "#646464", strokeStyle: "black"}, isStatic: true, sleepThreshold: -1 });
}

function randomRange(min, max)
{
	return Math.round(Math.random() * (max - min)) + min;
}

// sends message to store.php
function sendStoreMessage(page)
{
/*	var url = "store.php" + getDataParameters();

	if(debug)
		console.log("SEND STORE MESSAGE - " + url);

	$.ajax({
		url: url,
		success: function()
		{
			if(debug)
				console.log("Send store message success!");
		}
	});

	// After sending data, cleanup and clear it
	tracePoints = {};
	traceTimes = {};*/
}

// gets data parameters for sending current state data
function getDataParameters()
{
	// This is sent once per level. traceTimes is the time spent firing each blueberry (time between loading it in and letting go)
	// tracePoints is waffles hit for each blueberry shot.
	// Ex: 4 blueberries were shot. traceTimes = 250_300_100_2000. tracePoints = 2_3_0_2.
	// This means the player took 250ms, 300ms, 100ms, and 2s to shoot the four blueberries. It also means the waffle hit 2, 3, 0, and 2 waffles on each shot (in order).


	var tracePointsArr = [];
	var traceTimesArr = [];

	for(var blueberryId in tracePoints)
	{
		tracePointsArr.push(tracePoints[blueberryId]);
		traceTimesArr.push(traceTimes[blueberryId]);
	}

	var tracePointsString = tracePointsArr.join("_") + "_";
	var traceTimesString = traceTimesArr.join("_") + "_";

	var url = "?count=" + levelNumber + "&lberries=" + levelBerries + "&lpoints=" + levelPoints + "&trace=" + tracePointsString + "&tracetimes=" + traceTimesString;

	if(practicing && (levelNumber == 3 || !canFireBlueberry())) // if last practice round or cannot fire berries, end practice
		url = url + "&endpractice=true";

	return url;
}