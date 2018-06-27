using UnityEngine;
using System.Collections;

public class Cockpit : ShipComponent {
	
	bool inUse = false;
	
	public Transform seat;
	public ShipInput shipInput;
	public PilotGUI pilotGUI;
	
	Vector3 oldPos = Vector3.zero;
	
	// Update is called once per frame
	void Update () {
		if(prox.canUse && inUse == false && Input.GetKeyDown(KeyCode.Return)) {
			inUse = true;
			pilotGUI.enabled = true;
			shipInput.enabled = true;
			PlayerInput.instance.enabled = false;
			pilotGUI.cockpit = this;
			oldPos = PlayerInput.instance.transform.localPosition;
		}
		
		if(inUse) {
			CameraManager.Instance.HideCrosshair = true;
			PlayerInput.instance.transform.position = seat.position;
			PlayerInput.instance.transform.rotation = seat.rotation;
		}
	}
	
	public void LeaveSeat() {
		CameraManager.Instance.HideCrosshair = false;
		inUse = false;
		shipInput.enabled = false;
			pilotGUI.enabled = false;
			PlayerInput.instance.enabled = true;
		PlayerInput.instance.transform.localPosition = oldPos;

	}
	
	void OnGUI() {
		if(prox.canUse && !inUse) {
			CameraManager.Instance.OnGUIBegin();
		
		
			GUI.Box(new Rect(Screen.width * .5f - 50, Screen.height - 200, 100, 25), "Press [Enter]");
		
		
			CameraManager.Instance.OnGUIEnd();
		}
	}
}
