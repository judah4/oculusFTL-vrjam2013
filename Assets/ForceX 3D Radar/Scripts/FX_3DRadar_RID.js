#pragma strict

enum _class {Misc, Civilian_Transport, Cargo_Transport, Drone, Fighter, Bomber, Escort, Frigate, Cruiser, Battleship, Dreadnaught, Capital, SpaceObject, Celestial, XO}
var Class : _class;

enum misc{Pilot, Misc_2, Misc_3, Misc_4, Misc_5, Misc_6, Misc_7}
var Misc : misc;

enum civT{CivT_1, CivT_2, CivT_3, CivT_4, CivT_5, CivT_6, CivT_7}
var CIVT : civT;

enum coT{CoT_1, CoT_2, CoT_3, CoT_4, CoT_5, CoT_6, CoT_7}
var COT : coT;

enum drone{Drone_1, Drone_2, Drone_3, Drone_4, Drone_5, Drone_6, Drone_7}
var Drone : drone;

enum fighter{Fighter_1, Fighter_2, Fighter_3, Fighter_4, Fighter_5, Fighter_6, Fighter_7}
var Fighter : fighter;

enum bomber{Bomber_1, Bomber_2, Bomber_3, Bomber_4, Bomber_5, Bomber_6, Bomber_7}
var Bomber : bomber;

enum escort{Escort_1, Escort_2, Escort_3,Escort_4, Escort_5, Escort_6, Escort_7}
var Escort : escort;

enum frigate{Frigate_1, Frigate_2, Frigate_3,Frigate_4, Frigate_5, Frigate_6, Frigate_7}
var Frigate : frigate;

enum cruiser{Cruiser_1, Cruiser_2, Cruiser_3, Cruiser_4, Cruiser_5, Cruiser_6, Cruiser_7}
var Cruiser : cruiser;

enum battleship{Battleship_1, Battleship_2, Battleship_3, Battleship_4, Battleship_5, Battleship_6, Battleship_7}
var BattleShip : battleship;

enum dreadnought{Dreadnought_1, Dreadnought_2, Dreadnought_3, Dreadnought_4, Dreadnought_5, Dreadnought_6, Dreadnought_7}
var Dreadnought : dreadnought;

enum capital{Capital_1, Capital_2, Capital_3, Capital_4, Capital_5, Capital_6, Capital_7}
var Capital : capital;

enum spaceObject{Station, satellite, Gate, Cargo_Container, Wreckage, SO_6, SO_7}
var SpaceObject : spaceObject;

enum celestial{Star, Planet, Moon, Asteroid, Celestial_5, Celestial_6, Celestial_7}
var Celestial : celestial;

enum xo{Mine, Missile, Torpedo, XO_4, XO_5, XO_6, XO_7}
var XO : xo;

enum iff{Abandoned, Neutral, Friendly, Hostile, Unknown, Owned, NAV}
var IFF : iff;

var ThisClass : int[] = new int[2]; // X = Class, Y = Sub Class

private var ThisFactionTemp : int;
var ThisFaction : int;
var ThisFactionID : int;

var IsAbandoned : boolean;
var IsPlayerOwned : boolean;
var IsPlayer : boolean;
var IsNAV : boolean;

private var FX3DRM : FX_3DRadar_Mgr;
private var FXFM : FX_Faction_Mgr;
private var CurrentIFFClass : int[] = new int[3]; // X = Class, Y = Sub Class, Z = IFF
private var ThisID : Transform[] = new Transform[4]; // 0 = This Transform, 1 = Radar ID Tag, 2 = Radar ID Base, 3 = Radar ID VDI
private var VDIvertices : Vector3[] = new Vector3[4];
private var VDIMesh : Mesh;
private var VDIScale : float;
private var RID_Enabled : boolean;
private var CurStatus : boolean[] = new boolean[3]; // 0 = Is Player, 1 = Is Player Owned, 2 = Is Abandoned 
private var ThisPos : Vector3;
private var CheckTimer : float;
private var IsObstructed : boolean;
private var ReTimer : float;
private var LOSTimer : float;
private var NAVDistance : boolean = false;

//Hostile List
var EnableRadar : boolean;
var RadarRange : int = 100;
var HostileList : List.<Transform> = new List.<Transform>();
var UpdateHL : float = 10.0;
private var HLTimer : float;

//Blind Radar
var Detectable : boolean = true;
var BlindRadarOverride : boolean;
var IsPlayerTarget : boolean;

//Bounds
var BoundsOverride : boolean;
var DetectionReset : boolean;
var PermDiscovery : boolean;
var BoundsEnabled : boolean = true;
private var IndicatorCorners : Transform[] = new Transform[4];
private var BoundsCorners : GameObject; // Need to dynamically generate this and the TL TR BL BR transforms
private var Discovered : boolean;

function Start(){
ThisID[0] = transform;
FX3DRM = GameObject.Find("/_GameMgr").GetComponent(FX_3DRadar_Mgr);
FXFM = GameObject.Find("/_GameMgr").GetComponent(FX_Faction_Mgr);
ThisFactionTemp = ThisFaction;

	if(ThisFaction > FXFM.Factions.Length - 1){
		ThisFaction = 0;
		ThisFactionID = FXFM.FactionID[ThisFaction];
	}else{
		ThisFactionID = FXFM.FactionID[ThisFaction];
	}
	
	if(!IsNAV){
		if(IsPlayer){
			SetAsPlayer();
		}else{
			SetAsAI();
		}
	}else{
		SetAsNAV();
	}

CreateBounds();
CreateRadarID();
SetIFFStatus();
}

function LateUpdate(){
ThisPos = ThisID[0].position;

	if(FX3DRM.LocalTime > CheckTimer){
		CheckStatus();
		CheckTimer = FX3DRM.LocalTime + 1;
	}
	
	if(!IsNAV){
		if(FX3DRM.FilterHostile){
			if(!IsPlayer && IFF == 3){
				UpdateRID();
				UpdateBounds();
	
				if(EnableRadar && FX3DRM.LocalTime > HLTimer){
					BuildHostileList();
					HLTimer += FX3DRM.LocalTime + UpdateHL;
				}
				
			}else{
				if(RID_Enabled){
					DisableRID();
				}
				if(BoundsEnabled){
					DisableBounds();
			 	}
			}
		}else{
			if(!IsPlayer){
				UpdateRID();
				UpdateBounds();
	
				if(EnableRadar && FX3DRM.LocalTime > HLTimer){
					BuildHostileList();
					HLTimer += FX3DRM.LocalTime + UpdateHL;
				}
				
			}else{
				if(RID_Enabled){
					DisableRID();
				}
				if(BoundsEnabled){
					DisableBounds();
			 	}
			}	
		}
	}else{
		UpdateNAV();
	}
}

function UpdateRID(){

	if(Detectable){
		var Distance : float = ((FX_3DRadar_Mgr.PlayerPos - ThisPos).sqrMagnitude);
		if(Distance < FX_3DRadar_Mgr.RadarRangeSQR){
			if(FX3DRM.EnableBlindRadar && !BlindRadarOverride){
				var hit : RaycastHit;
				if(FX3DRM.LocalTime > LOSTimer){
					if(!Physics.Linecast(ThisPos, FX_3DRadar_Mgr.PlayerPos, hit, FX_3DRadar_Mgr.ObstructionLayer)){
						if(!RID_Enabled){
							RID();
						}
						if(IsObstructed && FX3DRM.LocalTime <= ReTimer){
							FX3DRM.SelectedTargetT = ThisID[0];
							FX3DRM.SetTarget();
							IsObstructed = false;
						}else if(IsObstructed){
							IsObstructed = false;
						}
					}else if(RID_Enabled){
						ReTimer = FX3DRM.LocalTime + FX3DRM.reTime;
						
						if(IsPlayerTarget){
							IsObstructed = true;
						}
						DisableRID();
					}
					LOSTimer = FX3DRM.LocalTime + FX3DRM.RadarUpdate;
				}
				if(RID_Enabled){
					RID();
				}
			}else{
				RID();
			}
		}else if(RID_Enabled){
				DisableRID();
			}
	}else if(RID_Enabled){
		DisableRID();
	}
}

function UpdateBounds(){
	if(!BoundsOverride && FX3DRM.BoundsEnabled){
		switch(FX3DRM.BoundsShow){
			case 0:
				if(RID_Enabled){
					if(IsPlayerTarget){
						if(BoundsEnabled){
							DisableBounds();
					 	}		
					}else if(Detectable){
						DrawBounds();
					}else{
						DisableBounds();
					}
				}else{
					if(BoundsEnabled){
						DisableBounds();
				 	}	
				}		
			break;
				
			case 1:
				if(IsPlayerTarget){
					if(BoundsEnabled){
						DisableBounds();
				 	}		
				}else if(Detectable){
					DrawBounds();
				}else{
					DisableBounds();
				}			
			break;
				
			case 2:
				if(PermDiscovery && Discovered){
					if(IsPlayerTarget){
						if(BoundsEnabled){
							DisableBounds();
					 	}		
					}else if(Detectable){
						DrawBounds();
					}else{
						DisableBounds();
					}
				}else if(RID_Enabled){
						if(IsPlayerTarget){
							if(BoundsEnabled){
								DisableBounds();
						 	}		
						}else if(Detectable){
							DrawBounds();
						}else{
							DisableBounds();
						}
					}else{
						if(BoundsEnabled){
							DisableBounds();
					 	}	
					}				
				
				if(!Detectable && Discovered && DetectionReset && !RID_Enabled){
					Discovered = false;
					DisableBounds();
				}		
			break;
		}
	}else{
		if(BoundsEnabled){
			DisableBounds();
	 	}	
	}
}

function UpdateNAV(){
var Distance : float = ((FX_3DRadar_Mgr.PlayerPos - ThisPos).sqrMagnitude);

	if(Distance < FX_3DRadar_Mgr.RadarRangeSQR && FX3DRM.DisplayNAVRadar){
		if(NAVDistance){
			ThisID[2].renderer.enabled = true;
			ThisID[3].renderer.enabled = true;
			NAVDistance = false;
		}
		RID();
	}else{
		if(!NAVDistance){
			ThisID[2].renderer.enabled = false;
			ThisID[3].renderer.enabled = false;
			NAVDistance = true;
		}
		RenderNAVDistance();
	}
	
	if(BoundsEnabled){
		DisableBounds();
 	}
}

function RID(){

	if(!RID_Enabled){
		if(IFF == 3){
			FX3DRM.PlayWarningSound();
		}
		EnableRID();
	}
	
	if(FX3DRM.Perspective){
		RenderPerspective();
	}else{
		RenderOrthographic();
	}
}

function RenderPerspective(){
var RelPos : Vector3 = FX3DRM.PlayerT.InverseTransformPoint(ThisPos) * FX_3DRadar_Mgr.RadarLocalScale;
var newPosA : Vector3 = FX3DRM.Cameras[0].WorldToScreenPoint(RelPos);
newPosA = Vector3(Mathf.Round(newPosA.x), Mathf.Round(newPosA.y), newPosA.z);
var ThisIDPos : Vector3 = FX3DRM.Cameras[1].ScreenToWorldPoint(Vector3(newPosA.x + .5, newPosA.y + .5, newPosA.z));
ThisID[1].position = ThisIDPos;

if(!FX3DRM.VDIOff){
	if(!FX3DRM.BaseIDOff){
		var newPosB : Vector3 = FX3DRM.Cameras[0].WorldToScreenPoint(Vector3(RelPos.x, 0, RelPos.z));
		newPosB = Vector3(Mathf.Round(newPosB.x), Mathf.Round(newPosB.y), newPosB.z);
		var ThisBasePos : Vector3 = FX3DRM.Cameras[1].ScreenToWorldPoint(Vector3(newPosB.x - .5, newPosB.y + .5, newPosB.z));
		ThisID[2].position = ThisBasePos;
	}
	var ThisVDIPos1 : Vector3 = FX3DRM.Cameras[1].ScreenToWorldPoint(Vector3(newPosA.x - 1, newPosA.y + .5, newPosA.z));
	var ThisVDIPos2 : Vector3 = FX3DRM.Cameras[1].ScreenToWorldPoint(Vector3(newPosB.x - 1, newPosB.y, newPosB.z));
		
		if(RelPos.y > 0){		
			VDIvertices[0] = Vector3(ThisVDIPos1.x + VDIScale, ThisVDIPos1.y, ThisVDIPos1.z); //bottom left
			VDIvertices[1] =  Vector3(ThisVDIPos2.x + VDIScale, ThisVDIPos2.y, ThisVDIPos2.z); // Top Left
			VDIvertices[2] =  Vector3(ThisVDIPos1.x - VDIScale, ThisVDIPos1.y, ThisVDIPos1.z); // bottom right
			VDIvertices[3] =  Vector3(ThisVDIPos2.x - VDIScale, ThisVDIPos2.y, ThisVDIPos2.z); // Top right
		}else{
			VDIvertices[1] = Vector3(ThisVDIPos1.x + VDIScale, ThisVDIPos1.y, ThisVDIPos1.z); //bottom left
			VDIvertices[0] =  Vector3(ThisVDIPos2.x + VDIScale, ThisVDIPos2.y, ThisVDIPos2.z); // Top Left
			VDIvertices[3] =  Vector3(ThisVDIPos1.x - VDIScale, ThisVDIPos1.y, ThisVDIPos1.z); // bottom right
			VDIvertices[2] =  Vector3(ThisVDIPos2.x - VDIScale, ThisVDIPos2.y, ThisVDIPos2.z); // Top right	
		}
	
	VDIMesh.vertices = VDIvertices;
}
	if(PermDiscovery && !Discovered){
		Discovered = true;
	}
}

function RenderOrthographic(){
var RelPos : Vector3 = FX3DRM.PlayerT.InverseTransformPoint(ThisPos) * FX_3DRadar_Mgr.RadarLocalScale;
var newPosA : Vector3 = FX3DRM.Cameras[1].WorldToScreenPoint(RelPos);
newPosA = Vector3(Mathf.Round(newPosA.x), Mathf.Round(newPosA.y), newPosA.z);

ThisID[1].position = FX3DRM.Cameras[1].ScreenToWorldPoint(Vector3(newPosA.x + .5, newPosA.y + .5, 1));

if(!FX3DRM.VDIOff){
	if(!FX3DRM.BaseIDOff){
		var newPosB : Vector3 = FX3DRM.Cameras[1].WorldToScreenPoint(Vector3(RelPos.x, 0, RelPos.z));
		newPosB = Vector3(Mathf.Round(newPosB.x), Mathf.Round(newPosB.y), newPosB.z);
		
		ThisID[2].position = FX3DRM.Cameras[1].ScreenToWorldPoint(Vector3(newPosA.x - .5, newPosB.y + .5, 1));
	}
	var newPosC : Vector3 = FX3DRM.Cameras[1].ScreenToWorldPoint(Vector3((newPosA.x - 1),newPosA.y, 1));
	ThisID[3].position.x = newPosC.x;
	
		if(RelPos.y > 0){
			VDIvertices[0] = Vector3(VDIScale, RelPos.y, RelPos.z); //bottom left
			VDIvertices[1] =  Vector3(VDIScale, 0, RelPos.z); // Top Left
			VDIvertices[2] =  Vector3(-VDIScale, RelPos.y, RelPos.z); // bottom right
			VDIvertices[3] =  Vector3(-VDIScale, 0, RelPos.z); // Top right
		}else{
			VDIvertices[0] = Vector3(VDIScale,0, RelPos.z); //bottom left
			VDIvertices[1] =  Vector3(VDIScale, RelPos.y, RelPos.z); // Top Left
			VDIvertices[2] =  Vector3(-VDIScale, 0, RelPos.z); // bottom right
			VDIvertices[3] =  Vector3(-VDIScale, RelPos.y, RelPos.z); // Top right	
		}
		
	VDIMesh.vertices = VDIvertices;
}	
	if(PermDiscovery && !Discovered){
		Discovered = true;
	}
}

function RenderNAVDistance(){
var Direction : Vector3 = ((FX_3DRadar_Mgr.PlayerPos - ThisPos).normalized * -0.5);
var RelPos : Vector3 = FX3DRM.PlayerT.InverseTransformPoint(Direction) * FX_3DRadar_Mgr.RadarLocalScale;
var newPosA : Vector3;

	if(FX3DRM.Perspective){
		newPosA = FX3DRM.Cameras[0].WorldToScreenPoint(Direction);
		newPosA = Vector3(Mathf.Round(newPosA.x), Mathf.Round(newPosA.y), newPosA.z);
		ThisID[1].position = FX3DRM.Cameras[1].ScreenToWorldPoint(Vector3(newPosA.x + .5, newPosA.y + .5, newPosA.z));
	}else{
		newPosA = FX3DRM.Cameras[1].WorldToScreenPoint(Direction);
		newPosA = Vector3(Mathf.Round(newPosA.x), Mathf.Round(newPosA.y), newPosA.z);
		ThisID[1].position = FX3DRM.Cameras[1].ScreenToWorldPoint(Vector3(newPosA.x + .5, newPosA.y + .5, 1));	
	}
}

function DrawBounds(){
	
	var center : Vector3 = ThisPos;
	var Max : Vector3;
	var Min : Vector3;
			
	if(Vector3.Dot(FX3DRM.PlayerCameraT[0].TransformDirection(Vector3.forward), (center - FX3DRM.PlayerCameraT[0].position)) > 0){ // Check if the object is in front of the camera. If not then disable the corners & do not execute the code.
		if(!BoundsEnabled){
			EnableBounds();
		}
								
		var ThisBounds : Vector3;
				
		if(FX3DRM.BoundsSize == 0){
			ThisBounds = renderer.bounds.extents * FX3DRM.BoundsPadding;
		}else{
			ThisBounds = Vector3(1,1,1) * FX3DRM.BoundsPadding;
		}

		if(FX3DRM.BoundsCalculation == 0){ // Calculation Method 1 : Do a basic calculation for finding 4 points around the center of the object & convert there world positions to viewport space
			var corner1 : Vector3 = FX3DRM.Cameras[3].WorldToViewportPoint((center + Vector2(ThisBounds.x, ThisBounds.y)));
			var corner2 : Vector3 = FX3DRM.Cameras[3].WorldToViewportPoint((center + Vector2(-ThisBounds.x, ThisBounds.y)));
			var corner3 : Vector3 = FX3DRM.Cameras[3].WorldToViewportPoint((center + Vector2(ThisBounds.x, -ThisBounds.y)));
			var corner4 : Vector3 = FX3DRM.Cameras[3].WorldToViewportPoint((center + Vector2(-ThisBounds.x, -ThisBounds.y)));
					
			//Find the Left, Right, Top, & Bottom most points
			Min.x = Mathf.Min(corner1.x, corner2.x, corner3.x, corner4.x);
			Max.x = Mathf.Max(corner1.x, corner2.x, corner3.x, corner4.x);		
			Max.y = Mathf.Max(corner1.y, corner2.y, corner3.y, corner4.y);
			Min.y = Mathf.Min(corner1.y, corner2.y, corner3.y, corner4.y);
		}else{ // Calculation Method 2 : Do a more advanced calculation for finding all 8 points of the objects bounds & convert there world positions to viewport space
			var TopFrontLeft : Vector3 = FX3DRM.Cameras[3].WorldToViewportPoint(Vector3(center.x + ThisBounds.x, center.y + ThisBounds.y, center.z - ThisBounds.z));
			var TopFrontRight : Vector3 = FX3DRM.Cameras[3].WorldToViewportPoint(Vector3(center.x - ThisBounds.x, center.y + ThisBounds.y, center.z - ThisBounds.z));
			var TopBackLeft : Vector3 = FX3DRM.Cameras[3].WorldToViewportPoint((center + ThisBounds));
			var TopBackRight : Vector3 = FX3DRM.Cameras[3].WorldToViewportPoint(Vector3(center.x - ThisBounds.x, center.y + ThisBounds.y, center.z + ThisBounds.z));
			var BottomFrontLeft : Vector3 = FX3DRM.Cameras[3].WorldToViewportPoint(Vector3(center.x + ThisBounds.x, center.y - ThisBounds.y, center.z - ThisBounds.z));
			var BottomFrontRight : Vector3 = FX3DRM.Cameras[3].WorldToViewportPoint((center - ThisBounds));
			var BottomBackLeft : Vector3 = FX3DRM.Cameras[3].WorldToViewportPoint(Vector3(center.x + ThisBounds.x, center.y - ThisBounds.y, center.z + ThisBounds.z));
			var BottomBackRight : Vector3 = FX3DRM.Cameras[3].WorldToViewportPoint(Vector3(center.x - ThisBounds.x, center.y - ThisBounds.y, center.z + ThisBounds.z));
					
			//Find the Left, Right, Top, & Bottom most points
			Max.x = Mathf.Max(TopFrontLeft.x, TopBackLeft.x, TopFrontRight.x, TopBackRight.x, BottomFrontLeft.x, BottomBackLeft.x, BottomFrontRight.x, BottomBackRight.x);
			Min.x = Mathf.Min(TopFrontLeft.x, TopBackLeft.x, TopFrontRight.x, TopBackRight.x, BottomFrontLeft.x, BottomBackLeft.x, BottomFrontRight.x, BottomBackRight.x);
			Max.y = Mathf.Max(TopFrontLeft.y, TopBackLeft.y, TopFrontRight.y, TopBackRight.y, BottomFrontLeft.y, BottomBackLeft.y, BottomFrontRight.y, BottomBackRight.y);
			Min.y = Mathf.Min(TopFrontLeft.y, TopBackLeft.y, TopFrontRight.y, TopBackRight.y, BottomFrontLeft.y, BottomBackLeft.y, BottomFrontRight.y, BottomBackRight.y);
		}
				
		if(FX3DRM.SetLimits){
			var centerPos : Vector2 = FX3DRM.Cameras[3].WorldToViewportPoint(center);
			var PreComputeMinMax : Vector2 = Vector2(FX3DRM.MaxSize.x * .5, FX3DRM.MaxSize.y * .5);
			
			if(Max.x - Min.x >= FX3DRM.MaxSize.x){
			  Max.x = centerPos.x + PreComputeMinMax.x;
			  Min.x = centerPos.x - PreComputeMinMax.x;
			}
		
			if(Max.y - Min.y >= FX3DRM.MaxSize.y){
			 Max.y = centerPos.y + PreComputeMinMax.y;
			  Min.y = centerPos.y - PreComputeMinMax.y;
			}
		}
		
		Max = FX3DRM.Cameras[3].ViewportToScreenPoint(Vector3(Max.x, Max.y, 1));
		Min = FX3DRM.Cameras[3].ViewportToScreenPoint(Vector3(Min.x, Min.y, 1));
		
		Max = Vector3(Mathf.Round(Max.x) +.5, Mathf.Round(Max.y) + .5, 1);
		Min = Vector3(Mathf.Round(Min.x) + .5, Mathf.Round(Min.y) +.5, 1);
		
		//Position our corners from viewport space back into world space
		IndicatorCorners[0].position = FX3DRM.Cameras[2].ScreenToWorldPoint(Vector3(Min.x, Max.y, 1) + FX3DRM.HUDOffset);
		IndicatorCorners[1].position = FX3DRM.Cameras[2].ScreenToWorldPoint(Vector3(Max.x, Max.y, 1) + FX3DRM.HUDOffset);
		IndicatorCorners[2].position = FX3DRM.Cameras[2].ScreenToWorldPoint(Vector3(Min.x, Min.y, 1) + FX3DRM.HUDOffset);
		IndicatorCorners[3].position = FX3DRM.Cameras[2].ScreenToWorldPoint(Vector3(Max.x, Min.y, 1) + FX3DRM.HUDOffset);
				
	}else{
		if(BoundsEnabled){
			DisableBounds();
		}
	}
	
	if(FX3DRM.EnableRift){
		DrawBoundsRift();
	}
}

function DrawBoundsRift(){
	
	var center : Vector3 = ThisPos;
	var Max : Vector3;
	var Min : Vector3;
			
	if(Vector3.Dot(FX3DRM.PlayerCameraT[1].TransformDirection(Vector3.forward), (center - FX3DRM.PlayerCameraT[1].position)) > 0){ // Check if the object is in front of the camera. If not then disable the corners & do not execute the code.
		if(!BoundsEnabled){
			EnableBounds();
		}
								
		var ThisBounds : Vector3;
				
		if(FX3DRM.BoundsSize == 0){
			ThisBounds = renderer.bounds.extents * FX3DRM.BoundsPadding;
		}else{
			ThisBounds = Vector3(1,1,1) * FX3DRM.BoundsPadding;
		}

		if(FX3DRM.BoundsCalculation == 0){ // Calculation Method 1 : Do a basic calculation for finding 4 points around the center of the object & convert there world positions to viewport space
			var corner1 : Vector3 = FX3DRM.RiftCameras[1].WorldToViewportPoint((center + Vector2(ThisBounds.x, ThisBounds.y)));
			var corner2 : Vector3 = FX3DRM.RiftCameras[1].WorldToViewportPoint((center + Vector2(-ThisBounds.x, ThisBounds.y)));
			var corner3 : Vector3 = FX3DRM.RiftCameras[1].WorldToViewportPoint((center + Vector2(ThisBounds.x, -ThisBounds.y)));
			var corner4 : Vector3 = FX3DRM.RiftCameras[1].WorldToViewportPoint((center + Vector2(-ThisBounds.x, -ThisBounds.y)));
					
			//Find the Left, Right, Top, & Bottom most points
			Min.x = Mathf.Min(corner1.x, corner2.x, corner3.x, corner4.x);
			Max.x = Mathf.Max(corner1.x, corner2.x, corner3.x, corner4.x);		
			Max.y = Mathf.Max(corner1.y, corner2.y, corner3.y, corner4.y);
			Min.y = Mathf.Min(corner1.y, corner2.y, corner3.y, corner4.y);
		}else{ // Calculation Method 2 : Do a more advanced calculation for finding all 8 points of the objects bounds & convert there world positions to viewport space
			var TopFrontLeft : Vector3 = FX3DRM.RiftCameras[1].WorldToViewportPoint(Vector3(center.x + ThisBounds.x, center.y + ThisBounds.y, center.z - ThisBounds.z));
			var TopFrontRight : Vector3 = FX3DRM.RiftCameras[1].WorldToViewportPoint(Vector3(center.x - ThisBounds.x, center.y + ThisBounds.y, center.z - ThisBounds.z));
			var TopBackLeft : Vector3 = FX3DRM.RiftCameras[1].WorldToViewportPoint((center + ThisBounds));
			var TopBackRight : Vector3 = FX3DRM.RiftCameras[1].WorldToViewportPoint(Vector3(center.x - ThisBounds.x, center.y + ThisBounds.y, center.z + ThisBounds.z));
			var BottomFrontLeft : Vector3 = FX3DRM.RiftCameras[1].WorldToViewportPoint(Vector3(center.x + ThisBounds.x, center.y - ThisBounds.y, center.z - ThisBounds.z));
			var BottomFrontRight : Vector3 = FX3DRM.RiftCameras[1].WorldToViewportPoint((center - ThisBounds));
			var BottomBackLeft : Vector3 = FX3DRM.RiftCameras[1].WorldToViewportPoint(Vector3(center.x + ThisBounds.x, center.y - ThisBounds.y, center.z + ThisBounds.z));
			var BottomBackRight : Vector3 = FX3DRM.RiftCameras[1].WorldToViewportPoint(Vector3(center.x - ThisBounds.x, center.y - ThisBounds.y, center.z + ThisBounds.z));
					
			//Find the Left, Right, Top, & Bottom most points
			Max.x = Mathf.Max(TopFrontLeft.x, TopBackLeft.x, TopFrontRight.x, TopBackRight.x, BottomFrontLeft.x, BottomBackLeft.x, BottomFrontRight.x, BottomBackRight.x);
			Min.x = Mathf.Min(TopFrontLeft.x, TopBackLeft.x, TopFrontRight.x, TopBackRight.x, BottomFrontLeft.x, BottomBackLeft.x, BottomFrontRight.x, BottomBackRight.x);
			Max.y = Mathf.Max(TopFrontLeft.y, TopBackLeft.y, TopFrontRight.y, TopBackRight.y, BottomFrontLeft.y, BottomBackLeft.y, BottomFrontRight.y, BottomBackRight.y);
			Min.y = Mathf.Min(TopFrontLeft.y, TopBackLeft.y, TopFrontRight.y, TopBackRight.y, BottomFrontLeft.y, BottomBackLeft.y, BottomFrontRight.y, BottomBackRight.y);
		}
				
		if(FX3DRM.SetLimits){
			var centerPos : Vector2 = FX3DRM.RiftCameras[1].WorldToViewportPoint(center);
			var PreComputeMinMax : Vector2 = Vector2(FX3DRM.MaxSize.x * .5, FX3DRM.MaxSize.y * .5);
			
			if(Max.x - Min.x >= FX3DRM.MaxSize.x){
			  Max.x = centerPos.x + PreComputeMinMax.x;
			  Min.x = centerPos.x - PreComputeMinMax.x;
			}
		
			if(Max.y - Min.y >= FX3DRM.MaxSize.y){
			 Max.y = centerPos.y + PreComputeMinMax.y;
			  Min.y = centerPos.y - PreComputeMinMax.y;
			}
		}
		
		Max = FX3DRM.RiftCameras[1].ViewportToScreenPoint(Vector3(Max.x, Max.y, 1));
		Min = FX3DRM.RiftCameras[1].ViewportToScreenPoint(Vector3(Min.x, Min.y, 1));
		
		Max = Vector3(Mathf.Round(Max.x) +.5, Mathf.Round(Max.y) + .5, 1);
		Min = Vector3(Mathf.Round(Min.x) + .5, Mathf.Round(Min.y) +.5, 1);

		//Position our corners from viewport space back into world space
		IndicatorCorners[4].position = FX3DRM.RiftCameras[0].ScreenToWorldPoint(Vector3(Min.x, Max.y, 1) + FX3DRM.HUDOffset);
		IndicatorCorners[5].position = FX3DRM.RiftCameras[0].ScreenToWorldPoint(Vector3(Max.x, Max.y, 1) + FX3DRM.HUDOffset);
		IndicatorCorners[6].position = FX3DRM.RiftCameras[0].ScreenToWorldPoint(Vector3(Min.x, Min.y, 1) + FX3DRM.HUDOffset);
		IndicatorCorners[7].position = FX3DRM.RiftCameras[0].ScreenToWorldPoint(Vector3(Max.x, Min.y, 1) + FX3DRM.HUDOffset);
				
	}else{
		if(BoundsEnabled){
			DisableBounds();
		}
	}
}
/***********************************************************************************/
															//Called Functions
/***********************************************************************************/
function DestroyThis(){
	if(!IsNAV){
		Destroy(BoundsCorners);
		FX3DRM.RemoveFromList(ThisID[0]);
	}
		
	Destroy(ThisID[1].gameObject);
	Destroy(ThisID[2].gameObject);
	Destroy(ThisID[3].gameObject);

	if(IsPlayerTarget){
		FX3DRM.ClearTarget();
	}
	
Destroy(gameObject);
}

function EnableRID(){
	if(ThisID[1]){
		ThisID[1].renderer.enabled = true;
		ThisID[2].renderer.enabled = true;
		ThisID[3].renderer.enabled = true;
	}

RID_Enabled = true;
UpdatePlayerContacts();
}

function DisableRID(){

	if(ThisID[1]){
		ThisID[1].renderer.enabled = false;
		ThisID[2].renderer.enabled = false;
		ThisID[3].renderer.enabled = false;
	}

	if(IsPlayerTarget){
		FX3DRM.ClearTarget();
		IsPlayerTarget = false;
	}

RID_Enabled = false;
UpdatePlayerContacts();
}

function EnableBounds(){
BoundsCorners.SetActive(true);
BoundsEnabled = true;
}

function DisableBounds(){
BoundsCorners.SetActive(false);
BoundsEnabled = false;
}

function CreateRadarID(){
var Parent : Transform = GameObject.Find("RadarTags").transform;
/***********************************************************************************/
															//Create This Radar ID
/***********************************************************************************/
VDIScale = 1 / ((Screen.height * FX3DRM.Cameras[1].rect.height) / 1) * .5;

ThisID[1] = FX3DRM.MakeQuad("ID_Tag", FX3DRM.RIDSize, true, Vector3(FX3DRM.Cameras[1].transform.eulerAngles.x,0,0), Parent, FX3DRM.Layers[1]);
ThisID[2] = FX3DRM.MakeQuad("ID_Base", FX3DRM.RIDSize, true, Vector3(FX3DRM.Cameras[1].transform.eulerAngles.x,0,0), Parent, FX3DRM.Layers[1]);
ThisID[3] = FX3DRM.MakeQuad("VDI", 1, true, Vector3.zero, Parent, FX3DRM.Layers[1]);

VDIMesh = ThisID[3].GetComponent(MeshFilter).mesh;

GetNewTexture();
GetNewColor();

	var Distance : float = ((FX_3DRadar_Mgr.PlayerPos - ThisPos).sqrMagnitude);
	if(Distance < FX_3DRadar_Mgr.RadarRangeSQR){
		EnableRID();
	}else{
		DisableRID();
	}
}

function CreateBounds(){
//Create our corners
BoundsCorners = new GameObject("BoundsContainer");
BoundsCorners.transform.parent = GameObject.Find("BoundsCorners").transform;
BoundsCorners.transform.localPosition = Vector3.zero;
/***********************************************************************************/
											//Create Bounds Corners
/***********************************************************************************/
	if(FX3DRM.EnableRift){
		IndicatorCorners = new Transform[8];
		IndicatorCorners[4] = FX3DRM.MakeQuad("TL", 32, false,  Vector3(0, 0, 270), BoundsCorners.transform, FX3DRM.RiftLayer);
		IndicatorCorners[5] = FX3DRM.MakeQuad("TR", 32, false, Vector3(0, 0, 180), BoundsCorners.transform, FX3DRM.RiftLayer);
		IndicatorCorners[6] = FX3DRM.MakeQuad("BL", 32, false, Vector3(0, 0, 0), BoundsCorners.transform, FX3DRM.RiftLayer);
		IndicatorCorners[7] = FX3DRM.MakeQuad("BR", 32, false, Vector3(0, 0, 90), BoundsCorners.transform, FX3DRM.RiftLayer);

		IndicatorCorners[4].renderer.enabled = true;
		IndicatorCorners[5].renderer.enabled = true;
		IndicatorCorners[6].renderer.enabled = true;
		IndicatorCorners[7].renderer.enabled = true;
	}
		
IndicatorCorners[0] = FX3DRM.MakeQuad("TL", 32, false,  Vector3(0, 0, 270), BoundsCorners.transform, FX3DRM.Layers[2]);
IndicatorCorners[1] = FX3DRM.MakeQuad("TR", 32, false, Vector3(0, 0, 180), BoundsCorners.transform, FX3DRM.Layers[2]);
IndicatorCorners[2] = FX3DRM.MakeQuad("BL", 32, false, Vector3(0, 0, 0), BoundsCorners.transform, FX3DRM.Layers[2]);
IndicatorCorners[3] = FX3DRM.MakeQuad("BR", 32, false, Vector3(0, 0, 90), BoundsCorners.transform, FX3DRM.Layers[2]);

IndicatorCorners[0].renderer.enabled = true;
IndicatorCorners[1].renderer.enabled = true;
IndicatorCorners[2].renderer.enabled = true;
IndicatorCorners[3].renderer.enabled = true;
}

function GetNewColor(){
var UseColor : Color = FX3DRM.GetIFFColor(IFF);

FX3DRM.SetNewColor(ThisID[1].gameObject, Color(UseColor.r, UseColor.g, UseColor.b, FX3DRM.RIDAlpha));

	if(!FX3DRM.VDIOff){
		if(!FX3DRM.BaseIDOff){
			FX3DRM.SetNewColor(ThisID[2].gameObject, Color(UseColor.r, UseColor.g, UseColor.b, FX3DRM.VDIAlpha));					
		}else{
			FX3DRM.SetNewColor(ThisID[2].gameObject, Color(UseColor.r, UseColor.g, UseColor.b, 0.0));
		}
		FX3DRM.SetNewColor(ThisID[3].gameObject, Color(UseColor.r, UseColor.g, UseColor.b, FX3DRM.VDIAlpha));
	}else{
		FX3DRM.SetNewColor(ThisID[2].gameObject, Color(UseColor.r, UseColor.g, UseColor.b, 0.0));
		FX3DRM.SetNewColor(ThisID[3].gameObject, Color(UseColor.r, UseColor.g, UseColor.b, 0.0));
	}
	
	if(!IsNAV){
		FX3DRM.SetNewColor(IndicatorCorners[0].gameObject, Color(UseColor.r, UseColor.g, UseColor.b, FX3DRM.BoundsAlpha));
		FX3DRM.SetNewColor(IndicatorCorners[1].gameObject, Color(UseColor.r, UseColor.g, UseColor.b, FX3DRM.BoundsAlpha));
		FX3DRM.SetNewColor(IndicatorCorners[2].gameObject, Color(UseColor.r, UseColor.g, UseColor.b, FX3DRM.BoundsAlpha));
		FX3DRM.SetNewColor(IndicatorCorners[3].gameObject, Color(UseColor.r, UseColor.g, UseColor.b, FX3DRM.BoundsAlpha));
		
		if(FX3DRM.EnableRift){
			FX3DRM.SetNewColor(IndicatorCorners[4].gameObject, Color(UseColor.r, UseColor.g, UseColor.b, FX3DRM.BoundsAlpha));
			FX3DRM.SetNewColor(IndicatorCorners[5].gameObject, Color(UseColor.r, UseColor.g, UseColor.b, FX3DRM.BoundsAlpha));
			FX3DRM.SetNewColor(IndicatorCorners[6].gameObject, Color(UseColor.r, UseColor.g, UseColor.b, FX3DRM.BoundsAlpha));
			FX3DRM.SetNewColor(IndicatorCorners[7].gameObject, Color(UseColor.r, UseColor.g, UseColor.b, FX3DRM.BoundsAlpha));		
		}
	}
	
	if(CurrentIFFClass[0] != ThisClass[0] || CurrentIFFClass[0] != ThisClass[1]){
		GetNewTexture();
		CurrentIFFClass[0] = ThisClass[0];
		CurrentIFFClass[1] = ThisClass[1];
	}

CurrentIFFClass[2] = IFF;
}

function GetNewTexture(){
	if(IFF == 6){ // Nav
		FX3DRM.SetTextureOffset(1, 8, ThisID[1].gameObject, 32);
	}else{
		FX3DRM.SetTextureOffset(ThisClass[0], ((ThisClass[1] + 9)), ThisID[1].gameObject, 32);
	}

FX3DRM.SetTextureOffset(15, 15, ThisID[2].gameObject, 32);
FX3DRM.SetTextureOffset(14, 15, ThisID[3].gameObject, 32);
	
	if(!IsNAV){
		FX3DRM.SetTextureOffset(2, 8, IndicatorCorners[0].gameObject, 32);
		FX3DRM.SetTextureOffset(2, 8, IndicatorCorners[1].gameObject, 32);
		FX3DRM.SetTextureOffset(2, 8, IndicatorCorners[2].gameObject, 32);
		FX3DRM.SetTextureOffset(2, 8, IndicatorCorners[3].gameObject, 32);

		if(FX3DRM.EnableRift){
			FX3DRM.SetTextureOffset(2, 8, IndicatorCorners[4].gameObject, 32);
			FX3DRM.SetTextureOffset(2, 8, IndicatorCorners[5].gameObject, 32);
			FX3DRM.SetTextureOffset(2, 8, IndicatorCorners[6].gameObject, 32);
			FX3DRM.SetTextureOffset(2, 8, IndicatorCorners[7].gameObject, 32);		
		}
	}
}

function ResetScale(){
	if(ThisID[1]){
		Destroy(ThisID[1].gameObject);
		Destroy(ThisID[2].gameObject);
		Destroy(ThisID[3].gameObject);
		CreateRadarID();
	}
}

function SetAsAI(){
IsNAV = false;
IsPlayer = false;
}

function SetAsPlayer(){
ThisFaction = FXFM.PlayerFaction;
IsPlayer = true;
IsNAV = false;
}

function SetAsNAV(){
IFF = 6;
IsNAV = true;
IsPlayer = false;
BlindRadarOverride = true;
BoundsOverride = true;
}

function CheckStatus(){
	if(CurrentIFFClass[0] != ThisClass[0] || CurrentIFFClass[1] != ThisClass[1] || CurrentIFFClass[2] != IFF){
		GetNewColor();
	}
	
	if(CurStatus[0] != IsPlayer){
		if(IsPlayer){
			SetAsPlayer();
		}else{
			SetAsAI();
		}
		CurStatus[0] = IsPlayer;
		SetIFFStatus();
		GetNewColor();
		UpdatePlayerContacts();
	}
			
	if(CurStatus[1] != IsPlayerOwned){
		CurStatus[1] = IsPlayerOwned;
		SetIFFStatus();
		GetNewColor();
		UpdatePlayerContacts();
	}

	if(CurStatus[2] != IsAbandoned){
		CurStatus[2] = IsAbandoned;
		ThisFactionTemp = ThisFaction;
		ThisFactionID = FXFM.FactionID[ThisFaction];
		SetIFFStatus();
		GetNewColor();
		UpdatePlayerContacts();
	}

	if(ThisFactionTemp != ThisFaction){
		ThisFactionTemp = ThisFaction;
		ThisFactionID = FXFM.FactionID[ThisFaction];
		SetIFFStatus();
		GetNewColor();
		UpdatePlayerContacts();
	}
}

function SetIFFStatus(){
	if(!IsNAV){
		if(!IsPlayerOwned && IsAbandoned){
			ThisFactionID = -1;
			IFF = 0;
		}else if(IsPlayerOwned){
			IFF = 5;
			ThisFaction = FXFM.PlayerFaction;
			ThisFactionID = FXFM.PlayerFactionID;
			IsAbandoned = false;
		}else if(ThisFactionID == FXFM.PlayerFactionID){
			IFF = 2;
		}else{
		
			var ThisRelation : float = FXFM.FactionRelations[(FXFM.PlayerFactionID + ThisFactionID)];
			
			if(ThisRelation <= FXFM.HFS[0]){
				IFF = 3;
			}else if(ThisRelation > FXFM.HFS[0] && ThisRelation < FXFM.HFS[1]){
				IFF = 1;
			}else if(ThisRelation >= FXFM.HFS[1]){
				IFF = 2;
			}
		}

	}
}

function BuildHostileList() {
var TempTargetList : Collider[] = Physics.OverlapSphere(transform.position, RadarRange / FX3DRM.GameScale, 1 << FX3DRM.Layers[3]);

	for(var i : int = 0; i < TempTargetList.Length; i++){
		var GetFactionID : int = TempTargetList[i].GetComponent(FX_3DRadar_RID).ThisFactionID;
		if(GetFactionID > 0 && GetFactionID != ThisFactionID){
			var ThisRelation : int = FXFM.FactionRelations[(GetFactionID + ThisFactionID)];
		
			if(ThisRelation <= FXFM.HFS[0]){
				HostileList.Add(TempTargetList[i].transform);
			}
		}
	}
}

function UpdatePlayerContacts(){
	if(!IsNAV && !IsPlayer){
		FX3DRM.RemoveFromList(ThisID[0]);
		if(RID_Enabled){
			FX3DRM.AddToList(IFF, ThisID[0]);
		}
	}
}
//End
