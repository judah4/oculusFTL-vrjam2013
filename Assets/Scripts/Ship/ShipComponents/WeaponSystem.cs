using UnityEngine;
using System.Collections;
using System.Collections.Generic;

public class WeaponSystem : ShipComponent {
	
	public List<ShipWeapon> weapons = new List<ShipWeapon>();
	public List<Transform> weaponMounts = new List<Transform>();
	
	public List<ShipWeapon> activatedWeapons = new List<ShipWeapon>();
	
	[SerializeField]
	int maxSlots = 3;
	
	public int MaxSlots {
		get { return maxSlots; }
	}
	
	void Awake() {
		base.OnAwake();
	}
	
	// Use this for initialization
	void Start () {
		base.OnStart();
	}
	
	// Update is called once per frame
	void Update () {
		if(!broken) {
			for(int cnt = 0; cnt < activatedWeapons.Count; cnt++) {
				activatedWeapons[cnt].Charge();
				
				if(activatedWeapons[cnt].Charged && activatedWeapons[cnt].currentTarget) {
					
					activatedWeapons[cnt].Fire();
				}
			}
		}
	}
	
	public override void AfterDamagePowerCheck ()
	{
		while(CurrentMax - CurrentPower - (int)Damage  < 0) {
				compartment.ship.RemovePower(this);
				if(activatedWeapons.Count > 0) {
				 	int loopsNeeded = activatedWeapons[activatedWeapons.Count - 1].requiredPower - 1;
					for(int cnt = 0; cnt < loopsNeeded; cnt++) {
						compartment.ship.RemovePower(this);
					}
				}
		}
	}
	
	
}
