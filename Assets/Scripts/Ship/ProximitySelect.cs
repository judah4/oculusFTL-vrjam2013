using UnityEngine;
using System.Collections;

public class ProximitySelect : MonoBehaviour {
	public float neededDistance = 3;
	Transform target;
	public bool canUse = false;

	// Use this for initialization
	void Start () {
	
	}
	
	// Update is called once per frame
	void Update () {
		canUse = false;
		if(target == null) {
			if(PlayerInput.instance.tag == tag)
				target = CameraManager.Instance.MainCamera().transform;
		}
		else {
			if(Vector3.Distance(target.position, transform.position) < neededDistance) {
				canUse = true;
			}
		}
	}
}
