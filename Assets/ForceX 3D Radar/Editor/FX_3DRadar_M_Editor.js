@CustomEditor (FX_3DRadar_Mgr)

class FX_3DRadar_M_Editor extends Editor {

var toolbar1 : String[] = ["Radar Display Setup", "Radar / HUD Diaplay Settings"];
var ToolBarInt1 : int;

function OnInspectorGUI () {
GUILayout.Label("ForceX 3D Radar EX: Version 1.0.6", EditorStyles.boldLabel);

EditorGUILayout.Space ();
EditorGUILayout.Space ();
GUILayout.Label("* = Will only be applied during Start() or Awake()", EditorStyles.boldLabel);

EditorGUIUtility.LookLikeInspector();

EditorGUILayout.Space ();
GUILayout.Label("Project Scale", EditorStyles.boldLabel);
EditorGUILayout.BeginVertical ("HelpBox");
EditorGUILayout.Space ();
GUILayout.Label("Project Scale : Default 1 unit = 1m", EditorStyles.boldLabel);
target.GameScale = EditorGUILayout.FloatField ("* Scale:", target.GameScale);
EditorGUILayout.Space ();
EditorGUILayout.EndVertical();

EditorGUILayout.Space ();
GUILayout.Label("Radar Components", EditorStyles.boldLabel);
EditorGUILayout.BeginVertical ("HelpBox");
EditorGUILayout.Space ();
GUILayout.Label("* Radar Components", EditorStyles.boldLabel);
target.RadarAtlasMaterial = EditorGUILayout.ObjectField ("Atlas Material:", target.RadarAtlasMaterial, Material, true);

EditorGUILayout.Space ();
target.EnableRift = EditorGUILayout.Toggle ("Enable Oculus Rift:", target.EnableRift);
EditorGUILayout.Space ();
target.PlayerT = EditorGUILayout.ObjectField ("Player:", target.PlayerT, Transform, true);
	if(target.EnableRift == false){
		target.Cameras[3] = EditorGUILayout.ObjectField ("Player Camera:", target.Cameras[3], Camera, true);
	}else{
		target.Cameras[3] = EditorGUILayout.ObjectField ("Player Camera Right:", target.Cameras[3], Camera, true);
		target.RiftCameras[1] = EditorGUILayout.ObjectField ("Player Camera Left:", target.RiftCameras[1], Camera, true);
	}
target.Cameras[0] = EditorGUILayout.ObjectField ("Radar Camera:", target.Cameras[0], Camera, true);
target.RadarObject = EditorGUILayout.ObjectField ("Radar Object:", target.RadarObject, Transform, true);

EditorGUIUtility.LookLikeControls();
EditorGUILayout.Space ();
GUILayout.Label("* Render Layers", EditorStyles.boldLabel);
target.Layers[0] = EditorGUILayout.LayerField ("Radar Layer 1:", target.Layers[0]);
target.Layers[1] = EditorGUILayout.LayerField ("Radar Layer 2:", target.Layers[1]);
target.Layers[2] = EditorGUILayout.LayerField ("HUD Layer 1:", target.Layers[2]);
	if(target.EnableRift){
		target.RiftLayer = EditorGUILayout.LayerField ("HUD Layer 2:", target.RiftLayer);
	}
EditorGUILayout.Space ();
GUILayout.Label("* Detection Layers", EditorStyles.boldLabel);
target.Layers[3] = EditorGUILayout.LayerField ("Radar Contact Layer:", target.Layers[3]);

EditorGUIUtility.LookLikeInspector();
EditorGUILayout.Space ();
GUILayout.Label("Sound Effects", EditorStyles.boldLabel);
GUILayout.Label("	For best results, disable 3D Sound", EditorStyles.label);
EditorGUILayout.Space ();
target.SelectSound = EditorGUILayout.ObjectField ("Select Target Sound Effect:", target.SelectSound, AudioClip, true);
target.ClearSound = EditorGUILayout.ObjectField ("Clear Target Sound Effect:", target.ClearSound, AudioClip, true);
target.WarningSound = EditorGUILayout.ObjectField ("Warning Sound Effect:", target.WarningSound, AudioClip, true);

EditorGUILayout.Space ();
target.WarningSoundStart = EditorGUILayout.Toggle ("Play Warning At Start:", target.WarningSoundStart);

EditorGUILayout.Space ();
EditorGUILayout.EndVertical();

EditorGUILayout.Space ();
GUILayout.Label("Radar Settings", EditorStyles.boldLabel);
EditorGUILayout.BeginVertical ("HelpBox");
EditorGUILayout.Space ();
GUILayout.Label("Blind Radar Settings", EditorStyles.boldLabel);
target.EnableBlindRadar = EditorGUILayout.Toggle ("Enable Blind Radar:", target.EnableBlindRadar);
EditorGUILayout.Space ();	
	if(target.EnableBlindRadar == true){
		target.RadarUpdate = EditorGUILayout.FloatField ("Radar Refresh (sec):", target.RadarUpdate);
		target.reTime = EditorGUILayout.FloatField ("Auto Reaquire Time (sec):", target.reTime);
		EditorGUIUtility.LookLikeControls();
		EditorGUILayout.Space ();
		target.ObstructionLayers[0] = EditorGUILayout.LayerField ("* Obstruction Layer - 1:", target.ObstructionLayers[0]);
		target.ObstructionLayers[1] = EditorGUILayout.LayerField ("* Obstruction Layer - 2:", target.ObstructionLayers[1]);
		target.ObstructionLayers[2] = EditorGUILayout.LayerField ("* Obstruction Layer - 3:", target.ObstructionLayers[2]);
		EditorGUIUtility.LookLikeInspector();
	}

EditorGUILayout.Space ();
GUILayout.Label("Directional Indicator Settings", EditorStyles.boldLabel);
target.EnableDirectionArrow = EditorGUILayout.Toggle ("Enable Directional Indicator:", target.EnableDirectionArrow);
EditorGUILayout.Space ();
	if(target.EnableDirectionArrow){
		target.DIARadius = EditorGUILayout.FloatField ("* Radius:", target.DIARadius);
	}
	
EditorGUILayout.Space ();
GUILayout.Label("NAV Point Settings", EditorStyles.boldLabel);
target.DisplayNAVRadar = EditorGUILayout.Toggle ("Display NAV In Radar:", target.DisplayNAVRadar);
target.NavDistance = EditorGUILayout.FloatField ("Arrival Distance:", target.NavDistance);

EditorGUILayout.Space ();
GUILayout.Label("Target List Settings", EditorStyles.boldLabel);
target.EnableTargetList = EditorGUILayout.Toggle ("Display Target List:", target.EnableTargetList);

EditorGUILayout.Space ();
EditorGUILayout.EndVertical();

EditorGUILayout.Space ();
GUILayout.Label("Radar Filters", EditorStyles.boldLabel);
EditorGUILayout.BeginVertical ("HelpBox");
EditorGUILayout.Space ();
target.FilterHostile = EditorGUILayout.Toggle ("Display Hostile Only:", target.FilterHostile);
EditorGUILayout.Space ();
EditorGUILayout.EndVertical();

EditorGUILayout.Space ();
GUILayout.Label("Radar Current State", EditorStyles.boldLabel);
EditorGUILayout.BeginVertical ("HelpBox");
EditorGUILayout.Space ();
GUILayout.Label("Radar Range (In Unity Units)", EditorStyles.boldLabel);
target.RadarRange = EditorGUILayout.FloatField ("* Radar Range:", target.RadarRange);
EditorGUILayout.Space ();
EditorGUILayout.Space ();
EditorGUIUtility.LookLikeControls();
target.RadarZoom = EditorGUILayout.EnumPopup ("Radar Zoom Level:", target.RadarZoom);

EditorGUIUtility.LookLikeInspector();
EditorGUILayout.Space ();
EditorGUILayout.Space ();
GUILayout.Label("Target Lead Indicator Settings", EditorStyles.boldLabel);
GUILayout.Label("Projectile Velocity", EditorStyles.boldLabel);
target.ProjectileVelocity = EditorGUILayout.FloatField ("	Velocity:", target.ProjectileVelocity);
EditorGUILayout.Space ();
EditorGUILayout.EndVertical();
EditorGUILayout.Space ();

GUILayout.Label("Global Target Bounds Settings", EditorStyles.boldLabel);
EditorGUILayout.BeginVertical ("HelpBox");
EditorGUILayout.Space ();
		
target.BoundsEnabled = EditorGUILayout.Toggle("Enable Bounds:", target.BoundsEnabled);	
EditorGUILayout.Space ();		
	if(target.BoundsEnabled){
		
		EditorGUIUtility.LookLikeControls();
		EditorGUILayout.Space ();
		target.BoundsShow = EditorGUILayout.EnumPopup("Bounds Display:",target.BoundsShow);
		target.BoundsSize = EditorGUILayout.EnumPopup("Bounds Size:",target.BoundsSize);
		
		if(target.BoundsSize == 0){
			target.BoundsCalculation = EditorGUILayout.EnumPopup("Bounds Calculation:",target.BoundsCalculation);
		}else{
			target.BoundsCalculation = 0;
		}

		EditorGUIUtility.LookLikeInspector();
		EditorGUILayout.Space ();
		target.SetLimits = EditorGUILayout.Toggle("Limit Screen Size:", target.SetLimits);	
		if(target.SetLimits){
			GUILayout.Label("	  Settings are based on Viewport space");
			target.MaxSize.x = EditorGUILayout.Slider("	Max Width:",target.MaxSize.x, 0.0,1.0);
			target.MaxSize.y = EditorGUILayout.Slider("	Max Height:",target.MaxSize.y, 0.0,1.0);
		}
		
		EditorGUILayout.Space ();
		target.BoundsPadding = EditorGUILayout.FloatField("Padding:",target.BoundsPadding);
		
		EditorGUILayout.Space ();
		target.BoundsAlpha = EditorGUILayout.Slider("*Opacity:",target.BoundsAlpha, 0.0,1.0);

	}
	
EditorGUILayout.Space ();
EditorGUILayout.EndVertical();
		
EditorGUILayout.Space ();
EditorGUILayout.Space ();
EditorGUIUtility.LookLikeControls();
EditorGUILayout.Space ();
ToolBarInt1 = GUILayout.Toolbar(ToolBarInt1, toolbar1);
	switch(ToolBarInt1){
		case 0:
			EditorGUILayout.Space ();
			EditorGUILayout.BeginVertical ("HelpBox");
			EditorGUILayout.Space ();
			RadarCamera();
			EditorGUILayout.Space ();
			EditorGUILayout.EndVertical();
		break;
		
		case 1:
			EditorGUILayout.Space ();
			EditorGUILayout.BeginVertical ("HelpBox");
			EditorGUILayout.Space ();
			RadarIDSize();
			EditorGUILayout.Space ();
			EditorGUILayout.EndVertical();
		break;
	}
EditorGUILayout.Space ();
EditorGUILayout.Space ();
}

function RadarCamera(){
EditorGUIUtility.LookLikeInspector();
EditorGUILayout.Space ();
target.Perspective = EditorGUILayout.Toggle ("* Render As Perspective:", target.Perspective);

EditorGUILayout.Space ();
EditorGUIUtility.LookLikeControls();
GUILayout.Label("Radar Window Rendering Options", EditorStyles.boldLabel);
target.RadarPos = EditorGUILayout.EnumPopup("Position:", target.RadarPos);
	if(target.RadarPos == 5){
		if(target.Perspective == false){
			EditorGUILayout.Space ();
			GUILayout.Label("Render Texture Settings (Unity PRO)", EditorStyles.boldLabel);
			GUILayout.Label("!! This Feature is Experimental !!", EditorStyles.boldLabel);
			
			EditorGUILayout.Space ();
			target.RenderTarget = EditorGUILayout.ObjectField ("	Render Target:", target.RenderTarget, GameObject, true);
			
			EditorGUILayout.Space ();
			EditorGUILayout.Space ();
			target.RIDSize = EditorGUILayout.IntSlider("Radar ID Size (Pixels):", target.RIDSize, 32, 256);
			target.VDISizeOverride = EditorGUILayout.IntField ("Radar VDI Multiplier :", target.VDISizeOverride);
			
			EditorGUILayout.Space ();
			EditorGUILayout.Space ();			
			target.RenderTargetRez.x = EditorGUILayout.IntField ("Render Texture Width:", target.RenderTargetRez.x);
			target.RenderTargetRez.y = EditorGUILayout.IntField ("Render Texture Height:", target.RenderTargetRez.y);
			target.RenderTargetRez.z = EditorGUILayout.IntField ("Depth Buffer:", target.RenderTargetRez.z);
			
			EditorGUILayout.Space ();
			
			target.RenderFlag = EditorGUILayout.EnumPopup ("Camera Render Style:", target.RenderFlag);
		
			if(target.RenderFlag == 0){
				EditorGUILayout.Space ();
				target.RenderSolidColor = EditorGUILayout.ColorField ("	Color:", target.RenderSolidColor);
			}
			
		}else{
			GUILayout.Label("Render to texture is disabled while", EditorStyles.boldLabel);
			GUILayout.Label("perspective rendering is active.", EditorStyles.boldLabel);
		}
	}
}

function RadarIDSize(){
EditorGUILayout.Space ();
GUILayout.Label("HUD Indicator : Screen Edge Padding (Pixels)", EditorStyles.boldLabel);
target.EdgePadding.x = EditorGUILayout.FloatField ("Padding Amount X:", target.EdgePadding.x);
target.EdgePadding.y = EditorGUILayout.FloatField ("Padding Amount Y:", target.EdgePadding.y);

EditorGUILayout.Space ();
GUILayout.Label("HUD Override", EditorStyles.boldLabel);
target.HUDOffset = EditorGUILayout.Vector2Field ("HUD Offset :", target.HUDOffset);

EditorGUILayout.Space ();
EditorGUILayout.Space ();
EditorGUIUtility.LookLikeInspector();
GUILayout.Label("Radar Color Identifiers", EditorStyles.boldLabel);
target.ColorNeutral = EditorGUILayout.ColorField ("	Neutral:", target.ColorNeutral);
target.ColorFriendly = EditorGUILayout.ColorField ("	Friendly:", target.ColorFriendly);
target.ColorHostile = EditorGUILayout.ColorField ("	Hostile:", target.ColorHostile);
target.ColorAbandoned = EditorGUILayout.ColorField ("	Abandoned:", target.ColorAbandoned);
target.ColorOwned = EditorGUILayout.ColorField ("	Player Owned:", target.ColorOwned);
target.ColorUnknown = EditorGUILayout.ColorField ("	Unknown:", target.ColorUnknown);
target.ColorNAV = EditorGUILayout.ColorField ("	NAV:", target.ColorNAV);

EditorGUILayout.Space ();
EditorGUILayout.Space ();
GUILayout.Label("Radar RID Settings", EditorStyles.boldLabel);
target.VDIOff = EditorGUILayout.Toggle ("*Disable VDI:", target.VDIOff);
	if(!target.VDIOff){
		target.BaseIDOff = EditorGUILayout.Toggle ("*Disable RID Base:", target.BaseIDOff);
	}

EditorGUILayout.Space ();
target.HUDAlpha = EditorGUILayout.Slider("*HUD Opacity:",target.HUDAlpha, 0.0,1.0);
target.RIDAlpha = EditorGUILayout.Slider("*RID Opacity:",target.RIDAlpha, 0.0,1.0);
	if(!target.VDIOff){
		target.VDIAlpha = EditorGUILayout.Slider("*VDI Opacity:",target.VDIAlpha, 0.0,1.0);
	}
EditorGUILayout.Space ();
EditorGUILayout.Space ();
}

}