//Canvas elements
const bgLayer = document.getElementById('droneMap');
bgLayer.width = 1200//Math.max(800, window.innerWidth * 0.5);
bgLayer.height = 700;
var canvRect = bgLayer.getBoundingClientRect();
const ctx = bgLayer.getContext('2d');

//Grid properties
var squareSize = 50;
var gridColumns = Math.ceil(bgLayer.width/squareSize);
var gridRows = Math.floor(bgLayer.height/squareSize);
var gridColor = "RGBA(50,50,50,0.3)";

//Map properties
var mapCurrentX = 0;
var mapCurrentY = 0;

//With canvas now defined, load the map image
const roverVert = new Image();
roverVert.src = "Mars-Rover_down.png";

const roverLeft = new Image();
roverLeft.src = "Mars-Rover_left.png";

const roverRight = new Image();
roverRight.src = "Mars-Rover_right.png";

var alienDevice = new Image();
alienDevice.src = "alien_device.png";

var battery1 = new Image();
battery1.src = "battery.png";

var battery2 = new Image();
battery2.src = "battery.png";

var mapBG = new Image();
mapBG.src = "mars-water.jpg";

mapBG.onload = function(){

    buildGrid();

    drawMap();
    drawGrid();
    drawIcons();
    drawRover();
}

loop_need_action = false;
loop_need_num = false;
gameOver = false;

function drawMap(){
    
    ctx.drawImage(
        mapBG,
        mapCurrentX, 
        mapCurrentY, 
        bgLayer.width,
        bgLayer.height
    );
    
}

function Square(index, x, y) {
    //Base stats
    this.index = index;
    this.x = x;
    this.y = y;

};

var grid = [];

//Build Grid array
function buildGrid(){

    //Create each square in the grid and add them to the grid list
    for(var i = 0; i < gridColumns; i++){
        for(var j = 0; j < gridRows; j++){
            var newSquare = new Square((i*gridRows)+j,i,j);
            grid.push(newSquare);
        }
    }
}

function updateGrid(){
    grid.forEach(s =>{
        s.centerX = mapCurrentX + (s.x * squareSize) + squareSize/2;
        s.centerY = mapCurrentY + (s.y * squareSize) + squareSize/2;
    });
};

//Draw Grid array
function drawGrid(){

    ctx.strokeStyle = gridColor;
    for(var i = 0; i < grid.length; i++){
        ctx.strokeRect(
            mapCurrentX + grid[i].x * squareSize,
            mapCurrentY + grid[i].y * squareSize,
            squareSize,
            squareSize
        );
    }
}

//Static Objects
var deviceX = 2 * squareSize;
var deviceY = 9 * squareSize;

var hasBattery1 = false;
var hasBattery2 = false;

var battery1X = 15 * squareSize;
var battery1Y = 5 * squareSize;

var battery2X = 7 * squareSize;
var battery2Y = 4 * squareSize;

//Rover
var currentOrientation = "down";

var roverStartX = 19 * squareSize;
var roverStartY = 2 * squareSize;
var roverX = roverStartX;
var roverY = roverStartY;

//Draw rover based on currentOrientation
function drawRover(x=0, y=0, horizFlip=false, vertFlip=true){
    
    if(currentOrientation === "down" || currentOrientation === "up"){
        ctx.drawImage(
            roverVert,
            roverX,
            roverY,
            squareSize,
            squareSize
        );
    }
    
    if(currentOrientation === "right"){
        ctx.drawImage(
            roverRight,
            roverX,
            roverY,
            squareSize,
            squareSize
        );
    }
    
    if(currentOrientation === "left"){
        ctx.drawImage(
            roverLeft,
            roverX,
            roverY,
            squareSize,
            squareSize
        );
    }
}

//Draw static objects
function drawIcons(){
    ctx.drawImage(
        alienDevice,
        deviceX,
        deviceY,
        squareSize*2,
        squareSize*2
    );

    if(!hasBattery1){
        ctx.drawImage(
            battery1,
            battery1X,
            battery1Y,
            squareSize,
            squareSize
        );
    }
   
    if(!hasBattery2){
        ctx.drawImage(
            battery2,
            battery2X,
            battery2Y,
            squareSize,
            squareSize
        );
    }
}

//This is the frame rate inverted to give us the number of ms per frame so we can control update() to run every *this many* ms.
var frameRate = 1000/25;

//Update function that runs after an event
function update(){

    //Clear the canvas so we can redraw it
    ctx.clearRect(0,0,bgLayer.width, bgLayer.height);

    drawMap();
    drawGrid();
    drawIcons();
    drawRover();
}

var actionButs = document.getElementsByClassName('actionItem');
var programBox = document.getElementsByClassName('programBox')[0];
var runBut = document.getElementById('run');
var resetBut = document.getElementById('reset');

var currentProgram = programBox.children

var programRun = false;

const writeMessage = (msg) => {

    var _txt = '';

    (async () => {
        for (const char of msg) {
            _txt = _txt + char
            document.getElementById('messageText').textContent = _txt;
            await new Promise(res => setTimeout(res, 35));
        }
      })();
}

var addAction = (event) => {
    if(gameOver){
        return;
    }

    if(programBox.length > 0){
        var mostRecentAction = programBox.lastChild;
    }
    
    var selAction = event.target.nodeName === "P" ? event.target.parentNode : event.target;

    if(selAction.id == 'loop'){
        if(currentProgram.length >= 6){
            writeMessage('Your program is too long to send a loop command.');
            return;
        }
    } else {
        if(currentProgram.length == 8){
            writeMessage('Your program is too long to send another command.');
            return;
        }
    }

    //Check to see if we are in a loop first
    if(loop_need_action && loop_need_num){
        if(selAction.id != "nav" && selAction.id != "num"){
            writeMessage("I can't run a loop without a direction and a number!");
            return;
        } else {
            if(selAction.id == "nav"){
                var blankAct = document.getElementById('blankAction')
                blankAct.innerHTML = selAction.innerHTML;
                blankAct.id = selAction.id;
                loop_need_action = false;
                return;
            }
            else if(selAction.id == "num"){
                var blankNum = document.getElementById('blankNum')
                blankNum.innerHTML = selAction.innerHTML;
                blankNum.id = selAction.id;
                loop_need_num = false;
                return;
            }
             
        }
    }
    
    if(loop_need_action){
        if(selAction.id == "nav"){
            var blankAct = document.getElementById('blankAction')
            blankAct.innerHTML = selAction.innerHTML;
            blankAct.id = selAction.id;
            loop_need_action = false;
            return;
        }
        else {
            writeMessage("I can't run a loop without a direction!");
            return;
        }
    }
    
    if(loop_need_num){
        if(selAction.id == "num"){
            var blankNum = document.getElementById('blankNum')
            blankNum.innerHTML = selAction.innerHTML;
            blankNum.id = selAction.id;
            loop_need_num = false;
            return;
        } 
        else {
            writeMessage("I can't run a loop without a number!");
            return;
        }
    }

    var newActionInstance = selAction.cloneNode(true);

    //Blank right side of if and while
    const loop_action = document.createElement('div');
    loop_action.className = "actionItem lgreen";
    loop_action.id = "blankAction";
    const loop_num = document.createElement('div');
    loop_num.className = "actionItem lgrey";
    loop_num.id = "blankNum";

    if(mostRecentAction && mostRecentAction.className === "actionItem lblue if-right" && mostRecentAction.firstChild === null){
        mostRecentAction.appendChild(newActionInstance.firstChild);
    } else {
        if(newActionInstance.firstChild.innerHTML === "LOOP"){
            newActionInstance.className = "actionItem blue if-left";
            programBox.appendChild(newActionInstance);
            programBox.appendChild(loop_action);
            programBox.appendChild(loop_num);
            loop_need_action = true;
            loop_need_num = true;
        } else {
            programBox.appendChild(newActionInstance);
        }
    }

}

for(var i=0; i < actionButs.length; i++){
    actionButs[i].addEventListener("click", addAction, true);
}

var lerpDrone = (currentPosX, currentPosY, endPosX, endPosY, time=500) => {

    var horiz = false;

    if(currentPosX !== endPosX){
        horiz = true;
    }

    //To make trig work we need an angle also
    var distance = Math.sqrt(((endPosY - currentPosY)*(endPosY - currentPosY)) + ((endPosX - currentPosX)*(endPosX - currentPosX)));

    //How many pixels we move per frame
    var tick = distance/time * frameRate;

    //Total number of ticks to loop through
    var numTicks = Math.ceil(distance/tick);

    //Note, this is only handling one direction at a time. For diagonals, we will need to get angle and use trig
    for(var i=0; i < numTicks; i++){
        if(i < numTicks - 1){
            setTimeout(() => {

                if(horiz){
                    currentOrientation === "left" && (roverX = roverX - tick);
                    currentOrientation === "right" && (roverX = roverX + tick);
                } else {
                    currentOrientation === "up" && (roverY = roverY - tick);
                    currentOrientation === "down" && (roverY = roverY + tick);
                }
    
                update();
    
            }, frameRate * i)
        } else {
            setTimeout(() => {

                if(horiz){
                    roverX = endPosX;
                } else {
                    roverY = endPosY;
                }
        
                update();
        
                
        
            }, frameRate * numTicks);

            return new Promise(resolve => setTimeout(resolve, frameRate * numTicks));
        }
    }
}



const runProgram = async () => {

    if(gameOver){
        return;
    }

    if(loop_need_action || loop_need_num){
        writeMessage("Looks like you're missing some things in your program");
        return;
    }

    if(programRun){
        writeMessage("Hmmmmmm, that program didn't work. You should reset and try again.");
        return;
    }

    var updatedProgram = []

    // First, manipulate the program to account for loops
    for(var i=0; i<currentProgram.length; i++){

        if(currentProgram[i].firstChild.innerHTML == 'LOOP'){

            for(var j=0; j<currentProgram[i+2].firstChild.innerHTML-1; j++){
                updatedProgram.push(currentProgram[i+1].firstChild.innerHTML);
            }
        } else {
            updatedProgram.push(currentProgram[i].firstChild.innerHTML);
        }
        
    }

    programRun = true;

    console.log(updatedProgram)

    // Now do the actions that are programmed
    for(var i=0; i<updatedProgram.length; i++){

        switch(updatedProgram[i]){
            case "UP":
                currentOrientation = "up";
                const lerpUp = await lerpDrone(roverX, roverY, roverX, roverY - 50);
                break;
            case "DOWN":
                currentOrientation = "down";
                const lerpDown = await lerpDrone(roverX, roverY, roverX, roverY + 50);
                break;
            case "LEFT":
                currentOrientation = "left";
                const lerpLeft = await lerpDrone(roverX, roverY, roverX - 50, roverY);
                break;
            case "RIGHT":
                currentOrientation = "right";
                const lerpRight = await lerpDrone(roverX, roverY, roverX + 50, roverY);
                break;
            case "RECHARGE":
                if(!hasBattery1 && roverX == battery1X && roverY == battery1Y){
                    hasBattery1 = true;
                    writeMessage("Yum yum yum yum yum yum! Delicioso!");
                    resetProgram(true);
                } else if(!hasBattery2 && roverX == battery2X && roverY == battery2Y){
                    hasBattery2 = true;
                    writeMessage("A battery?! For me?! You shouldn't have!");
                    resetProgram(true);
                } else {
                    writeMessage("I'm not close enough to a battery to recharge!");
                }
                break;
            case "ACTIVATE":
                if((roverX == deviceX || roverX == deviceX + (1 * squareSize)) && (roverY == deviceY || roverY == deviceY + (1 * squareSize))){
                    writeMessage("I'm receiving a message from the strange, alien device...")
                    document.getElementById('winMessage').className = 'showWinMessage';
                    gameOver = true;
                } else {
                    writeMessage("There is nothing here to activate");
                }
                break;
            default:
                break;
        }
        
    }

    //Check for completion

    //resetProgram();
}

runBut.addEventListener('click', runProgram, true);

var resetProgram = (success, event) => {

    gameOver = true;

    while(programBox.firstChild){
        programBox.removeChild(programBox.firstChild);
    }

    loop_need_action = false;
    loop_need_num = false;

    if(hasBattery1 == true){
        if(hasBattery2 == true){
            roverX = battery2X;
            roverY = battery2Y;
        } else {
            roverX = battery1X;
            roverY = battery1Y;
        }
    } else {
        roverX = roverStartX;
        roverY = roverStartY;
    
        currentOrientation = "down"
    }
    
    programRun = false;

    resetMessages = [
        "If at first you don't succeed, mash the reset button!",
        "Well that didn't work...",
        "Think like a proton....always positive!",
        '"Trying is the first step towards failure" - Homer Simpson',
        "That's ok, this really is my favorite square of barren wasteland."
    ]

    if(!success){
        var _ind = Math.floor(Math.random() * 5);
        writeMessage(resetMessages[_ind])
    }
    

    update();

}

resetBut.addEventListener('click', e => {resetProgram(false, e)}, true);


