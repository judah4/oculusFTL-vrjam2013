#pragma strict
private var ThisCamera : Transform;
var PlayerCam : Transform;
function Start () {
ThisCamera = transform;
}

function Update () {
ThisCamera.rotation = PlayerCam.rotation;
}