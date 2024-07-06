var NX = 71;
var NY = 70;
var CELLW = 0;
var CELLH = 0;
var state = [];
var yum = [];
var difficulty = 1;
var pestilence = [];
var conwaymode = 0;
var conwaymix = [];
let isMovingLeft, isMovingRight, isMovingUp, isMovingDown;

var mouseMode = true;


function setup() {
	createCanvas(windowWidth, windowHeight);
	CELLW = windowWidth/NX;
	CELLH = windowHeight/NY;
  isMovingLeft = false;
  isMovingRight = false;
  isMovingUp = false;
  isMovingDown = false;
	zero();
	state[int(NX/2)][NY-5] = 1;
	frameRate(15);
}

function zero(){
	state = [];
	yum = [];
	pestilence = [];
	conwaymix = [];
	for (var i=0; i<NX; i++ ){
		state.push([]);
		yum.push([]);
		pestilence.push([]);
		conwaymix.push([]);
		for (var j=0; j<NY; j++) {
			state[i].push(0);
			yum[i].push(0);
			pestilence[i].push(0);
			conwaymix[i].push(0);
		}
	}
}

function draw() {
	noStroke();
	checkMouseMode();
	
	if (conwaymode == 0) {
  	handleKeys();		
		for (var i=0; i<NX; i++) {
			if (state[i][0] > 0){
				conwaymode = 15*5;
				for (var i=0; i<NX; i++ ){
					for (var j=0; j<NY; j++) {
						if (yum[i][j]>0 || pestilence[i][j]>0 || state[i][j]>0){
							conwaymix[i][j] = 1;
						}
					}
				}

			}
		}
	}
	
	if (conwaymode > 0) {
				for (var i=0; i<NX; i++ ){
					for (var j=0; j<NY; j++) {
						fill(conwaymix[i][j]*255);
						rect(CELLW*i, CELLH*j, CELLW, CELLH);
					}
				}
		
		let newconwaymix = [];
		let total = 0;
		for (var i=0; i<NX; i++ ){
			newconwaymix.push([]);
			for (var j=0; j<NY; j++) {
				newconwaymix[i].push(0);
				
				let nneighbors = 0;
				for (var i2 = -1; i2 <= 1; i2++){
					for (var j2 = -1; j2 <= 1; j2++){
						if (i2 == 0 && j2 == 0){
							continue;
						}
						let nbx = i2 + i;
						if (nbx < 0) {
							nbx = NX - nbx;
						}
						if (nbx >= NX) {
							nbx = nbx - NX;
						}
						let nby = j2 + j;
						if (nby < 0) {
							nby = NY - nby;
						}
						if (nby >= NY) {
							nby = nby - NY;
						}
						if (conwaymix[nbx][nby] > 0){
							nneighbors += 1;
						}
					}
				}
				//use torus
				
				// Any live cell with fewer than two live neighbours dies, as if by underpopulation.
				if (nneighbors < 2){
					newconwaymix[i][j] = 0;
				}

				// Any live cell with more than three live neighbours dies, as if by overpopulation.
				if (nneighbors > 3){
					newconwaymix[i][j] = 0;
				}
				
				// Any live cell with two or three live neighbours lives on to the next generation.
				// Any dead cell with exactly three live neighbours becomes a live cell, as if by reproduction.
				if (nneighbors == 3){
					newconwaymix[i][j] = 1;
				}
				
				total += conwaymix[i][j];
			}
		}
		conwaymix = newconwaymix;
		conwaymode -= 1;
		if (total == 0 || conwaymode <= 0){
			difficulty += 1;
			conwaymode = 0;
			zero();
			reset();
		}
		return;
	}
	
	let died = false;
	let found = false;
	let foundCoords = [];
	for (var i=NX-1; i>=0; i-- ){
		for (var j=0; j<NY; j++) {
			let R = 0;
			
			let depositedFlesh = false;
			if (state[i][j] > 0) {
				
				// self devouring ...
				if (yum[i][j] > 0) {
					state[i][j] += yum[i][j];
					if (state[i][j] > 1) {
						yum[i][j] = state[i][j] - 1;
						state[i][j] = 1;
					} else{
						yum[i][j] = 0;
					}
				}

				R = state[i][j] > 0 ? (55 + state[i][j] * 200) : 0;
				if(state[i][j] < 0.2){
					yum[i][j] = min(1, (yum[i][j] + (0.2 - state[i][j])*5));
					depositedFlesh = true;
				}
				state[i][j] -= random() * 0.04;

				found = true;
				foundCoords.push([i,j]);
				died = random(5) < pestilence[i][j];
			} else {
				state[i][j] = 0;
			}
			
			// ... & pestilent
			if (depositedFlesh){
				pestilence[i][j] = 0.001;
				// so fresh, so healthy xoxo
			} else {
				if (0 < pestilence[i][j] &&  pestilence[i][j] < 1){
					pestilence[i][j] += 0.001*difficulty;
				}
			}
			
			let G = yum[i][j] * 255;// <= 0 ? 0 : ( yum[i][j] * 155 + 100);
			//R += G/5;
			let B = pestilence[i][j] * 255;
			fill(color(R, G, B, 200));
			rect(CELLW*i, CELLH*j, CELLW, CELLH);
			
			// having a weird gravity...
			if (difficulty > 1) {
				let drip = random() * (0.01 * difficulty);
				if (yum[i][j] > drip){
					yum[i][j] -= drip;
					if (j < NY-1) {
						yum[i][j+1] += drip;
						if (difficulty > 2) {
							if  (pestilence[i][j+1] == 0) {
								pestilence[i][j+1] += 0.001;
							}
						}
					}
				}
			}
			if (yum[i][j] == 0){
				pestilence[i][j] -= 0.1;
			}
		}
	}
	if (died) {
		fill(color(255,0,0,100));
		for(var c =0; c<foundCoords.length; c++){
			state[foundCoords[c][0]][foundCoords[c][1]] = 0;
			yum[foundCoords[c][0]][foundCoords[c][1]] = 1;
			pestilence[foundCoords[c][0]][foundCoords[c][1]] = 1;
		}
		rect(0,0,windowWidth,windowHeight);
		found = false;
	}
	if (!found){
		reset();
	}
}

function reset(){
		state[int(random(NX))][NY-5] = 1;
		//state[int(NX/2)][NY-5] = 1; // TODO allow clones????
		//isMovingLeft = false;
		//isMovingRight = false;
		///isMovingUp = false;
		//isMovingDown = false;
}


function checkMouseMode() {
	return;

	// todo base these on where the current thing is
	let x1, x2, y1, y2;

	if (mouseMode) {	
		if (mouseX < x) {
			isMovingLeft = true;
			isMovingRight = false;
		}
		if (mouseX > x) {
			isMovingRight = true;
			isMovingLeft = false;
		}
		if (mouseY < y) {
			isMovingUp = true;
			isMovingDown = false;
			if (isMovingRight && y-mouseY > (mouseX - x)*1.5){
				isMovingRight = false;
			}
			if (isMovingLeft && y-mouseY > (x - mouseX)*1.5){
				isMovingLeft = false;
			}
		}
		if (mouseY > y) {
			isMovingDown = true;
			isMovingUp = false;
			if (isMovingRight && mouseY-y > (mouseX - x)*1.5){
				isMovingRight = false;
			}
			if (isMovingLeft && mouseY-y > (x - mouseX)*1.5){
				isMovingLeft = false;
			}
		}
	}
}
function mouseMoved() {
	if (!isMovingUp && !isMovingDown && !isMovingRight && !isMovingLeft){
		mouseMode = true;
	}
}

function keyPressed() {
	if (mouseMode) {
		mouseMode = false;
		isMovingUp = false;
		isMovingDown = false;
		isMovingLeft = false;
		isMovingRight = false;
	}
  if (key === 'w' || key === 'W' || keyCode === UP_ARROW) {
    isMovingUp = true;
  }
  if (key === 's' || key === 'S' || keyCode === DOWN_ARROW) {
    isMovingDown = true;
  }
  if (key === 'a' || key === 'A' || keyCode === LEFT_ARROW) {
    isMovingLeft = true;
  }
  if (key === 'd' || key === 'D' || keyCode === RIGHT_ARROW) {
    isMovingRight = true;
  }
}

function keyReleased() {
	if (mouseMode) {
		mouseMode = false;
		isMovingUp = false;
		isMovingDown = false;
		isMovingLeft = false;
		isMovingRight = false;
	}
  if (key === 'w' || key === 'W' || keyCode === UP_ARROW) {
    isMovingUp = false;
  }
  if (key === 's' || key === 'S' || keyCode === DOWN_ARROW) {
    isMovingDown = false;
  }
  if (key === 'a' || key === 'A' || keyCode === LEFT_ARROW) {
    isMovingLeft = false;
  }
  if (key === 'd' || key === 'D' || keyCode === RIGHT_ARROW) {
    isMovingRight = false;
  }
}

function handleKeys() {
	let x=0, y=0;
  if (isMovingUp) {
    y -= 1;
  }
	if (isMovingDown) {
    y += 1;
  }
  if (isMovingLeft) {
    x -= 1;
  }
  if (isMovingRight) {
    x += 1;
  }
	
	if (x == 0 && y ==0 ){
		return
	}
	
	for (var i=0; i<NX; i++ ){
		for (var j=0; j<NY; j++) {
			if (state[i][j] > 0) {
				let newx = i+x;
				if (newx < 0){
					newx = NX-1;
				}
				if (newx >= NX){
					newx = 0;
				}
				if (newx >= 0 && newx < NX && j+y >= 0 && j+y < NY ){
					state[newx][j+y] = state[i][j];
					state[i][j] = 0;
					return;
				}
			}
		}
	}
}
