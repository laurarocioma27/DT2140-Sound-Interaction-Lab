//==========================================================================================
// AUDIO SETUP
//------------------------------------------------------------------------------------------
//
//------------------------------------------------------------------------------------------
// Edit just where you're asked to!
//------------------------------------------------------------------------------------------
//
//==========================================================================================
let dspNode = null;
let dspNodeParams = null;
let jsonParams = null;

// Change here to ("tuono") depending on your wasm file name
const dspName = "torpedo";
const instance = new FaustWasm2ScriptProcessor(dspName);

// output to window or npm package module
if (typeof module === "undefined") {
    window[dspName] = instance;
} else {
    const exp = {};
    exp[dspName] = instance;
    module.exports = exp;
}

// The name should be the same as the WASM file, so change tuono with brass if you use brass.wasm
torpedo.createDSP(audioContext, 1024)
    .then(node => {
        dspNode = node;
        dspNode.connect(audioContext.destination);
        console.log('params: ', dspNode.getParams());
        const jsonString = dspNode.getJSON();
        jsonParams = JSON.parse(jsonString)["ui"][0]["items"];
        dspNodeParams = jsonParams
        // const exampleMinMaxParam = findByAddress(dspNodeParams, "/thunder/rumble");
        // // ALWAYS PAY ATTENTION TO MIN AND MAX, ELSE YOU MAY GET REALLY HIGH VOLUMES FROM YOUR SPEAKERS
        // const [exampleMinValue, exampleMaxValue] = getParamMinMax(exampleMinMaxParam);
        // console.log('Min value:', exampleMinValue, 'Max value:', exampleMaxValue);
    });


//==========================================================================================
// INTERACTIONS
//------------------------------------------------------------------------------------------
//
//------------------------------------------------------------------------------------------
// Edit the next functions to create interactions
// Decide which parameters you're using and then use playAudio to play the Audio
//------------------------------------------------------------------------------------------
//
//==========================================================================================

let dropThreshold = 5; // g units; adjust for sensitivity
let dropDetected = false;

function accelerationChange(accx, accy, accz) {
    // Compute total acceleration magnitude
    let totalAcc = Math.sqrt(accx*accx + accy*accy + accz*accz);

    // If total acceleration is very small, we assume free fall
    if (totalAcc < dropThreshold && !dropDetected) {
        dropDetected = true;
        console.log("Free fall detected! totalAcc:", totalAcc);
        playAudio(); // trigger your drop sound
    }

    // Reset drop detection once acceleration returns to normal
    if (totalAcc > 1.0) { // normal gravity
        dropDetected = false;
    }
}


function rotationChange(rotx, roty, rotz) {
}

function mousePressed() {
    playAudio()
    // Use this for debugging from the desktop!
}

function deviceMoved() {
    movetimer = millis();
    statusLabels[2].style("color", "pink");

}

function deviceTurned() {
    threshVals[1] = turnAxis;
}
function deviceShaken() {
    shaketimer = millis();
    statusLabels[0].style("color", "pink");
    playAudio();
}

function getMinMaxParam(address) {
    const exampleMinMaxParam = findByAddress(dspNodeParams, address);
    // ALWAYS PAY ATTENTION TO MIN AND MAX, ELSE YOU MAY GET REALLY HIGH VOLUMES FROM YOUR SPEAKERS
    const [exampleMinValue, exampleMaxValue] = getParamMinMax(exampleMinMaxParam);
    console.log('Min value:', exampleMinValue, 'Max value:', exampleMaxValue);
    return [exampleMinValue, exampleMaxValue]
}

let lastPlayTime = 0;       // cooldown to prevent repeated triggers

function devicePointed(alpha, beta, gamma) {
    const now = millis();
    
    // alpha is the compass heading (0–360°)
    const diff = Math.abs(alpha - targetDirection);
    
    // handle wrap-around (e.g., 350° is close to 0°)
    const wrappedDiff = Math.min(diff, 360 - diff);

    if (wrappedDiff < threshold && now - lastPlayTime > 500) {
        playAudio();  // trigger your sound
        lastPlayTime = now;
    }

    // Optional: log for debugging
    console.log("Heading:", alpha.toFixed(0), "Diff:", wrappedDiff);
}

//==========================================================================================
// AUDIO INTERACTION
//------------------------------------------------------------------------------------------
//
//------------------------------------------------------------------------------------------
// Edit here to define your audio controls 
//------------------------------------------------------------------------------------------
//
//==========================================================================================

function playAudio() {
    if (!dspNode) {
        return;
    }
    if (audioContext.state === 'suspended') {
        return;
    }
    dspNode.setParamValue("/torpedo/gate", 1)
    if (dropDetected === false){
        setTimeout(() => { dspNode.setParamValue("/torpedo/gate", 0) }, 50);}
    
}

//==========================================================================================
// END
//==========================================================================================