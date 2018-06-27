using UnityEngine;
using System.Collections;

public class CharacterAim : MonoBehaviour {
	
	public bool localPlayer = true;
	public Transform aimFrom;
	public Vector3 aimToo = Vector3.zero;
	
	
	[SerializeField]
	bool debug = false;

	// Use this for initialization
	void Start () {
	
	}
	
	// Update is called once per frame
	void Update () {
		if(localPlayer) {
			if(MyCrosshair.instance != null) {
				aimToo = MyCrosshair.instance.AimPosition;
				
				aimFrom.transform.LookAt(aimToo);
			}
		}
		else {
			
		}
		
		if(debug) {
			Debug.DrawRay(aimFrom.position, aimFrom.forward, Color.red);
		}
	}
	
	public bool Shoot(out Attackable target, out Ray ray, out RaycastHit info) {
		ray = new Ray();
		target = null;
		info = new RaycastHit();
		ray = new Ray(aimFrom.position, aimFrom.forward);
		if(Physics.Raycast(ray, out info)) {
			if(info.collider.GetComponent<Attackable>() != null) {
				target = info.collider.GetComponent<Attackable>();
				
				return true;
			}
		}
		
		return false;
	}
}

