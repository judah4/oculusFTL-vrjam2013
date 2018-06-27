using UnityEngine;
using System.Collections;

public class ShipCameraManager : MonoBehaviour {
	
	public static ShipCameraManager instance;
	
	public Camera mapCam;
	
	public RenderTexture shipRenderTexture;

	
	void Awake() {
		instance = this;

	}

	// Use this for initialization
	void Start () {
	
	}
	
	// Update is called once per frame
	void Update () {
	
	}
}
