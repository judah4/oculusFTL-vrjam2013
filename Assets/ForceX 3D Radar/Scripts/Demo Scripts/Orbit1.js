#pragma strict
var orbit : boolean;
var ThisTransform : Transform;
var point : Vector3;
var speed : float;
var previous : Vector3;
var Helper : Transform;
function Start () {
ThisTransform = transform;
}

function Update () {
if(orbit){
ThisTransform.RotateAround(point, Vector3.up, speed * Time.deltaTime);
}else{
ThisTransform.position += ThisTransform.forward * speed * Time.deltaTime;
}
//var TargetSpeed : Vector3 = (ThisTransform.position - previous) / Time.deltaTime;
//Helper.position = ThisTransform.position + TargetSpeed;
//previous = ThisTransform.position;
}