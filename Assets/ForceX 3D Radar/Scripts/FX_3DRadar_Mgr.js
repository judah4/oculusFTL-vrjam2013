#pragma strict
import System.Collections.Generic;
import System.Linq;

//Layers
var RadarAtlasMaterial : Material;
var Layers : int[] = new int[4]; // 0 = RadarLayer1, 1 = RadarLyaer2, 2 = HUDLayer, 3 = RadarContactLayer

//Components
var PlayerT : Transform;
var RadarObject : Transform;
var Cameras : Camera[] = new Camera[4]; // 0 = Radar Camera Perspective, 1 = Radar Camera Ortho, 2 = HUD Camera, 3 = Player Camera
var PlayerCameraT : Transform[] = new Transform[2];

//Oculus Rift Settings
var EnableRift : boolean;
var RiftCameras : Camera[] = new Camera[2]; // 0 = HUD Camera 2, 1 = Player Camera 2
var RiftLayer : int;

//Radar Settings
enum radarZoom {Normal, Zoom_In_2X, Zoom_In_X4, Boost_1_5, Boost_2,}
enum radarPos {Use_My_Position, Top_Left, Top_Right, Bottom_Left, Bottom_Right, Use_Render_Texture_PRO}
var RadarZoom : radarZoom;
var RadarPos : radarPos;
var Perspective : boolean;
var EnableBlindRadar : boolean;
var RadarUpdate : float = 1.0;
var reTime : float = 5;
var ObstructionLayers : int[] = new int[3];
var GameScale : float = 1;
var RadarRange : float = 1.0;
static var PlayerPos : Vector3;
static var RadarRangeSQR : float;
static var RadarLocalScale : float;
static var ObstructionLayer : int;
private var RadarGameScale : float;
private var CurrentZoom : int = -1;
private var TargetIsFront : boolean;

//Render To Texture Settings
enum renderFlag {Solid_Color, Depth_Only}
var RenderFlag : renderFlag;
var RenderTarget : GameObject;
var RenderTargetRez : Vector3 = Vector3(512, 512, 24);
var RenderSolidColor : Color;
var RIDSize : int;
var VDISizeOverride : int = 1;

//Targeting List Settings
private var TargetListAll : List.<Transform> = new List.<Transform>();
private var TargetListFriendly : List.<Transform> = new List.<Transform>();
private var TargetListNeutral : List.<Transform> = new List.<Transform>();
private var TargetListHostile : List.<Transform> = new List.<Transform>();
private var TargetListOwned : List.<Transform> = new List.<Transform>();
private var TargetListAband : List.<Transform> = new List.<Transform>();
private var SubComponentList : List.<Transform> = new List.<Transform>();
private var ThisCurrentTarget : Vector2 = Vector2.zero;
private var ThisDistance : float;
private var FXFM : FX_Faction_Mgr;
var FilterHostile : boolean;

//Selected Target Settings
var SelectedTargetT : Transform;
private var SelectedTargetRP : FX_3DRadar_RID; // Target Radar ID Properties
private var SelectedSubComp : Transform;
private var TargetIFFID : int = -1;
private var ThisClass : int[] = new int[2];
private var TargetLayer : int;

//NAV Settings
var DisplayNAVRadar : boolean = true;
var NavDistance : float = 1.0;
var NavList : Transform[];
private var CurNav : int;
private var NavDistanceSqr : float;

//Target Lead Indicator Settings
var ProjectileVelocity : float = 1;
private var previousPos0 : Vector3;
private var previousPos1 : Vector3;

// HUD GUI Settings
var HUDOffset : Vector2;
var EdgePadding : Vector2 = Vector2(32, 32);
var ColorAbandoned : Color = Color.magenta;
var ColorNeutral : Color = Color.gray;
var ColorFriendly : Color = Color(0,.3,1,1);
var ColorHostile : Color = Color.red;
var ColorUnknown : Color = Color.yellow;
var ColorOwned: Color = Color.green;
var ColorNAV : Color = Color(1, .6, 0, 1);
var HUDAlpha : float = 1.0;
var RIDAlpha : float = 1.0;
var VDIAlpha : float = 0.1;
var VDIOff : boolean;
var BaseIDOff : boolean;
private var NAV_HUD : Transform[] = new Transform[2];
private var TLI_HUD : Transform[] = new Transform[2];
private var TSB_HUD : Transform[] = new Transform[2];
private var TSB_ID_HUD : Transform[] = new Transform[2];
private var SCTSB_HUD : Transform[] = new Transform[2];
private var TSB_Radar : Transform;
private var DIA_HUD : Transform;
private var DIA_Helper : Transform;

//Other Settings
var Enabled : boolean = true;
var EnableDirectionArrow : boolean = true;
var DIARadius : int = 150;
private var DIAdisableAngle : int;
private var VFBounds : Vector2;
private var ScreenCenter : Vector2;
private var ScreenSize : Vector2;
private var scrollPosition : Vector2;
var EnableTargetList : boolean;
var LocalTime : float;
 
//Sounds
var WarningSoundStart : boolean = true;
var SelectSound : AudioClip;
var ClearSound : AudioClip;
var WarningSound : AudioClip;

//Bounds
var BoundsEnabled : boolean;

enum boundsShow {Display_Only_In_Radar_Range, Display_Always, Display_Always_After_Contact}
var BoundsShow : boundsShow;

enum boundsSize {Dynamic_Size, Static_Size}
var BoundsSize : boundsSize;

enum  boundsCalculation {Simple, Advanced}
var BoundsCalculation  : boundsCalculation;

var BoundsPadding : float = 1.0;
var StaticScale : Vector2 = Vector2(1,1);

var SetLimits : boolean = true;
var MaxSize : Vector2 = Vector2(0.08, 0.2);

var BoundsAlpha : float = 0.5;

function Awake(){
FXFM = GetComponent(FX_Faction_Mgr);
Physics.IgnoreLayerCollision(Layers[0],Layers[3]);
transform.position = Vector3.zero;
gameObject.AddComponent(AudioSource);
ScreenSize = Vector2(Screen.width, Screen.height);
ScreenCenter = Vector2(Screen.width * .5, Screen.height * .5);
NavDistanceSqr = ((NavDistance / GameScale) * (NavDistance / GameScale));
SelectedTargetT = null;

ObstructionLayer = (1 << ObstructionLayers[0] | 1 << ObstructionLayers[1] | 1 << ObstructionLayers[2]);

var RadarTags : GameObject = new GameObject("RadarTags");
RadarTags.transform.parent = transform;

var BC : Transform = new GameObject("BoundsCorners").transform;
BC.transform.parent = transform;

	if(RadarPos != 5){
		RIDSize = 32;
	}
/***********************************************************************************/
														//Cache Player Camera
/***********************************************************************************/
if(Cameras[3] == null){
	Debug.Log(transform.name + " : Please assign a Camera to " + transform.name + " --> FX_Radar_Master --> Player Camera");
	Debug.Log("3D Radar Has Encountered An Error And Will Be Disabled");
	Enabled = false;
}else{
	PlayerCameraT[0] = Cameras[3].transform;
	if(EnableRift){
		if(RiftCameras[1]){
			PlayerCameraT[1] = RiftCameras[1].transform;
			RiftCameras[1].cullingMask = ~(1 << Layers[0] | 1 << Layers[1] | 1 << Layers[2] | 1 << RiftLayer);
		}
		Cameras[3].cullingMask = ~(1 << Layers[0] | 1 << Layers[1] | 1 << Layers[2] | 1 << RiftLayer);
	}else{
		Cameras[3].cullingMask = ~(1 << Layers[0] | 1 << Layers[1] | 1 << Layers[2]);
	}
	
}

/***********************************************************************************/
														//Cache & Configure Radar Camera
/***********************************************************************************/
if(Cameras[0] == null){
	Debug.Log(transform.name + " : Please assign a Camera to " + transform.name + " --> FX_Radar_Master --> Radar Camera");
	Debug.Log("3D Radar Has Encountered An Error And Will Be Disabled");
	Enabled = false;
}else{
	Cameras[0].renderingPath = RenderingPath.Forward;
	Cameras[0].cullingMask = 1 << Layers[0];
	Cameras[0].depth = Cameras[3].depth + 1;
	Cameras[0].gameObject.layer = Layers[1];
	Cameras[1] = new GameObject("_Cameras[1]").AddComponent(Camera).camera;
	Cameras[1].rect = Cameras[0].rect;
	Cameras[1].isOrthoGraphic = true;
	Cameras[1].orthographicSize = 0.5;
	Cameras[1].depth = Cameras[0].depth + 1;
	Cameras[1].transform.position = Cameras[0].transform.position;
	Cameras[1].transform.eulerAngles = Cameras[0].transform.eulerAngles;
	Cameras[1].clearFlags = CameraClearFlags.Depth;
	Cameras[1].farClipPlane = 2;
	Cameras[1].transform.parent = RadarObject;
	
	if(Perspective){
		Cameras[1].cullingMask = 1 << Layers[1];
		Cameras[0].isOrthoGraphic = false;
	}else{
		Cameras[0].enabled = false;
		Cameras[1].cullingMask = 1 << Layers[1] | 1 << Layers[0];
	}

}

/***********************************************************************************/
														//Cache & Configure Radar Object
/***********************************************************************************/
	if(RadarObject == null){
		Debug.Log(transform.name + " : Please assign a Object to " + transform.name + " -->  FX_Radar_Master --> Radar Object");
		Debug.Log("3D Radar Has Encountered An Error And Will Be Disabled");
		Enabled = false;
	}else{
		RadarObject.gameObject.layer = Layers[0];
	}

	if(Enabled){
		CreateHUD();
		DisableHUD();
		RadarSetup();
	}
ResetScale();
}

function Update(){
LocalTime = Time.time;

	if(WarningSoundStart && TargetListHostile.Count > 0){
		PlayWarningSound();
		WarningSoundStart = false;
	}
	
	if(!PlayerT){
		Enabled = false;
	}
	
	if(ScreenSize.y != Screen.height){
		ResetScale();
	}

	if(Enabled){
		PlayerPos = PlayerT.position;
		TargetingCommands();
		if(CurrentZoom != RadarZoom){
			SetRadarScaleZoom();
		}
	}
}

function LateUpdate(){
	if(Enabled){
		UpdateNAV();
		if(SelectedTargetT){
			RIDS();
		}else{
			if(TSB_HUD[0].renderer.enabled){
				DisableHUD();
			}
		}
	}
}

/***********************************************************************************/
															//NAV Late Update
/***********************************************************************************/
function UpdateNAV(){

	if(NavList.Length > 0){
		var newScreenPos : Vector3 = IndicatorPositionsMain(NavList[CurNav].position, 0,0);
		NAV_HUD[0].position = newScreenPos;
		
		if(EnableRift){
			newScreenPos = IndicatorPositionsRift(NavList[CurNav].position, 0,0);
			NAV_HUD[1].position = newScreenPos;
		}

		if((NavList[CurNav].position - PlayerPos).sqrMagnitude < NavDistanceSqr){
			if(CurNav == (NavList.Length - 1)){
			 	NavList[CurNav].GetComponent(FX_3DRadar_RID).DestroyThis();

			 	NavList = new Transform[0];
			 	NAV_HUD[0].renderer.enabled = false;
			 	if(EnableRift){
			 		NAV_HUD[1].renderer.enabled = false;
			 	}
			}else{
				NavList[CurNav].GetComponent(FX_3DRadar_RID).DestroyThis();
				CurNav++;
				NavList[CurNav].gameObject.AddComponent(FX_3DRadar_RID).IsNAV = true;
			}
		}
	}
}

function CreateNAV(MyNAV : Transform[]){
NavList = new Transform[MyNAV.Length];
	for(var i : int = 0; i < MyNAV.Length; i++){
		NavList[i] = MyNAV[i];
	}
CurNav = 0;
NavList[CurNav].gameObject.AddComponent(FX_3DRadar_RID).IsNAV = true;
NAV_HUD[0].renderer.enabled = true;
	if(EnableRift){
		NAV_HUD[1].renderer.enabled = true;
	}
}

/***********************************************************************************/
															//Radar Late Update
/***********************************************************************************/
function RIDS(){//Targeting

var TargetPos : Vector3 = SelectedTargetT.position;
var RelPos : Vector3 = (PlayerPos - TargetPos);
ThisDistance = RelPos.magnitude;
			
if(ThisDistance < RadarGameScale){
	TSB_HUD[0].renderer.enabled = true;
	TSB_ID_HUD[0].renderer.enabled = true;
	if(TSB_Radar.renderer.enabled == false){
		TSB_Radar.renderer.enabled = true;
	}
	if(EnableRift){
		TSB_HUD[1].renderer.enabled = true;
		TSB_ID_HUD[1].renderer.enabled = true;	
	}

/***********************************************************************************/
									//Set HUD GUI color based on selected target IFF status
/***********************************************************************************/
	if(TargetIFFID != SelectedTargetRP.IFF){
		GetNewColor();
	}
	
	if(ThisClass[0] != SelectedTargetRP.ThisClass[0] || ThisClass[1] != SelectedTargetRP.ThisClass[1]){
		SetTextureOffset(SelectedTargetRP.ThisClass[0], SelectedTargetRP.ThisClass[1] + 9, TSB_ID_HUD[0].gameObject, 32);
		if(EnableRift){
			SetTextureOffset(SelectedTargetRP.ThisClass[0], SelectedTargetRP.ThisClass[1] + 9, TSB_ID_HUD[1].gameObject, 32);
		}
		ThisClass[0] = SelectedTargetRP.ThisClass[0];
		ThisClass[1] = SelectedTargetRP.ThisClass[1];
	}

/***********************************************************************************/
														//Draw the radar TSB
/***********************************************************************************/
var newPosA : Vector3 = PlayerT.InverseTransformPoint(TargetPos) * RadarLocalScale;

	if(Perspective){
		newPosA = Cameras[0].WorldToScreenPoint(newPosA);
	}else{
		newPosA = Cameras[1].WorldToScreenPoint(newPosA);
	}
	
newPosA = Vector3(Mathf.Round(newPosA.x) + .5, Mathf.Round(newPosA.y) + .5, 1);
TSB_Radar.position = Cameras[1].ScreenToWorldPoint(newPosA);
/***********************************************************************************/
											//Draw the HUD TSB / Directional Indicator & Target ID
/***********************************************************************************/
var newScreenPos : Vector3 = IndicatorPositionsMain(TargetPos, 0,0);	
TSB_HUD[0].position = newScreenPos;

newScreenPos = IndicatorPositionsMain(TargetPos, 25,25);	
TSB_ID_HUD[0].position = newScreenPos;

if(EnableRift){
newScreenPos= IndicatorPositionsRift(TargetPos, 0,0);
TSB_HUD[1].position = newScreenPos;

newScreenPos = IndicatorPositionsRift(TargetPos, 25,25);	
TSB_ID_HUD[1].position = newScreenPos;
}
//**************************************************************************	
//												Draw Indicator Arrows
//**************************************************************************	

	if(EnableDirectionArrow && SelectedTargetT){
		DIA_HUD.renderer.enabled = true;
		IndicatorLocalizer(SelectedTargetT, DIA_Helper);
	}else{
		DIA_HUD.renderer.enabled = false;
	}
	/*
	if(EnableDirectionArrow && Objective){
		Indicator_Objective.gameObject.SetActive(true);
		IndicatorLocalizer(Objective, Indicator_Objective);
	}else{
		Indicator_Objective.gameObject.SetActive(false);
	}
}
	*/

	
/***********************************************************************************/
												//Draw the HUD sub component TSB
/***********************************************************************************/
	if(Vector3.Dot(PlayerCameraT[0].TransformDirection(Vector3.forward), RelPos) < 0){
		if(SelectedSubComp != null){
			SCTSB_HUD[0].renderer.enabled = true;
			newScreenPos =  IndicatorPositionsMain(SelectedSubComp.position, 0,0);	
			SCTSB_HUD[0].position = newScreenPos;
			
			if(EnableRift){
				SCTSB_HUD[1].renderer.enabled = true;
				newScreenPos =  IndicatorPositionsRift(SelectedSubComp.position, 0,0);	
				SCTSB_HUD[1].position = newScreenPos;
			}
		}

/***********************************************************************************/
												//Draw the HUD TLI (Target Lead Indicator)
/***********************************************************************************/		
		TLI_HUD[0].renderer.enabled = true;
		
		var RelTargetVelocity : Vector3 = ((TargetPos - previousPos0) - (PlayerPos - previousPos1)) / Time.deltaTime;;
		var TimeToTarget : float = FindIntercept(RelPos,RelTargetVelocity, RelPos.sqrMagnitude);
		
		newScreenPos = IndicatorPositionsMain(TargetPos + (RelTargetVelocity * TimeToTarget),0,0);
		
		previousPos0 = TargetPos;
		previousPos1 = PlayerPos;
		
		TLI_HUD[0].position = newScreenPos;
		
		if(EnableRift){
			TLI_HUD[1].renderer.enabled = true;
			newScreenPos = IndicatorPositionsRift(TargetPos + (RelTargetVelocity * TimeToTarget),0,0);
			TLI_HUD[1].position = newScreenPos;
		}
/***********************************************************************************/
										//Disable HUD GUI if the target is not in front of us
/***********************************************************************************/		
	}else{
		TLI_HUD[0].renderer.enabled = false;
		SCTSB_HUD[0].renderer.enabled = false;
		if(EnableRift){
			TLI_HUD[1].renderer.enabled = false;
			SCTSB_HUD[1].renderer.enabled = false;		
		}
	}
/***********************************************************************************/
												//Disable HUD GUI when the target is out of range
/***********************************************************************************/
	}else{
		DisableHUD();
	}
	
	if(SelectedTargetRP != null){
		if(!SelectedTargetRP.Detectable){
			ClearTarget();
		}
	}
}

function FindIntercept(relPos : Vector3,relVel : Vector3, relPosSqr : float){

	var velocitySquared : float = relVel.sqrMagnitude;

	if(velocitySquared < 0.001){
		return 0.0;
 	}
 	
	var a : float = velocitySquared - (ProjectileVelocity * ProjectileVelocity);
 
	if (Mathf.Abs(a) < 0.001){
		var t : float = -relPosSqr/(2.0 * Vector3.Dot(relVel, relPos));
		return Mathf.Max(t, 0.0);
	}
 
	var b : float = 2.0 * Vector3.Dot(relVel, relPos);
	var det : float = (b * b) - (4.0 * a * relPosSqr);
 
	if (det > 0.0) {
		var detSqrt : float = Mathf.Sqrt(det);
		var t1 : float = (-b + detSqrt)/(2.0 * a);
		var t2 : float = (-b - detSqrt)/(2.0 * a);

		if (t1 > 0.0) {
			if (t2 > 0.0){
				return Mathf.Min(t1, t2);
			}else{
				return t1;
			}
		}else{
			return Mathf.Max(t2, 0.0);
		}
	} else if (det < 0.0){
		return 0.0;
	}else{
		return Mathf.Max(-b / (2.0 * a), 0.0);
	}
}

function IndicatorPositionsMain(TargetPos : Vector3, Xoffset : int, Yoffset : int){
var ISP : Vector3;
var TRelPos = PlayerCameraT[0].InverseTransformPoint(TargetPos);
var ScreenPos = Cameras[3].WorldToViewportPoint(TargetPos);
var tHit : RaycastHit;
	
	if(ScreenPos.x > 1 || ScreenPos.x < 0 || ScreenPos.y > 1 || ScreenPos.y < 0 || ScreenPos.z <= 0.01){
		if(ScreenPos.x == .5 && ScreenPos.y == .5){
			TRelPos.y = 1;
		}
		Physics.Raycast (Vector3.zero, Vector3(TRelPos.x, TRelPos.y, 0), tHit, 2, 1 << Layers[2]);
		ISP = Vector3(((VFBounds.x * 0.5) + tHit.point.x) / VFBounds.x, (0.5 + tHit.point.y), 0 );
	}else{
		ISP = Vector3(ScreenPos.x, ScreenPos.y, ScreenPos.z);
	}

ISP = Cameras[2].ViewportToScreenPoint(ISP);

var ScreenX : float = (ScreenSize.x - EdgePadding.x);
var ScreenY : float = (ScreenSize.y - EdgePadding.y);

	if(ISP.x >= ScreenX){
		ISP.x = ScreenX;
	}else if(ISP.x <= EdgePadding.x){
		ISP.x = EdgePadding.x;
	}

	if(ISP.y >= ScreenY){
		ISP.y = ScreenY;
	}else if(ISP.y <= EdgePadding.y){
		ISP.y = EdgePadding.y;
	}
	
	if(ISP.x <= 0 || ISP.x >= ScreenX || ISP.y <= 0 || ISP.y >= ScreenY){
		if(TargetIsFront){
			SetTextureOffset(1, 0, TSB_HUD[0].gameObject, 64);
			if(EnableRift){
				SetTextureOffset(1, 0, TSB_HUD[1].gameObject, 64);
			}
			TargetIsFront = false;
		}
	}else{
		if(!TargetIsFront){
			SetTextureOffset(0, 0, TSB_HUD[0].gameObject, 64);
			if(EnableRift){
				SetTextureOffset(0, 0, TSB_HUD[1].gameObject, 64);
			}
			TargetIsFront = true;
		}
	}

ISP = Vector3(Mathf.Round(ISP.x + Xoffset + HUDOffset.x), Mathf.Round(ISP.y + Yoffset + HUDOffset.y), 1);
ISP = Cameras[2].ScreenToWorldPoint(Vector3(ISP.x, ISP.y, .9));
return ISP;
}

function IndicatorPositionsRift(TargetPos : Vector3, Xoffset : int, Yoffset : int){
var ISP : Vector3;
var TRelPos = PlayerCameraT[1].InverseTransformPoint(TargetPos);
var ScreenPos = RiftCameras[1].WorldToViewportPoint(TargetPos);
var tHit : RaycastHit;
	
	if(ScreenPos.x > 1 || ScreenPos.x < 0 || ScreenPos.y > 1 || ScreenPos.y < 0 || ScreenPos.z <= 0.01){
		if(ScreenPos.x == .5 && ScreenPos.y == .5){
			TRelPos.y = 1;
		}
		Physics.Raycast (Vector3.zero, Vector3(TRelPos.x, TRelPos.y, 0), tHit, 2, 1 << Layers[2]);
		ISP = Vector3(((VFBounds.x * 0.5) + tHit.point.x) / VFBounds.x, (0.5 + tHit.point.y), 0 );
	}else{
		ISP = Vector3(ScreenPos.x, ScreenPos.y, ScreenPos.z);
	}

ISP = RiftCameras[0].ViewportToScreenPoint(ISP);

var ScreenX : float = (ScreenSize.x - EdgePadding.x);
var ScreenY : float = (ScreenSize.y - EdgePadding.y);

	if(ISP.x >= ScreenX){
		ISP.x = ScreenX;
	}else if(ISP.x <= EdgePadding.x){
		ISP.x = EdgePadding.x;
	}

	if(ISP.y >= ScreenY){
		ISP.y = ScreenY;
	}else if(ISP.y <= EdgePadding.y){
		ISP.y = EdgePadding.y;
	}	

ISP = Vector3(Mathf.Round(ISP.x + Xoffset + HUDOffset.x), Mathf.Round(ISP.y + Yoffset + HUDOffset.y), 1);
ISP = RiftCameras[0].ScreenToWorldPoint(Vector3(ISP.x, ISP.y, .9));
return ISP;
}
/***********************************************************************************/
															//OnGUI Update
/***********************************************************************************/
function OnGUI(){
GUITargetDistance();
	if (EnableTargetList){
		DrawTargetList();
	}
}

function GUITargetDistance(){
	if(SelectedTargetT){
		var DisplayDistance : float = (ThisDistance * GameScale);
		if(DisplayDistance < 1000){
			GUI.Label (Rect(ScreenCenter.x,Screen.height - 30,120,20), "Distance: " + DisplayDistance.ToString("0. :m"));
		}else{
			GUI.Label (Rect(ScreenCenter.x,Screen.height - 30,120,20), "Distance: " + (DisplayDistance *.001).ToString("#.0 :km"));
		}
	}
}

function DrawTargetList(){

var Row : int = 0; 
var Col : int = 0;

// Background Box
GUILayout.BeginArea (Rect(Screen.width - 225,20,250,200),"");
GUI.Box (Rect(0,0,150,200),"");

// Slider Info
scrollPosition = GUI.BeginScrollView (Rect (0,0,170,200), scrollPosition, Rect (0, 0, 0, (TargetListAll.Count * 23)+10)); 

	// Draw Enemy Buttons
	for (var h : int = 0; h < TargetListHostile.Count; h++){
		GUI.color = ColorHostile;
		if (GUI.Button(Rect (0, 5 + (Col++ * 23), 150, 20),"" + TargetListHostile[h].name/*,GUIstyle*/)){ 
			if(SelectedTargetT){
				SelectedTargetRP.IsPlayerTarget = false;
			}
			SelectedTargetT = TargetListHostile[h];
			SetTarget();
		}
	}
	
	// Draw ColorOwnedButtons
	for (var o : int = 0; o < TargetListOwned.Count; o++){
		GUI.color = ColorOwned;
		if (GUI.Button(Rect (0, 5 + (Col++ * 23), 150, 20),"" + TargetListOwned[o].name/*,GUIstyle*/)){ 
			if(SelectedTargetT){
				SelectedTargetRP.IsPlayerTarget = false;
			}
			SelectedTargetT = TargetListOwned[o];
			SetTarget();
		}
	}
		
	// Draw Friendly Buttons
	for (var f : int = 0; f < TargetListFriendly.Count; f++){
		GUI.color = ColorFriendly;
		if (GUI.Button(Rect (0, 5 + (Col++ * 23), 150, 20),"" + TargetListFriendly[f].name/*,GUIstyle*/)){ 
			if(SelectedTargetT){
				SelectedTargetRP.IsPlayerTarget = false;
			}
			SelectedTargetT = TargetListFriendly[f];
			SetTarget();
		}
	}

	// Draw Neutral Buttons
	for (var n : int = 0; n < TargetListNeutral.Count; n++){
		GUI.color = ColorNeutral;
		if (GUI.Button(Rect (0, 5 + (Col++ * 23), 150, 20),"" + TargetListNeutral[n].name/*,GUIstyle*/)){ 
			if(SelectedTargetT){
				SelectedTargetRP.IsPlayerTarget = false;
			}
			SelectedTargetT = TargetListNeutral[n];
			SetTarget();
		}
	}
	
	// Draw Abandoned Buttons
	for (var a : int = 0; a < TargetListAband.Count; a++){
		GUI.color = ColorAbandoned;
		if (GUI.Button(Rect (0, 5 + (Col++ * 23), 150, 20),"" + TargetListAband[a].name/*,GUIstyle*/)){ 
			if(SelectedTargetT){
				SelectedTargetRP.IsPlayerTarget = false;
			}
			SelectedTargetT = TargetListAband[a];
			SetTarget();
		}
	}	
	GUI.EndScrollView(); 
	GUILayout.EndArea();
}

/***********************************************************************************/
																//Called Functions
/***********************************************************************************/
function AddToList(IFF : int, Contact : Transform){
	if(IFF == 0){
		TargetListAband.Add(Contact);
		TargetListAll.Add(Contact);
	}
	
	if(IFF == 1){
		TargetListNeutral.Add(Contact);
		TargetListAll.Add(Contact);
	}

	if(IFF == 2){
		TargetListFriendly.Add(Contact);
		TargetListAll.Add(Contact);
	}
	
	if(IFF == 3){
		TargetListHostile.Add(Contact);
		TargetListAll.Add(Contact);
	}

	if(IFF == 5){
		TargetListOwned.Add(Contact);
		TargetListAll.Add(Contact);
	}
}

function RemoveFromList(Contact : Transform){
	for(var a : int; a < TargetListAll.Count; a++){
		if(Contact == TargetListAll[a]){
			TargetListAll.RemoveAt(a);
		}
	}
	for(var f : int; f < TargetListFriendly.Count; f++){
		if(Contact == TargetListFriendly[f]){
			TargetListFriendly.RemoveAt(f);
		}
	}

	for(var n : int; n < TargetListNeutral.Count; n++){
		if(Contact == TargetListNeutral[n]){
			TargetListNeutral.RemoveAt(n);
		}
	}

	for(var h : int; h < TargetListHostile.Count; h++){
		if(Contact == TargetListHostile[h]){
			TargetListHostile.RemoveAt(h);
		}
	}

	for(var o : int; o < TargetListOwned.Count; o++){
		if(Contact == TargetListOwned[o]){
			TargetListOwned.RemoveAt(o);
		}
	}

	for(var ab : int; ab < TargetListAband.Count; ab++){
		if(Contact == TargetListAband[ab]){
			TargetListAband.RemoveAt(ab);
		}
	}
}

function RadarSetup(){//Setup Radar Settings & Camera Viewport
SetRadarScaleZoom();

	switch(RadarPos){
		case 1: // top left
		Cameras[1].targetTexture = null;
		Cameras[1].rect = Rect( 1 - (Cameras[1].rect.x + Cameras[1].rect.width), 1 - (Cameras[1].rect.y + Cameras[1].rect.height), Cameras[1].rect.width, Cameras[1].rect.height);
		
		break;
			
		case 2: // top right
		Cameras[1].targetTexture = null;
		Cameras[1].rect = Rect(Cameras[1].rect.x, 1 - (Cameras[1].rect.y + Cameras[1].rect.height), Cameras[1].rect.width, Cameras[1].rect.height);
		break;
			
		case 3: // bottom left
		Cameras[1].targetTexture = null;
		Cameras[1].rect = Rect( 1 - (Cameras[1].rect.x +  Cameras[1].rect.width), Cameras[1].rect.y, Cameras[1].rect.width, Cameras[1].rect.height);
		break;
			
		case 4: // bottom right
		Cameras[1].targetTexture = null;
		Cameras[1].rect = Rect(Cameras[1].rect.x, Cameras[1].rect.y, Cameras[1].rect.width, Cameras[1].rect.height);
		break;
			
		case 5: // Render To Texture
				if(RenderTarget){
					var TT = new RenderTexture(RenderTargetRez.x, RenderTargetRez.y, RenderTargetRez.z);
					TT.name = "Radar_Render_Texture";
					Cameras[1].targetTexture = TT;
					Cameras[1].rect = Rect(0, 0, 1, 1);
					RenderTarget.renderer.material = Resources.Load("Radar_Render_T") as Material;
					RenderTarget.renderer.material.SetTexture("_MainTex", TT);
				
					switch (RenderFlag){
					
						case 0:
							Cameras[1].clearFlags = CameraClearFlags.SolidColor;
							Cameras[1].backgroundColor = RenderSolidColor;
						break;
						
						case 1:
							Cameras[1].clearFlags = CameraClearFlags.Depth;
						break;
					}
				}else{
					Debug.Log("Please assign an object to recieve the render texture");
				}
		break;
	}
	Cameras[0].rect = Cameras[1].rect;
}

function SetRadarScaleZoom(){
var RadarZoomAmount : float;
	
	switch (RadarZoom){
		case 0:
		RadarZoomAmount = GameScale;
		break;
		
		case 1:
		RadarZoomAmount = (GameScale * 2.0);
		break;
		
		case 2:
		RadarZoomAmount = (GameScale * 4.0);
		break;
		
		case 3:
		RadarZoomAmount = (GameScale * 0.5);
		break;
		
		case 4:
		RadarZoomAmount = (GameScale * 0.25);
		break;
	}
	
RadarGameScale = (RadarRange / RadarZoomAmount);
RadarRangeSQR = (RadarGameScale * RadarGameScale);
RadarLocalScale = (1 / (RadarGameScale * 2));
CurrentZoom = RadarZoom;
}

function DisableHUD(){
	if(TSB_Radar.renderer.enabled == true){
		TSB_Radar.renderer.enabled = false;
		TSB_HUD[0].renderer.enabled = false;
		TSB_ID_HUD[0].renderer.enabled = false;
		TLI_HUD[0].renderer.enabled = false;
		SCTSB_HUD[0].renderer.enabled = false;
	
		if(EnableRift){
			TSB_HUD[1].renderer.enabled = false;
			TSB_ID_HUD[1].renderer.enabled = false;
			TLI_HUD[1].renderer.enabled = false;
			SCTSB_HUD[1].renderer.enabled = false;
		}
		
		DIA_HUD.renderer.enabled = false;
		ClearSubC();
		ClearTarget();
	}
}

function TargetingCommands(){//Targeting inputs
/***********************************************************************************/
							//Create an array of all avaliable targets
/***********************************************************************************/
	if(Input.GetKeyDown(KeyCode.U)){// Find the closest target to the player
		if(SelectedTargetT){
			SelectedTargetRP.IsPlayerTarget = false;
		}
		ClosestTarget();
	}
	if(Input.GetKeyDown(KeyCode.T)){// Find the next target in the array
		if(SelectedTargetT){
			SelectedTargetRP.IsPlayerTarget = false;
		}
		NextTarget();
	}
	if(Input.GetKeyDown(KeyCode.Y)){// Find the previous target in the array
		if(SelectedTargetT){
			SelectedTargetRP.IsPlayerTarget = false;
		}		
		PreviousTarget();
	}
	if(Input.GetKeyDown(KeyCode.M)){// Find the next Sub-component on the selected target
		NextSubComp();
		PlaySelectSCSound();
	}
	if(Input.GetKeyDown(KeyCode.N)){// Fin the previous Sub-component on the selected target
		PreviousSubComp();
		PlaySelectSCSound();
	}
	if(Input.GetKeyDown(KeyCode.B)){// Clear selected Sub-component
		PlayClearSCSound();
		ClearSubC();
	}
	if(Input.GetKeyDown(KeyCode.C)){// Clear selected target
		if(SelectedTargetT){
			SelectedTargetRP.IsPlayerTarget = false;
		}	
		ClearTarget();
	}
	if(Input.GetKeyDown(KeyCode.E)){// Find the closest Hostile to the player
		if(SelectedTargetT){
			SelectedTargetRP.IsPlayerTarget = false;
		}		
		ClosestHostile();
	}
	if(Input.GetKeyDown(KeyCode.R)){// Find the next Hostile in the array
		if(SelectedTargetT){
			SelectedTargetRP.IsPlayerTarget = false;
		}		
		NextHostile();
	}
	if(Input.GetKeyDown(KeyCode.F)){// Find the previous Hostile in the array
		if(SelectedTargetT){
			SelectedTargetRP.IsPlayerTarget = false;
		}		
		PreviousHostile();
	}
	if (Input.GetKeyDown(KeyCode.L)){ // Target List
		EnableTargetList = !EnableTargetList;
	}
	if (Input.GetKeyDown(KeyCode.H)){ // Target List
		FilterHostile = !FilterHostile;
	}

/***********************************************************************************/
										//Use the mouse button 0 to select a target
/***********************************************************************************/
	if(Input.GetMouseButtonUp(0)){
		var MouseHit : RaycastHit;
		var ray : Ray = Cameras[3].ScreenPointToRay(Input.mousePosition);
		if(Physics.Raycast (ray, MouseHit ,Mathf.Infinity, 1 << Layers[3])){
			if(SelectedTargetT){
				SelectedTargetRP.IsPlayerTarget = false;
			}			
			SelectedTargetT = MouseHit.transform;
			SetTarget();
		}
	}
}

function SetTarget(){//Targeting Function
/***********************************************************************************/
					//Gather the current target components & set target state
/***********************************************************************************/
	if(SelectedTargetT != null){
		PlaySelectSound();
		ClearSubC();
		SelectedTargetRP = SelectedTargetT.GetComponent(FX_3DRadar_RID);
		SelectedTargetRP.IsPlayerTarget = true;
		SetTextureOffset(SelectedTargetRP.ThisClass[0], SelectedTargetRP.ThisClass[1] + 9, TSB_ID_HUD[0].gameObject, 32);
		if(EnableRift){
			SetTextureOffset(SelectedTargetRP.ThisClass[0], SelectedTargetRP.ThisClass[1] + 9, TSB_ID_HUD[1].gameObject, 32);
		}
		ThisClass[0] = SelectedTargetRP.ThisClass[0];
		ThisClass[1] = SelectedTargetRP.ThisClass[1];
		TargetLayer = SelectedTargetT.gameObject.layer;
		previousPos0 = SelectedTargetT.position;
		if(TSB_HUD[0].position != Cameras[3].WorldToViewportPoint(SelectedTargetT.position)){
			TSB_HUD[0].renderer.enabled = false;
			TSB_ID_HUD[0].renderer.enabled = false;
			
			if(EnableRift){
				TSB_HUD[1].renderer.enabled = false;
				TSB_ID_HUD[1].renderer.enabled = false;			
			}
		}
	}
}

function ClosestTarget(){//Targeting Input Command
	var closestDistance : float = Mathf.Infinity;
	ClearTarget();
	for (var t : Transform in TargetListAll){
		var curDistance = (t.position - PlayerPos).sqrMagnitude;	
		if(curDistance < closestDistance){
			SelectedTargetT = t;
			closestDistance = curDistance;
		}
	}
SetTarget();
}

function NextTarget(){//Targeting Input Command
	if(TargetListAll.Count > 0){
		ThisCurrentTarget.x = (ThisCurrentTarget.x + 1) % TargetListAll.Count;
		SelectedTargetT = TargetListAll[ThisCurrentTarget.x];
	}
SetTarget();
}

function PreviousTarget(){//Targeting Input Command
	if(TargetListAll.Count > 0){
		if (ThisCurrentTarget.x == 0){
			ThisCurrentTarget.x = TargetListAll.Count;
		}
		if(ThisCurrentTarget.x > 0){
			ThisCurrentTarget.x = ThisCurrentTarget.x -1;
		}
	}
SelectedTargetT = TargetListAll[ThisCurrentTarget.x];
SetTarget();
}

function ClearTarget(){//Targeting Input Command
/***********************************************************************************/
														//Clear the current target
/***********************************************************************************/
	if(SelectedTargetT){
		PlayClearSound();
		SelectedTargetT = null;
	}
}

function FindSubComp(){//Targeting Function
/***********************************************************************************/
								//Create an array of all subcomponents on the selected target
/***********************************************************************************/
if(SelectedTargetT != null){
	SubComponentList.Clear();
	var SubComponent : Transform[] = SelectedTargetT.Cast.<Transform>().Select(function(t) { return t; }).ToArray();
		for(var s : Transform in SubComponent){
			if(s.tag == "Sub_Component"){
				SubComponentList.Add(s);
			}
		}
	}
}

function NextSubComp(){//Targeting Input Command
FindSubComp();
	if(SelectedTargetT && SubComponentList.Count > 0){
		ThisCurrentTarget.y = (ThisCurrentTarget.y + 1) % SubComponentList.Count;
		SelectedSubComp = SubComponentList[ThisCurrentTarget.y];
	}
}

function PreviousSubComp(){//Targeting Input Command
FindSubComp();
	if(SelectedTargetT && SubComponentList.Count > 0){
		if (ThisCurrentTarget.y == 0){
			ThisCurrentTarget.y = SubComponentList.Count;
		}
		if(ThisCurrentTarget.y > 0){
			ThisCurrentTarget.y = ThisCurrentTarget.y -1;
		}
		SelectedSubComp = SubComponentList[ThisCurrentTarget.y];
	}
}

function ClearSubC(){//Targeting Input Command
/***********************************************************************************/
											//Clear the current sub-component target
/***********************************************************************************/
	if(SelectedSubComp){
		SCTSB_HUD[0].renderer.enabled = false;
		if(EnableRift){
			SCTSB_HUD[1].renderer.enabled = false;
		}
		SelectedSubComp = null;
	}
}

function ClosestHostile(){//Targeting Input Command
	var closestDistance : float = Mathf.Infinity;
	//ClearTarget();
	for (var t : Transform in TargetListHostile){
		var curDistance = (t.position - PlayerPos).sqrMagnitude;	
		if(curDistance < closestDistance){
			SelectedTargetT = t;
			closestDistance = curDistance;
		}
	}
SetTarget();
}

function NextHostile(){//Targeting Input Command
	if(TargetListHostile.Count > 0){
		ThisCurrentTarget.x = (ThisCurrentTarget.x + 1) % TargetListHostile.Count;
		SelectedTargetT = TargetListHostile[ThisCurrentTarget.x];
	}
SetTarget();
}

function PreviousHostile(){//Targeting Input Command
	if(TargetListHostile.Count > 0){
		if (ThisCurrentTarget.x == 0){
			ThisCurrentTarget.x = TargetListHostile.Count;
		}
		if(ThisCurrentTarget.x > 0){
			ThisCurrentTarget.x = ThisCurrentTarget.x -1;
		}
	}
SelectedTargetT = TargetListHostile[ThisCurrentTarget.x];
SetTarget();
}

function PlaySelectSound(){
	if(SelectSound != null && SelectedTargetT){
		audio.PlayOneShot(SelectSound);
	}
}

function PlayClearSound(){
	if(ClearSound != null && SelectedTargetT){
		audio.PlayOneShot(ClearSound);
	}
}

function PlaySelectSCSound(){
	if(SelectSound != null && SelectedSubComp){
		audio.PlayOneShot(SelectSound);
	}
}

function PlayClearSCSound(){
	if(ClearSound != null && SelectedSubComp){
		audio.PlayOneShot(ClearSound);
	}
}

function PlayWarningSound(){
	if(WarningSound != null){
		audio.PlayOneShot(WarningSound);
	}
}

/***********************************************************************************/
															//Colors & Textures
/***********************************************************************************/
function GetIFFColor(uIFF : int){
var UseColor : Color;

	switch(uIFF){
		case  0:
			UseColor = ColorAbandoned;
		break;	
		case  1:
			UseColor = ColorNeutral;
		break;
		case  2:
			UseColor = ColorFriendly;
		break;
		case  3:
			UseColor = ColorHostile;
		break;
		case  4:
			UseColor = ColorUnknown;
		break;
		case  5:
			UseColor = ColorOwned;
		break;
		case 6:
			UseColor = ColorNAV;
		break;
	}
return UseColor;
}

function GetNewColor(){
var UseColor : Color = GetIFFColor(SelectedTargetRP.IFF);

SetNewColor(TSB_HUD[0].gameObject, Color(UseColor.r, UseColor.g, UseColor.b, HUDAlpha));
SetNewColor(TSB_ID_HUD[0].gameObject, Color(UseColor.r, UseColor.g, UseColor.b, HUDAlpha));
SetNewColor(TLI_HUD[0].gameObject, Color(UseColor.r, UseColor.g, UseColor.b, HUDAlpha));
SetNewColor(SCTSB_HUD[0].gameObject, Color(UseColor.r, UseColor.g, UseColor.b, HUDAlpha));
SetNewColor(TSB_Radar.gameObject, Color(UseColor.r, UseColor.g, UseColor.b, RIDAlpha));
SetNewColor(DIA_HUD.gameObject, Color(UseColor.r, UseColor.g, UseColor.b, HUDAlpha));

	if(EnableRift){
		SetNewColor(TSB_HUD[1].gameObject, UseColor);
		SetNewColor(TSB_ID_HUD[1].gameObject, UseColor);
		SetNewColor(TLI_HUD[1].gameObject, UseColor);
		SetNewColor(SCTSB_HUD[1].gameObject, UseColor);
	}
	
TargetIFFID = SelectedTargetRP.IFF;
}

function SetNewColor(ThisMesh : GameObject, ThisColor : Color){
var mesh : Mesh = ThisMesh.GetComponent(MeshFilter).mesh;
var vertices : Vector3[] = mesh.vertices;
var colors : Color[] = new Color[vertices.Length];

	for (var i = 0; i < vertices.Length;i++){
		colors[i] = ThisColor;
	}

mesh.colors = colors;
}

function SetTextureOffset(uType : int, uRank : int, ID_Transform : GameObject, TextureSize : int){
var AtlasTexture : Vector2 = Vector2(RadarAtlasMaterial.GetTexture("_MainTex").width, RadarAtlasMaterial.GetTexture("_MainTex").height);
var UV_Offset : Vector2;
var UV_Tiling : Vector2 = Vector2(TextureSize / AtlasTexture.x, TextureSize / AtlasTexture.y);
var theMesh : Mesh = ID_Transform.GetComponent(MeshFilter).mesh as Mesh;
var theUVs : Vector2[] = new Vector2[4];

theUVs = theMesh.uv;

	if(uType > 0){
		UV_Offset.x = (uType * TextureSize) / AtlasTexture.x;
	}
	
	if(uRank > 0){
		UV_Offset.y =  (uRank * TextureSize) / AtlasTexture.y;
	}

	theUVs[0] = Vector2(UV_Offset.x, 0 - (UV_Offset.y + UV_Tiling.y));
	theUVs[1] = Vector2(UV_Offset.x, -UV_Offset.y);
	theUVs[2] = Vector2(UV_Offset.x + UV_Tiling.x, -(UV_Offset.y + UV_Tiling.y));
	theUVs[3] = Vector2(UV_Offset.x + UV_Tiling.x, -UV_Offset.y);
	
	theMesh.uv = theUVs;
}

/***********************************************************************************/
														//Mesh Creators & Mods
/***********************************************************************************/
function MakeTri(Name : String, ThisScale : float, ThisParent : Transform, ThisLayer : int){
var ThisMesh : Transform  = new GameObject(Name).transform;
var mesh : Mesh = ThisMesh.gameObject.AddComponent(MeshFilter).mesh;
ThisScale *= .5;

var vertices : Vector3[]  = new Vector3[4];
vertices[0] = Vector3( -ThisScale, -ThisScale, 0);
vertices[1] =  Vector3( 0, ThisScale, 0);
vertices[2] =  Vector3(ThisScale, -ThisScale, 0);

var uv : Vector2[] = new Vector2[4];
uv[0] =  Vector2(0, 0);
uv[1] =  Vector2(0, 1);
uv[2] =  Vector2(1, 0);
uv[3] =  Vector2(1, 1);

var triangles : int[]  = new int[6];
triangles[0] =  0;
triangles[1] =  1; 
triangles[2] =  2;

mesh.vertices = vertices;
mesh.uv = uv;
mesh.triangles = triangles;

ThisMesh.gameObject.AddComponent(MeshRenderer);
ThisMesh.renderer.receiveShadows = false;
ThisMesh.renderer.castShadows = false;
ThisMesh.renderer.enabled = false;
ThisMesh.parent = ThisParent;
ThisMesh.gameObject.layer = ThisLayer;
ThisMesh.renderer.material = RadarAtlasMaterial;
return ThisMesh;
}

function MakeQuad(Name : String, ThisScale : int, CustomScale : boolean, ThisRotation : Vector3, ThisParent : Transform, ThisLayer : int){
var ThisMesh : Transform = new GameObject(Name).transform;
var scale : float;
var mesh : Mesh = ThisMesh.gameObject.AddComponent(MeshFilter).mesh;

	if(CustomScale){
		scale = (1 / ((Screen.height * Cameras[1].rect.height) / ThisScale)) * .5;
	}else{
		scale = (ThisScale * .5);
	}

var vertices : Vector3[]  = new Vector3[4];
vertices[0] = Vector3( -scale, -scale, 0);
vertices[1] =  Vector3( -scale, scale, 0);
vertices[2] =  Vector3(scale, -scale, 0);
vertices[3] =  Vector3(scale, scale, 0);

var uv : Vector2[] = new Vector2[4];
uv[0] =  Vector2(0, 0);
uv[1] =  Vector2(0, 1);
uv[2] =  Vector2(1, 0);
uv[3] =  Vector2(1, 1);

var triangles : int[]  = new int[6];
triangles[0] =  0;
triangles[1] =  1; 
triangles[2] =  2;
triangles[3] =  2; 
triangles[4] =  1; 
triangles[5] =  3;

mesh.vertices = vertices;
mesh.uv = uv;
mesh.triangles = triangles;

ThisMesh.gameObject.AddComponent(MeshRenderer);
ThisMesh.renderer.receiveShadows = false;
ThisMesh.renderer.castShadows = false;
ThisMesh.renderer.enabled = false;
ThisMesh.eulerAngles = ThisRotation;
ThisMesh.parent = ThisParent;
ThisMesh.gameObject.layer = ThisLayer;
ThisMesh.renderer.sharedMaterial = RadarAtlasMaterial;

return ThisMesh;
}

function MakeVFB(Name : String, ThisParent : Transform, ThisLayer : int){
var ThisMesh : Transform = new GameObject(Name).transform;
var mesh : Mesh = ThisMesh.gameObject.AddComponent(MeshFilter).mesh;
var vertices : Vector3[]  = new Vector3[24];

//Face Down - TOP
vertices[0] = Vector3( -.5, .5, .5); //bottom left
vertices[1] =  Vector3( -.5, .5, -.5); // Top Left
vertices[2] =  Vector3(.5, .5, .5); // bottom right
vertices[3] =  Vector3(.5, .5, -.5); // Top right

//Face Up - Down
vertices[4] = Vector3( -.5, -.5, -.5); //bottom left
vertices[5] =  Vector3( -.5, -.5, .5); // Top Left
vertices[6] =  Vector3(.5, -.5, -.5); // bottom right
vertices[7] =  Vector3(.5, -.5, .5); // Top right

//Face Right - Left
vertices[8] = Vector3( -.5, -.5, .5); //bottom left
vertices[9] =  Vector3( -.5, -.5, -.5); // Top Left
vertices[10] =  Vector3(-.5, .5, .5); // bottom right
vertices[11] =  Vector3(-.5, .5, -.5); // Top right

//Face Left - Right
vertices[12] = Vector3( .5, -.5, -.5); //bottom left
vertices[13] =  Vector3( .5, -.5, .5); // Top Left
vertices[14] =  Vector3(.5, .5, -.5); // bottom right
vertices[15] =  Vector3(.5, .5, .5); // Top right

//Face Back
vertices[16] = Vector3( -.5, .5, -.5); //bottom left
vertices[17] =  Vector3( -.5, -.5, -.5); // Top Left
vertices[18] =  Vector3(.5, .5, -.5); // bottom right
vertices[19] =  Vector3(.5, -.5, -.5); // Top right

//Face Front
vertices[20] = Vector3( -.5, -.5, .5); //bottom left
vertices[21] =  Vector3( -.5, .5, .5); // Top Left
vertices[22] =  Vector3(.5, -.5, .5); // bottom right
vertices[23] =  Vector3(.5, .5, .5); // Top right

var uv : Vector2[] = new Vector2[16];
uv[0] =  Vector2(0, 0);
uv[1] =  Vector2(0, 1);
uv[2] =  Vector2(1, 0);
uv[3] =  Vector2(1, 1);

uv[4] =  Vector2(0, 0);
uv[5] =  Vector2(0, 1);
uv[6] =  Vector2(1, 0);
uv[7] =  Vector2(1, 1);

uv[8] =  Vector2(0, 0);
uv[9] =  Vector2(0, 1);
uv[10] =  Vector2(1, 0);
uv[11] =  Vector2(1, 1);

uv[12] =  Vector2(0, 0);
uv[13] =  Vector2(0, 1);
uv[14] =  Vector2(1, 0);
uv[15] =  Vector2(1, 1);

var triangles : int[]  = new int[24];
//Top
triangles[0] = 0;
triangles[1] = 1; 
triangles[2] = 2;
triangles[3] = 2; 
triangles[4] = 1; 
triangles[5] = 3;

//Bottom
triangles[6] = 4;
triangles[7] = 5; 
triangles[8] = 6;
triangles[9] = 6; 
triangles[10] = 5; 
triangles[11] = 7;

//Left
triangles[12] = 8;
triangles[13] = 9; 
triangles[14] = 10;
triangles[15] = 10; 
triangles[16] = 9; 
triangles[17] = 11;

//Right
triangles[18] = 12;
triangles[19] = 13; 
triangles[20] = 14;
triangles[21] = 14; 
triangles[22] = 13; 
triangles[23] = 15;

mesh.vertices = vertices;
mesh.triangles = triangles;

ThisMesh.parent = ThisParent;
ThisMesh.localPosition = Vector3.zero;
ThisMesh.localScale.x *= ((Screen.width  * 1.0) / Screen.height);
ThisMesh.gameObject.AddComponent(MeshCollider);
ThisMesh.gameObject.layer = ThisLayer;
VFBounds = ThisMesh.localScale;
}

/***********************************************************************************/
														//HUD Elements & Scale
/***********************************************************************************/
function CreateHUD(){
	
var HUDGUI : Transform = new GameObject("GUI_HUD_Icons").transform;
HUDGUI.parent = transform;
/***********************************************************************************/
											//Create, Cache & Configure HUD Camera
/***********************************************************************************/	
//Rift Camera Right	HUD
Cameras[2] = new GameObject("HUD / GUI Camera").AddComponent(Camera);
Cameras[2].gameObject.AddComponent(GUILayer);
Cameras[2].transform.parent = HUDGUI;
Cameras[2].transform.localPosition = Vector3.zero;
Cameras[2].transform.localEulerAngles = Vector3.zero;
Cameras[2].clearFlags = CameraClearFlags.Depth;
Cameras[2].depth = Cameras[1].depth + 1;
Cameras[2].fieldOfView = Cameras[3].fieldOfView;
Cameras[2].renderingPath = RenderingPath.Forward;
Cameras[2].cullingMask = 1 << Layers[2];
Cameras[2].isOrthoGraphic = true;
Cameras[2].orthographicSize = Screen.height * .5;
if(EnableRift){
//Rift Camera Left HUD
RiftCameras[0] = new GameObject("HUD / GUI Camera 2").AddComponent(Camera);
RiftCameras[0].gameObject.AddComponent(GUILayer);
RiftCameras[0].transform.parent = HUDGUI;
RiftCameras[0].transform.localPosition = Vector3.zero;
RiftCameras[0].transform.localEulerAngles = Vector3.zero;
RiftCameras[0].clearFlags = CameraClearFlags.Depth;
RiftCameras[0].depth = Cameras[2].depth;
RiftCameras[0].fieldOfView = Cameras[3].fieldOfView;
RiftCameras[0].renderingPath = RenderingPath.Forward;
RiftCameras[0].cullingMask = 1 << RiftLayer;
RiftCameras[0].isOrthoGraphic = true;
RiftCameras[0].orthographicSize = Screen.height * .5;

RiftCameras[0].rect.width = .5;
Cameras[2].rect.width = .5;

RiftCameras[0].rect.x = 0;
Cameras[2].rect.x = .5;
}
/***********************************************************************************/
											//HUD Target Direction Indicator Arrow
/***********************************************************************************/
DIA_Helper = new GameObject("DIA_Helper").transform;
DIA_Helper.position = Vector3(1,0,1);
DIA_Helper.eulerAngles = Vector3(0,-90,0);
DIA_Helper.parent = HUDGUI;
DIA_HUD = MakeTri("DIA_HUD", 12, DIA_Helper, Layers[2]);
DIA_HUD.localPosition = Vector3(0, 0, DIARadius);
SetTextureOffset(14, 15, DIA_HUD.gameObject, 32);

var cp : Vector3 = Cameras[3].transform.position;
var cr : Vector3 = Cameras[3].transform.eulerAngles;
Cameras[3].transform.position = Vector3.zero;
Cameras[3].transform.eulerAngles = Vector3.zero;

var relpos : Vector3 = (Cameras[2].WorldToScreenPoint(DIA_HUD.position));
DIAdisableAngle = Vector3.Angle(Cameras[3].ScreenToWorldPoint(relpos), Vector3(0,0,1));	

Cameras[3].transform.position = cp;
Cameras[3].transform.eulerAngles = cr;
/***********************************************************************************/
											//HUD Target Selection Box
/***********************************************************************************/
TSB_HUD[0] = MakeQuad("TSB_HUD", 64, false, Vector3.zero, HUDGUI, Layers[2]);
SetTextureOffset(0, 0, TSB_HUD[0].gameObject, 64);

	if(EnableRift){
		TSB_HUD[1] = MakeQuad("TSB_HUD", 64, false, Vector3.zero, HUDGUI, RiftLayer);
		SetTextureOffset(0, 0, TSB_HUD[1].gameObject, 64);
	}
/***********************************************************************************/
											//HUD Target Selection Box Target ID
/***********************************************************************************/
TSB_ID_HUD[0] = MakeQuad("TSB_ID_HUD", 32, false, Vector3.zero, HUDGUI, Layers[2]);

	if(EnableRift){
		TSB_ID_HUD[1] = MakeQuad("TSB_ID_HUD", 32, false, Vector3.zero, HUDGUI, RiftLayer);
	}
/***********************************************************************************/
											//HUD Target SubComponent Selection Box
/***********************************************************************************/
SCTSB_HUD[0] = MakeQuad("SCTSB_HUD", 64, false, Vector3.zero, HUDGUI, Layers[2]);
SetTextureOffset(0, 1, SCTSB_HUD[0].gameObject, 64);

	if(EnableRift){
		SCTSB_HUD[1] = MakeQuad("SCTSB_HUD", 64, false, Vector3.zero, HUDGUI, RiftLayer);
		SetTextureOffset(0, 1, SCTSB_HUD[1].gameObject, 64);	
	}
/***********************************************************************************/
											//HUD NAV Indicator
/***********************************************************************************/
NAV_HUD[0] = MakeQuad("NAV_HUD", 64, false, Vector3.zero, HUDGUI, Layers[2]);
SetTextureOffset(2, 1, NAV_HUD[0].gameObject, 64);
SetNewColor(NAV_HUD[0].gameObject, ColorNAV);

	if(EnableRift){
		NAV_HUD[1] = MakeQuad("NAV_HUD", 64, false, Vector3.zero, HUDGUI, RiftLayer);
		SetTextureOffset(2, 1, NAV_HUD[1].gameObject, 64);
		SetNewColor(NAV_HUD[1].gameObject, ColorNAV);
	}
/***********************************************************************************/
											//HUD Target Lead Indicator
/***********************************************************************************/
TLI_HUD[0] = MakeQuad("TLI_HUD", 64, false, Vector3.zero, HUDGUI, Layers[2]);
SetTextureOffset(1, 1, TLI_HUD[0].gameObject, 64);

	if(EnableRift){
		TLI_HUD[1] = MakeQuad("TLI_HUD", 64, false, Vector3.zero, HUDGUI, RiftLayer);
		SetTextureOffset(1, 1, TLI_HUD[1].gameObject, 64);	
	}
/***********************************************************************************/
											//Radar Target Selection Box
/***********************************************************************************/
TSB_Radar = MakeQuad("TSB_Radar", RIDSize, true, Vector3(Cameras[1].transform.eulerAngles.x,0,0), HUDGUI, Layers[1]);
SetTextureOffset(0, 8, TSB_Radar.gameObject, 32);
/***********************************************************************************/
														//Create & Configure VFB
/***********************************************************************************/		
MakeVFB("VFB", HUDGUI,  Layers[2]);
}

function ResetScale(){
ScreenSize = Vector2(Screen.width, Screen.height);
Destroy(GameObject.Find("GUI_HUD_Icons"));
CreateHUD();

	if(SelectedTargetT != null){
		SelectedTargetRP = SelectedTargetT.GetComponent(FX_3DRadar_RID);
		SetTextureOffset(SelectedTargetRP.ThisClass[0], SelectedTargetRP.ThisClass[1] + 9, TSB_ID_HUD[0].gameObject, 32);
		if(EnableRift){
			SetTextureOffset(SelectedTargetRP.ThisClass[0], SelectedTargetRP.ThisClass[1] + 9, TSB_ID_HUD[1].gameObject, 32);
		}
		GetNewColor();
	}

	var Objects : GameObject[] = FindObjectsOfType(GameObject);
	for(var o : GameObject  in Objects){
		if (o.GetComponent(FX_3DRadar_RID)){
			o.GetComponent(FX_3DRadar_RID).ResetScale();
		}
	}
	if(NavList.Length > 0){
		NAV_HUD[0].renderer.enabled = true;
		if(EnableRift){
			NAV_HUD[1].renderer.enabled = true;
		}
	}
}

function IndicatorLocalizer(ThisObject : Transform, ThisIndicator : Transform){
var RelPos : Vector3 = PlayerCameraT[0].InverseTransformPoint(ThisObject.position);
var angle = Vector3.Angle(RelPos, Vector3(0,0,1));	

	if(RelPos.x == 0 && RelPos.y == 0){
		RelPos.y = 1;
	}
	
ThisIndicator.rotation = Quaternion.LookRotation(Vector3(RelPos.x, RelPos.y, 0));

	if(ThisIndicator.localEulerAngles.y > 260){
		DIA_HUD.localEulerAngles = Vector3(0,90,90);
	}else{
		DIA_HUD.localEulerAngles = Vector3(0, 270, 270);
	}
	
	if(ThisIndicator.localEulerAngles == Vector3(270, 0,0)){
		DIA_HUD.localEulerAngles = Vector3(90, 0, 0);
	}else if(ThisIndicator.localEulerAngles == Vector3(90, 0,0)){
		DIA_HUD.localEulerAngles = Vector3(270, 180, 0);
	}
	
	if(angle >= 0 && angle <= DIAdisableAngle){
		DIA_HUD.renderer.enabled = false;
	}else{
		DIA_HUD.renderer.enabled = true;
	}
}
//End