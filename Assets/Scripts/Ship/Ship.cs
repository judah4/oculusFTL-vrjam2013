using UnityEngine;
using System.Collections;
using System.Collections.Generic;

public class Ship : MonoBehaviour {
	
	public List<Ship> enemies = new List<Ship>();
	
	
	public List<ShipRoom> rooms = new List<ShipRoom>();
	
	public List<Compartment> compartments = new List<Compartment>();
	
	public WeaponSystem weaponSystem;
	

	
	public List<MoveController> characters = new List<MoveController>();
	
	bool explode = false;
	
	
	[SerializeField]
	bool noGravity = false;
	
	public bool NoGravity {
		set { noGravity = value; }
		get { return noGravity; }
	}
	
	[SerializeField]
	int hull = 10;
	[SerializeField]
	int maxHull = 20;
	[SerializeField]
	int reactor = 5; //power Output
	[SerializeField]
	int reactorLeft = 5;
	List<ShipComponent> shipComponents = new List<ShipComponent>();
	

	// Use this for initialization
	void Start () {
		for(int cnt = 0; cnt < compartments.Count; cnt++) {
			compartments[cnt].ship = this;
			if(compartments[cnt].component != null)
				shipComponents.Add(compartments[cnt].component);
		}
		Transform[] children = GetComponentsInChildren<Transform>();
		for(int cnt = 0; cnt < children.Length; cnt++) {
			if(children[cnt].gameObject.tag == "Untagged")
				children[cnt].gameObject.tag = tag;
		}
	}
	
	// Update is called once per frame
	void Update () {
		for(int cnt = 0; cnt < characters.Count; cnt++) {
			characters[cnt].NoGravity = noGravity;
		}
	}
	
	public bool AssignPower(ShipComponent component) {
		if(reactorLeft > 0 && shipComponents.Contains(component)) {
			if(component.AssignPower()) {
				reactorLeft--;
				return true;
			}
			
		}
		
		return false;
		
	}
	
	public bool RemovePower(ShipComponent component) {
		if(shipComponents.Contains(component)) {
			if(component.RemovePower()) {
				reactorLeft++;
				
				if(reactorLeft > reactor)
					reactorLeft = reactor;
				return true;
			}
			
		}
		
		return false;
		
	}
	
	public void OnHit(int damage) {
		hull -= damage;
		
		if(hull > 1) {
			//boom
			explode = true;
			for(int cnt = 0; cnt < characters.Count; cnt++) {
				characters[cnt].Die(DeathType.Explode);
			}
		}
	}
}

public enum DeathType {
	Common,
	Airless,
	Fire,
	Explode
}
