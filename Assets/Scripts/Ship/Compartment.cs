using UnityEngine;
using System.Collections;
using System.Collections.Generic;

public class Compartment : MonoBehaviour {

	public Ship ship;
	
	public List<ShipRoom> rooms = new List<ShipRoom>();
	
	public ShipComponent component;

	// Use this for initialization
	void Start () {
		for(int cnt = 0; cnt < rooms.Count; cnt++) {
			rooms[cnt].compartment = this;
		}
		
		if(component != null) {
			component.compartment = this;
		}
	}
	
	// Update is called once per frame
	void Update () {
	
	}
	
	
	
	public void Hit(float damage) {
		Debug.Log("Damaged " + name + " for " + damage);
		
		if(damage > .99f) {
			
			ship.OnHit((int)damage);
				
			
		}
		
		
	}
	
	public void OnHit(float damage) {
		Debug.Log("Damaged " + name + " for " + damage);
		
		if(component != null) {
			component.Hit(damage);
			
		
		}
		
		if(damage >= .99f) {
			
			ship.OnHit((int)damage);
				
			
		}
	}
}
