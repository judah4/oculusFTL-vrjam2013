#pragma strict
//Pretend this is your NAV generation script. This is the script where you create, place and store in a Array your list of NAV points.

var MyNAV : Transform[]; //Pretend this is a NAV list that you generated in a script and have pre-sorted the NAV points in the order you want.

function Start(){ // This is only an example. You would call SendNAV() directly during runtime after creating your NAV point list.
SendNAV();
}

function SendNAV(){ //After you have created your NAV points and stored them in the array. Call this function to send the NAV information to the 3D_Radar.
GameObject.Find("_GameMgr").GetComponent(FX_3DRadar_Mgr).CreateNAV(MyNAV);
}
