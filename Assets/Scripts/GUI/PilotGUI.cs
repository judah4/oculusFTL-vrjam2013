using UnityEngine;
using System.Collections;

public class PilotGUI : MonoBehaviour {
	
	
	public Ship ship;
	public ShipInput input;
	public ShipControl controller;
	public Cockpit cockpit;
	
	public bool minimized = false;
	
	ShipWeapon weaponSelected;
	Texture aimTexture;

	// Use this for initialization
	void Start () {
		aimTexture = Resources.Load("CircleCrossHair 1") as Texture;
		
	}
	
	// Update is called once per frame
	void Update () {
		if(Input.GetKeyDown(KeyCode.Return)) {
			cockpit.LeaveSeat();
			controller.StopMovement();

		}
		if(minimized)
			return;
		
    //The height of the plane on the screen
	     
	    //Get the point on the plane
	    Vector3 screenPoint = Input.mousePosition - new Vector3(planeLeft, planeBottom, 0);
		
	     
	    //If not inside of an OnMouse function
	    //Check for clicks off the plane
	    if(screenPoint.x < 0 || screenPoint.y < 0
	    || screenPoint.x > planeWidth || screenPoint.y > planeHeight) return;
	     
	    //If the plane is not the same screen size as the mapCam's resolution
	    //Convert the coordinate to the mapCam's resolutiion
	    screenPoint.x *= ShipCameraManager.instance.mapCam.pixelWidth / planeWidth;
	    screenPoint.y *= ShipCameraManager.instance.mapCam.pixelHeight / planeHeight;
	    //You could simply do the division in stead and later use ViewportPointToRay
	     //Debug.Log(screenPoint.ToString());
	    //Raycast from the map camera
	    RaycastHit hitInfo; //Stores the information about the hit
	    int layerMask = 0; //The layers to raycast against
	    if(Physics.Raycast(ShipCameraManager.instance.mapCam.ScreenPointToRay(screenPoint), out hitInfo, ShipCameraManager.instance.mapCam.farClipPlane))
	    {
			//Debug.Log("Raycast hit!");
			ShipRoom shipRoom = hitInfo.collider.GetComponent<ShipRoom>();
		    if(shipRoom) //you could also check the rigidBody
		    {
				Debug.Log("Hit room");
				if(Input.GetMouseButtonDown(0)) {
					weaponSelected.currentTarget = shipRoom.compartment;
				}
		    //do something
		    }
	    }
	}
	
	 float planeLeft; //The screen position of the left side of the plane
    float planeBottom; //The screen position of the bottom side of the plane
    float planeWidth; //The width of the plane on the screen
    float planeHeight;
	
	void OnGUI() {
		CameraManager.Instance.OnGUIBegin();
		
		if(minimized) {
			Rect groupRect = new Rect(Screen.width * .5f - 300, Screen.height * .5f + 115, 600, 35);
			GUI.Box(groupRect, "");
			
			GUI.BeginGroup(groupRect);
			if(GUI.Button(new Rect(groupRect.width - 105, 5, 100, 25), "Leave")) {
				cockpit.LeaveSeat();
				controller.StopMovement();
			}
			
			if(GUI.Button(new Rect(groupRect.width - 210, 5, 100, 25), "Minimize")) {
				minimized = !minimized;
			}
			GUI.EndGroup();

		}
		else {
			Rect groupRect = new Rect(Screen.width * .5f - 300, Screen.height * .5f - 150, 600, 300);
			
			GUI.Box(groupRect, "");
			GUI.BeginGroup(groupRect);
			
			
			if(GUI.Button(new Rect(5, 5, 150, 25), "Stop Rotation")) {
				controller.LevelRotation();
			}
			
			if(GUI.Button(new Rect(155, 5, 150, 25), "Gravity: " + ((ship.NoGravity == false) ? "On" : "Off"))) {
				ship.NoGravity = !ship.NoGravity;
			}
			
			if(GUI.Button(new Rect(groupRect.width - 105, 5, 100, 25), "Leave")) {
				cockpit.LeaveSeat();
				controller.StopMovement();
			}
			
			if(GUI.Button(new Rect(groupRect.width - 210, 5, 100, 25), "Minimize")) {
				minimized = !minimized;
			}
			
			GUI.DrawTexture(new Rect(0, 30, groupRect.width, groupRect.height - 30), ShipCameraManager.instance.shipRenderTexture);
			planeLeft = groupRect.x;
			planeWidth = groupRect.width;
			planeHeight = groupRect.height - 30;
			planeBottom = groupRect.y;
			
			for(int cnt = 0; cnt < ship.weaponSystem.weapons.Count; cnt++) {
				ShipWeapon weapon = ship.weaponSystem.weapons[cnt];
					
				if(ship.weaponSystem.activatedWeapons.Contains(weapon)) {
					if(weapon.Charged) {
						GUI.color = Color.green;
					}
						if(GUI.Button(new Rect(0, 30 + 30 * cnt, 100, 25), weapon.weaponName)) {
							if(Event.current.button == 0) {
								weaponSelected = weapon;
								
							}
						}
							
					GUI.color = Color.white;
				}
				else {
					if(GUI.Button(new Rect(0, 30 + 30 * cnt, 100, 25), weapon.weaponName, "Box")) {
						
					}
				}
			
			}
			
			GUI.EndGroup();
		}
		
		if(weaponSelected) {
			GUI.Label(new Rect(Input.mousePosition.x - 32, Screen.height - Input.mousePosition.y - 32, 64, 64), aimTexture);
		}
		
		CameraManager.Instance.OnGUIEnd();
	}
	
	public void TargetShipPart() {
		
	}
}
