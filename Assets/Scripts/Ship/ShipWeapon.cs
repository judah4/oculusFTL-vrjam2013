using UnityEngine;
using System.Collections;

public class ShipWeapon : MonoBehaviour {
	public string weaponName = "Little Laser";
	public WeaponType weaponType = WeaponType.Burst;
	
	public int damage = 2;
	
	public int requiredPower = 2;
	
	public bool Charged {
		get;
		private set;
	}
	[SerializeField]
	float charging = -1;
	public float chargeTime = 5;
	
	public int shots = 2;
	
	public Compartment currentTarget;
	
	void Awake() {
		Charged = false;
		charging = chargeTime;
	}
	
	// Use this for initialization
	void Start () {
	
	}
	
	// Update is called once per frame
	void Update () {
	
	}
	
	public void Charge() {
		if(!Charged) {
			charging -= Time.deltaTime;
			
			if(charging < 0)
				Charged = true;
		}
	}
	
	public void Discharge() {
		charging = chargeTime;
		Charged = false;
	}
	
	public void Fire() {
		
		StartCoroutine(Firing());
		
		Discharge();
	}
	
	public IEnumerator Firing() {
		
		int shotsLeft = shots - 1;
		
		ShipProjectile proj = (Instantiate(Resources.Load("Missile"), transform.position, transform.rotation) as GameObject).GetComponent<ShipProjectile>();
		proj.weapon = this;
		proj.target = currentTarget;
		
		for(int cnt = 0; cnt < shotsLeft; cnt++) {
			yield return new WaitForSeconds(0.14f);
			proj = (Instantiate(Resources.Load("Missile"), transform.position, transform.rotation) as GameObject).GetComponent<ShipProjectile>();
			proj.weapon = this;
			proj.target = currentTarget;
		}
		
	}
}

public enum WeaponType {
	Beam,
	Burst,
	Missile,
}
