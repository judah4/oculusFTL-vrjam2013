using UnityEngine;
using System.Collections;

public class ShipProjectile : MonoBehaviour {
	
	public Compartment target;
	public ShipWeapon weapon;

	// Use this for initialization
	void Start () {
	
	}
	
	// Update is called once per frame
	void Update () {
		transform.LookAt(target.transform.position);
		
		transform.position += transform.forward * 100 * Time.deltaTime;
		
		Ray ray = new Ray(transform.position, transform.forward);
		
		if(Vector3.Distance(target.transform.position, transform.position) < 1) {
				target.OnHit(weapon.damage);
				Destroy(gameObject);
			
		}
	}
}
