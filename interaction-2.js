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

let freeFallStart = null;
const FREEFALL_THRESHOLD = 3; // acceleration below this = falling
const FREEFALL_TIME = 150;

// Change here to ("tuono") depending on your wasm file name
const dspName = "bells";
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
bells.createDSP(audioContext, 1024).then((node) => {
  dspNode = node;
  dspNode.connect(audioContext.destination);
  console.log("params: ", dspNode.getParams());
  const jsonString = dspNode.getJSON();
  jsonParams = JSON.parse(jsonString)["ui"][0]["items"];
  dspNodeParams = jsonParams;
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

let lastMagnitude = null;
let dropDetected = false;

// Thresholds
const FREEFALL_DROP = 5;  // sudden drop in m/s² to count as fall
const MIN_ACCEL = 2;      // magnitude below this counts as free-fall

let impactDetected = false;
const IMPACT_THRESHOLD = 15; // acceleration in m/s² to count as impact

function accelerationChange(accx, accy, accz) {
    if (!dspNode) return;

    const magnitude = Math.sqrt(accx*accx + accy*accy + accz*accz);

    // Impact trigger
    if (magnitude > IMPACT_THRESHOLD && !impactDetected) {
        impactDetected = true;
        console.log("Impact detected! magnitude:", magnitude.toFixed(2));

        dspNode.setParamValue("/englishBell/gate", 1);

        setTimeout(() => {
            dspNode.setParamValue("/englishBell/gate", 0);
        }, 100);
    }

    // Reset when returning to roughly Earth's gravity
    if (magnitude > 7 && magnitude < 12) {
        impactDetected = false;
    }

}



function rotationChange(rotx, roty, rotz) {}

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
  //playAudio();
}

function getMinMaxParam(address) {
  const exampleMinMaxParam = findByAddress(dspNodeParams, address);
  // ALWAYS PAY ATTENTION TO MIN AND MAX, ELSE YOU MAY GET REALLY HIGH VOLUMES FROM YOUR SPEAKERS
  const [exampleMinValue, exampleMaxValue] = getParamMinMax(exampleMinMaxParam);
  console.log("Min value:", exampleMinValue, "Max value:", exampleMaxValue);
  return [exampleMinValue, exampleMaxValue];
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
  if (audioContext.state === "suspended") {
    return;
  }
  dspNode.setParamValue("/englishBell/gate", 1);
  setTimeout(() => {
    dspNode.setParamValue("/englishBell/gate", 0);
  }, 100);
}

//==========================================================================================
// END
//==========================================================================================