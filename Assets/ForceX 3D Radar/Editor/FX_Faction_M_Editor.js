import System;
@CustomEditor (FX_Faction_Mgr)

class FX_Faction_M_Editor extends Editor {
var INTFactionPr : int;
var INTFaction : int;
var INTSFaction : int = 4;
var cnt : int[] = new int[3];

var toolbar0 : String[] = ["Factions", "Faction Relations"];
var ToolBarInt0 : int;

var NumberOfFactions : int;
var UniqueRelations : int;
var arr1 : Array;
var setup : boolean;
var FoldOut1 : boolean;
var FoldOut2 : boolean;

	function OnInspectorGUI () {
	if(!setup){
		if(target.PlayerFaction > target.Factions.Length - 1){
			target.PlayerFaction = 0;
		}
		
		setup = true;
	}
	GUILayout.Label("ForceX Faction Manager: Version 1.0.1", EditorStyles.boldLabel);
	EditorGUILayout.Space ();

	ToolBarInt0 = GUILayout.Toolbar(ToolBarInt0, toolbar0);
		switch(ToolBarInt0){
			case 0:
				Factions();
			break;
			
			case 1:
				FactionRelations();
			break;
		}
	}
}

function Factions(){
	if(!target.Initalize){
		EditorGUILayout.Space ();
		EditorGUILayout.Space ();
		if(GUILayout.Button("Start Faction Manager")){
			target.Initalize = true;
			setup = true;
		}
		EditorGUILayout.Space ();
		EditorGUILayout.Space ();
	}
	
EditorGUILayout.Space ();
EditorGUILayout.Space ();
if(target.Initalize){
	
	EditorGUILayout.Space ();
	if(GUILayout.Button("Update")){
		FactionRelations();
	}
	EditorGUILayout.Space ();
	EditorGUILayout.Space ();

GUILayout.Label("Number Of Factions", EditorStyles.boldLabel);
EditorGUILayout.BeginVertical ("HelpBox");
EditorGUILayout.Space ();	
INTSFaction = target.Factions.Length;
INTSFaction = EditorGUILayout.IntSlider( "Factions: ", INTSFaction, 2, 32);
EditorGUILayout.Space ();
EditorGUILayout.EndVertical ();
EditorGUILayout.Space ();

GUILayout.Label("Faction Names", EditorStyles.boldLabel);
EditorGUILayout.BeginVertical ("HelpBox");
EditorGUILayout.Space ();	
	if (INTSFaction != target.Factions.Length){//resize the array
		var arr0 : Array = new Array (target.Factions);
		arr0.length = INTSFaction;
		target.Factions = arr0.ToBuiltin(String);
	}

	for (i = 0; i < target.Factions.Length; i++){//display  all the elements of the array
		EditorGUILayout.Space ();
		target.Factions[i] = EditorGUILayout.TextField ("Faction (" + (i).ToString() + ")", target.Factions[i]);
	}
EditorGUILayout.Space ();
EditorGUILayout.EndVertical ();
}
EditorGUILayout.Space ();
}

function FactionRelations(){
	
	if(target.Initalize){
		
		EditorGUILayout.Space ();
		GUILayout.Label("IFF Ranges :", EditorStyles.boldLabel);
		EditorGUILayout.BeginVertical ("HelpBox");
		EditorGUILayout.Space ();	
		target.HFS[0] = EditorGUILayout.IntSlider("Is Hostile <" ,target.HFS[0], -1000, 0);
		target.HFS[1] = EditorGUILayout.IntSlider("Is Friendly >" ,target.HFS[1], 0, 1000);
		GUILayout.Label("Range -1000 to 1000");
		EditorGUILayout.Space ();	
		EditorGUILayout.EndVertical ();
		EditorGUILayout.Space ();	

		GUILayout.Label("Player Faction", EditorStyles.boldLabel);
		EditorGUILayout.BeginVertical ("HelpBox");
		EditorGUILayout.Space ();
		target.PlayerFaction = EditorGUILayout.IntSlider(target.Factions[target.PlayerFaction] ,target.PlayerFaction, 0, target.Factions.Length - 1);
		EditorGUILayout.Space ();	
		EditorGUILayout.EndVertical ();
		EditorGUILayout.Space ();

		PlayerRelationShips();
		FactionRelationships();
	}
EditorGUILayout.Space ();
}

function PlayerRelationShips(){
GUILayout.Label("Player Relations Matrix", EditorStyles.boldLabel);
EditorGUILayout.BeginVertical ("HelpBox");
EditorGUILayout.Space ();
FoldOut1 = EditorGUILayout.Foldout(FoldOut1,"Value Range -1000 : 1000");

if(FoldOut1){
	if (target.PlayerRelations.Length != target.Factions.Length){//resize the array
		var arr0 : Array = new Array (target.PlayerRelations);
		arr0.length = target.Factions.Length;
		target.PlayerRelations = arr0.ToBuiltin(float);
	}

	for (i = 0; i < target.PlayerRelations.Length; i++){//display  all the elements of the array
		EditorGUILayout.Space ();
		target.PlayerRelations[i] = EditorGUILayout.FloatField ("Player  <---->  " + target.Factions[i].ToString(), target.PlayerRelations[i]);
	}
}
EditorGUILayout.Space ();
EditorGUILayout.EndVertical ();
EditorGUILayout.Space ();
}

function FactionRelationships(){
		GUILayout.Label("Faction Relations Matrix", EditorStyles.boldLabel);
		EditorGUILayout.BeginVertical ("HelpBox");
		EditorGUILayout.Space ();

	FoldOut2 = EditorGUILayout.Foldout(FoldOut2,"Value Range -1000 : 1000");
	
	if(FoldOut2){		
		INTSFaction = target.Factions.Length;
		var NumberOfFactions : int = INTSFaction;
		
		var UniqueRelations : int = 0;
		
		for(var f : int = 0; f < NumberOfFactions; f++){
			UniqueRelations += f;
		}
		
		var TempFaction : int[] = new int[UniqueRelations];
				
		if (INTFaction != UniqueRelations){//resize the array
			INTFaction = UniqueRelations;
			arr1 = new Array (target.StartRelations);
			arr1.length = INTFaction;
			target.StartRelations = arr1.ToBuiltin(float);
		}
	
		cnt[0] = 0;
		cnt[1] = 0;
		cnt[2] = 0;
		
		for(var n : int = 0; n < TempFaction.Length; n++){
			for(var x : int = 0; x < ((NumberOfFactions - 1) - cnt[2]); x++){
				EditorGUILayout.Space ();
				GUILayout.Label(target.Factions[cnt[2]].ToString() + "  <---->  " + target.Factions[((cnt[2] + cnt[1]) + 1)]);
				target.StartRelations[cnt[0]] = EditorGUILayout.FloatField( "Faction Relation: ", target.StartRelations[cnt[0]]);
				
				if(cnt[0] < (TempFaction.Length - 1)){
					cnt[0]++;
				}
				
				cnt[1]++;
			}
			
			if(cnt[1] > 0){
				EditorGUILayout.Space ();
				EditorGUILayout.Space ();
				EditorGUILayout.Space ();
				EditorGUILayout.Space ();
			}
			
			cnt[1] = 0;
			cnt[2]++;
		}
	}
	EditorGUILayout.Space ();
	EditorGUILayout.EndVertical ();
}


