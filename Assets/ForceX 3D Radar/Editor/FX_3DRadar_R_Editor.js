@CustomEditor (FX_3DRadar_RID)

class FX_3DRadar_R_Editor extends Editor {
var setup : boolean = false;
var Factions : String[];
	
	function OnInspectorGUI () {
		if(!setup){
			Factions = GameObject.Find("_GameMgr").GetComponent(FX_Faction_Mgr).Factions;
			if(target.ThisFaction > Factions.Length - 1){
				target.ThisFaction = 0;
			}
			setup = true;
		}
		GUILayout.Label("ForceX 3D Radar EX: Version 1.0.6", EditorStyles.boldLabel);
		
		EditorGUILayout.Space ();
		EditorGUILayout.Space ();
		GUILayout.Label("* = Will only be applied during Start() or Awake()", EditorStyles.boldLabel);
		EditorGUIUtility.LookLikeInspector();
		EditorGUILayout.Space ();
		GUILayout.Label("Faction Selection", EditorStyles.boldLabel);
		EditorGUILayout.BeginVertical ("HelpBox");
		EditorGUILayout.Space ();		
		target.ThisFaction = EditorGUILayout.IntSlider(Factions[target.ThisFaction],target.ThisFaction, 0, Factions.Length - 1);
		target.ThisFactionID = EditorGUILayout.IntField ("Faction ID", target.ThisFactionID);
		
		EditorGUILayout.Space ();	
		EditorGUILayout.EndVertical ();
		EditorGUILayout.Space ();
				
		EditorGUIUtility.LookLikeControls();
		GUILayout.Label("Class Selection", EditorStyles.boldLabel);
		EditorGUILayout.BeginVertical ("HelpBox");
		EditorGUILayout.Space ();	
		target.Class = EditorGUILayout.EnumPopup("Object Class:",target.Class);
		target.ThisClass[0] = target.Class;
		ShipSellection();
		EditorGUILayout.Space ();	
		EditorGUILayout.EndVertical ();		
		EditorGUILayout.Space ();	

		EditorGUIUtility.LookLikeInspector();

		GUILayout.Label("Condition Settings", EditorStyles.boldLabel);
		EditorGUILayout.BeginVertical ("HelpBox");
		EditorGUILayout.Space ();

		target.IsNAV = EditorGUILayout.Toggle ("*Is NAV", target.IsNAV);
		target.IsPlayer = EditorGUILayout.Toggle ("Is Player", target.IsPlayer);		
				
		EditorGUILayout.Space ();
		target.IsAbandoned = EditorGUILayout.Toggle ("Is Abandoned", target.IsAbandoned);
		target.IsPlayerOwned = EditorGUILayout.Toggle ("Is Player Owned", target.IsPlayerOwned);
		
		EditorGUILayout.Space ();
		target.Detectable = EditorGUILayout.Toggle ("Detectable", target.Detectable);
		target.PermDiscovery = EditorGUILayout.Toggle ("Perm Discovery", target.PermDiscovery);
		target.DetectionReset = EditorGUILayout.Toggle ("UnDetectable Discovery Reset", target.DetectionReset);
		target.BlindRadarOverride = EditorGUILayout.Toggle ("Blind Radar Override", target.BlindRadarOverride);

		EditorGUILayout.Space ();	
		EditorGUILayout.EndVertical ();		
		EditorGUILayout.Space ();	

		GUILayout.Label("Radar Settings", EditorStyles.boldLabel);
		EditorGUILayout.BeginVertical ("HelpBox");
		EditorGUILayout.Space ();
		target.EnableRadar = EditorGUILayout.Toggle ("Enable Radar", target.EnableRadar);
		if(target.EnableRadar){
			EditorGUILayout.Space ();
			target.RadarRange = EditorGUILayout.IntField ("Radar Range", target.RadarRange);
			target.UpdateHL = EditorGUILayout.FloatField ("Refresh Rate (sec)", target.UpdateHL);
			
		}
		EditorGUILayout.Space ();	
		EditorGUILayout.EndVertical ();		
		EditorGUILayout.Space ();

		GUILayout.Label("Local Target Bounds Settings", EditorStyles.boldLabel);
		EditorGUILayout.BeginVertical ("HelpBox");
		EditorGUILayout.Space ();
		target.BoundsOverride = EditorGUILayout.Toggle ("Disable ", target.BoundsOverride);
		
		EditorGUILayout.Space ();	
		EditorGUILayout.EndVertical ();		
		EditorGUILayout.Space ();			
		
		GUILayout.Label("Current IFF State : Runtime Monitor Only", EditorStyles.boldLabel);
		EditorGUILayout.BeginVertical ("HelpBox");
		EditorGUILayout.Space ();		
		target.IFF = EditorGUILayout.EnumPopup("IFF Status:",target.IFF);
		EditorGUILayout.Space ();
		target.IsPlayerTarget = EditorGUILayout.Toggle ("Is Player Target", target.IsPlayerTarget);
		EditorGUILayout.Space ();	
		EditorGUILayout.EndVertical ();		
		EditorGUILayout.Space ();						
		EditorGUILayout.Space ();
		EditorGUILayout.Space ();
	}
	
	function ShipSellection(){
		switch(target.Class){
		
			case 0:
				target.Misc = EditorGUILayout.EnumPopup("Sub Class:",target.Misc);
				target.ThisClass[1] = target.Misc;
			break;
			
			case 1:
				target.CIVT = EditorGUILayout.EnumPopup("Sub Class:",target.CIVT);
				target.ThisClass[1] = target.CIVT;
			break;

			case 2:
				target.COT = EditorGUILayout.EnumPopup("Sub Class:",target.COT);
				target.ThisClass[1] = target.COT;
			break;
			
			case 3:
				target.Drone = EditorGUILayout.EnumPopup("Sub Class:",target.Drone);
				target.ThisClass[1] = target.Drone;
			break;
			
			case 4:
				target.Fighter = EditorGUILayout.EnumPopup("Sub Class:",target.Fighter);
				target.ThisClass[1] = target.Fighter;
			break;
			
			case 5:
				target.Bomber = EditorGUILayout.EnumPopup("Sub Class:",target.Bomber);
				target.ThisClass[1] = target.Bomber;
			break;
			
			case 6:
				target.Escort = EditorGUILayout.EnumPopup("Sub Class:",target.Escort);
				target.ThisClass[1] = target.Escort;
			break;
			
			case 7:
				target.Frigate = EditorGUILayout.EnumPopup("Sub Class:",target.Frigate);
				target.ThisClass[1] = target.Frigate;
			break;
			
			case 8:
				target.Cruiser = EditorGUILayout.EnumPopup("Sub Class:",target.Cruiser);
				target.ThisClass[1] = target.Cruiser;
			break;
			
			case 9:
				target.BattleShip = EditorGUILayout.EnumPopup("Sub Class:",target.BattleShip);
				target.ThisClass[1] = target.BattleShip;
			break;
			
			case 10:
				target.Dreadnought = EditorGUILayout.EnumPopup("Sub Class:",target.Dreadnought);
				target.ThisClass[1] = target.Dreadnought;
			break;
			
			case 11:
				target.Capital = EditorGUILayout.EnumPopup("Sub Class:",target.Capital);
				target.ThisClass[1] = target.Capital;
			break;
			
			case 12:
				target.SpaceObject = EditorGUILayout.EnumPopup("Sub Class:",target.SpaceObject);
				target.ThisClass[1] = target.SpaceObject;
			break;
			
			case 13:
				target.Celestial = EditorGUILayout.EnumPopup("Sub Class:",target.Celestial);
				target.ThisClass[1] = target.Celestial;
			break;
			
			case 14:
				target.XO = EditorGUILayout.EnumPopup("Sub Class:",target.XO);
				target.ThisClass[1] = target.XO;
			break;
			
			case 15:
				target.ShipType = EditorGUILayout.EnumPopup("Sub Class:",target.ShipType);
				target.ThisClass[1] = target.CIVT;
			break;
		}
	}
}
