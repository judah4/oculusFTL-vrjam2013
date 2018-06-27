#pragma strict
import System.Collections.Generic;
import System.Linq;

var Initalize : boolean; //Custom Inspector 

var Factions : String[] = new String[2]; // Array that stores the names of the factions
var FactionID : int [] = new int[2]; // Array that stores the FactionID numbers for all factions
var FactionRelations : Dictionary.<int,float> = new Dictionary.<int,float>(); //Dictionary that holds the faction relation values
var StartRelations : float[] = new float[2]; // Array that stores the start relatoinship values and applies them to the dictionary and is applied at awake. If you have a proper method of saving and loading information then you will only want to run this once. After that you will want to save and load the dictionary and other values manually.
var PlayerRelations : float[] = new float[2]; // Array that stores the Players start relatoinship values with the factions.
var HFS : int[] = new int[2]; // Array that stores the values for Hostile and Friendly cutoff values

var PlayerFaction : int; // The Players faction number
var PlayerFactionID : int; // The Players FactionID number
var RanOnce : boolean;

function Awake(){
	if(!RanOnce){	
		if(PlayerFaction > Factions.Length - 1){
			PlayerFaction = 0;
		}
	
		CreateFactionList();
		//RanOnce = true; //Set this value to true to prevent the dictionary from being rebuilt and resetting it's values if you are using a proper method of saving and loading information.
	}
}

function CreateFactionList(){
//Assign the FactionID numbers for each faction
FactionID = new int[Factions.Length];

	for (var i : int = 0; i < FactionID.Length; i++){
		if(i == 0){
			FactionID[i] = 1;
		}else{
			FactionID[i] = Mathf.Pow(2, i);
		}
	}

//Set the Player FactionID based on the current faction selection
PlayerFactionID = FactionID[PlayerFaction];

//Assign the Key values to the dictionary and the corrosponding starting relationship values.
var cnt : int[] = new int[3];

	while(cnt[0] < (StartRelations.Length)){
		for(var x : int = 0; x < ((FactionID.Length - 1) - cnt[2]); x++){
			var a : int = cnt[2];
			var b : int = ((cnt[2] + cnt[1]) + 1);
			var c : int = (FactionID[a] + FactionID[b]);
			FactionRelations.Add(c, StartRelations[cnt[0]]);
			
			if(cnt[0] < (StartRelations.Length)){
				cnt[0]++;
			}
			cnt[1]++;
		}
		cnt[1] = 0;
		cnt[2]++;
	}

// Example for displaying all relations for one faction. In this case the players faction. Assign any FactionID number to return there relationship values.
GetRelations(PlayerFaction);
}

function GetRelations(SomeFaction : int){
Debug.Log("Example for displaying all relations for one faction. In this case the players faction. ");
Debug.Log("Disable this example in the FX_Faction_Mgr.GetRelations ");

	for(var i : int = 0; i < FactionID.Length; i++){
		if(i != SomeFaction){
			var ThisRelations : float = FactionRelations[(FactionID[SomeFaction] + FactionID[i])];
			var SomeFactionName : String = Factions[SomeFaction].ToString();
			var CompName : String = Factions[i].ToString();
			
			Debug.Log(SomeFactionName + " ----> " + CompName + "  :  " + ThisRelations);
		}
	}
}

