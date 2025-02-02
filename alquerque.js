// Elliot Rippe
// 9/20/17

var gl;
var points = []; // holds points
var canvas;
var squares = []; // holds squares
var boardColor;
var squareCenter = [];
var index = 0;
var vColor = [];
var vBuffer;
var piece; // holds value of piece being moved
var click = true; 
var side = 0.05; // side of square


window.onload = function init()
{
	console.log("Welcome to Alquerque!");
    canvas = document.getElementById( "gl-canvas" );
    
    gl = WebGLUtils.setupWebGL( canvas );
    if ( !gl ) { alert( "WebGL isn't available" ); }
		
	//  Configure WebGL
    
    gl.viewport( 0, 0, canvas.width, canvas.height);
    gl.clearColor( 1.0, 1.0, 1.0, 1.0 );
    
    //  Load shaders and initialize attribute buffers
    
    var program = initShaders( gl, "vertex-shader", "fragment-shader" );
    gl.useProgram( program );	
		
	// Sets board color	
	boardColor = vec4(1.0, 0.0, 0.0, 1.0);
	
	pushSquares();
	board();
	setPieces();
    
    // Load the data into the GPU
    
    var bufferId = gl.createBuffer();
    gl.bindBuffer( gl.ARRAY_BUFFER, bufferId );
    gl.bufferData( gl.ARRAY_BUFFER, flatten(points), gl.STATIC_DRAW );

    // Associate out shader variables with our data buffer
    
    var vPosition = gl.getAttribLocation( program, "vPosition" );
    gl.vertexAttribPointer( vPosition, 2, gl.FLOAT, false, 0, 0 );
    gl.enableVertexAttribArray( vPosition );
	
	vColorLoc = gl.getUniformLocation(program, "vColor");
	document.getElementById("Restart").onclick = restartGame;
	
	canvas.addEventListener("click", mouse)
	render();
}

function mouse() {
	gl.bindBuffer(gl.ARRAY_BUFFER, vBuffer);
	gl.bufferSubData(gl.ARRAY_BUFFER, sizeof['vec2']*index, flatten(t));
	var t = vec2(2*event.clientX/canvas.width-1,2*(canvas.height-event.clientY)/canvas.height-1);
		for (var i = 0; i < 24; i++){
			var xmax = squareCenter[i][0] + (side/2.000);
			var ymax = squareCenter[i][1] + (side/2.000);
			var xmin = squareCenter[i][0] - (side/2.000);
			var ymin = squareCenter[i][1] - (side/2.000);
		
			if(t[0] <= xmax && t[0] >= xmin && t[1] <= ymax && t[1] >= ymin){
				console.log("Location " + (i+1) + " selected.");
				if(click){ 
					click = !click;
					piece = i; // stores value of piece to be moved
				}
				else if(!click){
					click = !click;
					if(squares[piece] == 1){
						vColor[i] = vec4(0.0,1.0,0.0,1.0); // set color to green
						squares[i] = 1; // new square to green
						squares[piece] = 0; // sets piece to be moved to 0
					}					
					else if(squares[piece] == 2){
						vColor[i] = vec4(0.0,0.0,1.0,1.0); // set color to blue
						squares[i] = 2; // new square value to blue
						squares[piece] = 0; // sets piece to be moved to 0
					}
				}
			}
		}
}




function board(){
	var x = -0.8;
	var y = -0.8;
	var xChange = .4;
	var yChange = .4;
	
	console.log("Drawing Board...");

	//draws diagonal lines and diamonds
	points.push(vec2(x, yChange*4+y));
	points.push(vec2(xChange*4+x, y));
	points.push(vec2(x, y));
	points.push(vec2(xChange*4+x, yChange*4+y));
	points.push(vec2(x, yChange*2+y));
	points.push(vec2(xChange*2+x, yChange*4+y));
	points.push(vec2(x, yChange*2+y));
	points.push(vec2(xChange*2+x, y));
	points.push(vec2(xChange*2+x, yChange*4+y));
	points.push(vec2(xChange*4+x, yChange*2+y));
	points.push(vec2(xChange*2+x, y));
	points.push(vec2(xChange*4+x, yChange*2+y));
	
	//vertical lines
	for (i = 0; i < 5; i++){
		points.push(vec2(i*xChange + x, y));
		points.push(vec2(i*xChange + x, yChange*4 + y));
	}
	//horizontal lines
	for (i = 0; i < 5; i ++){
		points.push(vec2(x, i*yChange + y));
		points.push(vec2(xChange*4 + x, i*yChange + y));
	}
	
}

function setPieces(){
	//sets squares onto board
	var x = -.8;
	var y = -.8;
	var xdist = .4;
	var ydist = .4;
	
	console.log("Setting up pieces...");
	for (i = 0; i < 5; i++){
		for (j = 0; j < 5; j++){
			squareCenter.push(vec2(xdist*i + x, ydist*(4-j) + y));
			if (squares[i*5+j] == 1){ //if green square
				square(squareCenter[i*5+j][0],squareCenter[i*5+j][1], vec4(0.0,1.0,0.0,1.0));
			}
			else if (squares[i*5+j] == 2){  //if blue square
				square(squareCenter[i*5+j][0],squareCenter[i*5+j][1], vec4(0.0,0.0,1.0,1.0));
			}
			else{  //if invisible square
				square(squareCenter[i*5+j][0],squareCenter[i*5+j][1], vec4(0.0,0.0,0.0,0.0));
			}
		}
	}

}

function square(x, y, color){ // pushed square points to be drawn
	points.push(vec2(x - side/2, y + side/2));
	points.push(vec2(x + side/2, y + side/2));
	points.push(vec2(x - side/2, y - side/2));
	points.push(vec2(x + side/2, y + side/2));
	points.push(vec2(x - side/2, y - side/2));
	points.push(vec2(x + side/2, y - side/2));
	vColor[index] = color;
	index++;
}

function pushSquares() {
	//push squares into squares array
	for(x = 0; x < 12; x++){
		squares[x] = 1;
		vColor[x] = vec4(0.0,1.0,0.0,1.0);
	}
	squares.push(0);
		
	for(x = 0; x < 12; x++){
		squares[x+13] = 2;
		vColor[x+13] = vec4(0.0,0.0,1.0,1.0);
	}
}

function render() {
    gl.clear( gl.COLOR_BUFFER_BIT );
	gl.uniform4fv(vColorLoc, boardColor);
	gl.drawArrays( gl.LINES, 0,  32);
	for(i = 0; i < 25; i++){
		gl.uniform4fv(vColorLoc, vColor[i]);
			if (squares[i] != 0) {
				gl.drawArrays(gl.TRIANGLES, 32+i*6, 6); // shown squares
			}
			else {
				gl.drawArrays(gl.POINTS, 32+i*6, 6); // hidden squares
			}
	}		
	window.requestAnimFrame(render);
}

function restartGame() { // restart button function
	window.location.reload();
}

