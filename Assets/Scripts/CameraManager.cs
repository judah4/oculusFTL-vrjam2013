using UnityEngine;
using System.Collections;

public class CameraManager : MonoBehaviour {
	
	[SerializeField]
	new Camera camera = Camera.main;
	
	[SerializeField]
	OVRCameraController ovrCamera;
	
	[SerializeField]
	bool vrMode = false;
	
	public float   IPDIncrement		= 0.0025f;
	
	static CameraManager instance;
	
	Texture cursor;
	
	public float xOffset = 0;
	public float yOffset = 0;
	public float xMultiOffset = 1.5f;
	
	public bool HideCrosshair { get; set; }
	
	// Crosshair system, rendered onto 3D plane
	public Texture  crosshairImage 			= null;
	private MyCrosshair crosshair        	= new MyCrosshair();
	
	public static CameraManager Instance {
		get {
			if(instance == null) {
				GameObject gm = new GameObject("_Camera Manager");
				
				instance = gm.AddComponent<CameraManager>();

			}
			return instance;
		}
	}
	
	public bool VRMode {
		get { return vrMode; }
	}
	
	void Awake() {
		camera = Camera.main;
		GameObject gm = GameObject.Find("OVRCameraController");
		if(gm) {
			ovrCamera = gm.GetComponent<OVRCameraController>();
			
			if (ovrCamera)
				vrMode = true;
		}
		
		cursor = Resources.Load("mouse-cursor-icon") as Texture;
	}
	
	

	// Use this for initialization
	void Start () {
		// Set the GUI target 
		GUIRenderObject = GameObject.Instantiate(Resources.Load("OVRGUIObjectMain")) as GameObject;
		crosshairRenderObject = GameObject.Instantiate(Resources.Load("OVRGUIObjectMain")) as GameObject;
		
		crosshairImage = (Texture)Resources.Load("CircleCrossHair");
		
		if(GUIRenderObject != null)
		{
			if(GUIRenderTexture == null)
			{
				int w = Screen.width;
				int h = Screen.height;


						
				GUIRenderTexture = new RenderTexture(w, h, 24);	
				GuiHelper.SetPixelResolution(w, h);
				GuiHelper.SetDisplayResolution(OVRDevice.HResolution, OVRDevice.VResolution);
			}
		}
		if(crosshairRenderObject != null)
		{
			if(crosshairRenderTexture == null)
			{
				int w = Screen.width;
				int h = Screen.height;


						
				crosshairRenderTexture = new RenderTexture(w, h, 24);	
				//GuiHelper.SetPixelResolution(w, h);
				//GuiHelper.SetDisplayResolution(OVRDevice.HResolution, OVRDevice.VResolution);
			}
		}
		
		// Attach GUI texture to GUI object and GUI object to Camera
		if(GUIRenderTexture != null && GUIRenderObject != null)
		{
			GUIRenderObject.renderer.material.mainTexture = GUIRenderTexture;
			
			if(ovrCamera != null)
			{
			
			Transform t = GUIRenderObject.transform;
				// Attach the GUI object to the camera
			
				GUIRenderObject.transform.parent =  ovrCamera.transform;
				//ovrCamera.AttachGameObjectToCamera(ref GUIRenderObject);
				
				// Reset the transform values (we will be maintaining state of the GUI object
				// in local state)
				
				OVRUtils.SetLocalTransform(ref GUIRenderObject, ref t);
				
				//t.parent = ovrCamera.transform.parent;
				//t.localPosition = new Vector3(t.localPosition.x, t.localPosition.y, t.localPosition.z +1);
				/*
				// Grab transform of GUI object
				Transform t = GUIRenderObject.transform;
				// Attach the GUI object to the camera
				CameraController.AttachGameObjectToCamera(ref GUIRenderObject);
				// Reset the transform values (we will be maintaining state of the GUI object
				// in local state)
				OVRUtils.SetLocalTransform(ref GUIRenderObject, ref t);
				// Deactivate object until we have completed the fade-in
				// Also, we may want to deactive the render object if there is nothing being rendered
				// into the UI
				// we will move the position of everything over to the left, so get
				// IPD / 2 and position camera towards negative X
				Vector3 lp = GUIRenderObject.transform.localPosition;
				float ipd = 0.0f;
				CameraController.GetIPD(ref ipd);
				lp.x -= ipd * 0.5f;
				GUIRenderObject.transform.localPosition = lp;
				
				GUIRenderObject.SetActive(false);
				*/
			}
			
			
		}
		
		// Attach GUI texture to GUI object and GUI object to Camera
		if(crosshairRenderObject != null && crosshairRenderTexture != null)
		{
			crosshairRenderObject.renderer.material.mainTexture = crosshairRenderTexture;
			
			if(ovrCamera != null)
			{
			
			Transform t = crosshairRenderObject.transform;
				// Attach the GUI object to the camera
			
				//crosshairRenderObject.transform.parent =  ovrCamera.transform;
				ovrCamera.AttachGameObjectToCamera(ref crosshairRenderObject);
				
				// Reset the transform values (we will be maintaining state of the GUI object
				// in local state)
				
				OVRUtils.SetLocalTransform(ref crosshairRenderObject, ref t);
				
			}
			
			
		}
		
		// Crosshair functionality
		crosshair.Init();
		crosshair.SetCrosshairTexture(ref crosshairImage);
		crosshair.SetOVRCameraController (ref ovrCamera);
		crosshair.SetOVRPlayerController(ref PlayerInput.instance.controller);
		
	}
	
	// Update is called once per frame
	void Update () {
		if(ovrCamera != null) {
			
			UpdateIPD();	
		}
		
		crosshair.SetOVRPlayerController(ref PlayerInput.instance.controller);
		
		crosshair.UpdateCrosshair();
		
		if(calledThisFrame == false) {
			if(delayClear) {
				previousActive = RenderTexture.active;
				RenderTexture.active = GUIRenderTexture;
				GL.Clear (false, true, new Color (0.0f, 0.0f, 0.0f, 0.0f));
				RenderTexture.active = previousActive;
				delayClear = false;
			}
			//GUIRenderObject.SetActive(false);
		}
		else {
			delayClear = true;
			//GUIRenderObject.SetActive(true);
			
		}
		
		
		calledThisFrame = false;
		cleared = false;
		
		
		Screen.showCursor = !vrMode;
		
		crosshair.xOffset = xOffset;
		crosshair.yOffset = yOffset;
		crosshair.xMultiOffset = xMultiOffset;
		
	}
	
	public Camera MainCamera() {
		return camera;
	}
	
	public void SwitchVrMode() {
		vrMode = !vrMode;
		
		if(vrMode == true) {
			ovrCamera = ((GameObject)Instantiate(Resources.Load("OVRCustomController"))).GetComponent<OVRCameraController>();
			
			ovrCamera.transform.parent = camera.transform;
			ovrCamera.transform.localRotation = Quaternion.identity;
			ovrCamera.transform.localPosition = (Vector3.down * .1f);
			ovrCamera.FollowOrientation = camera.transform;

			Screen.SetResolution(1280, 800, true);
			//ovrCamera.SendMessage("GetCameraInstance", camera);
			
			//ovrCamera.FollowOrientation = camera.transform;
			
			// Grab transform of GUI object
				Transform t = GUIRenderObject.transform;
				// Attach the GUI object to the camera
			t.parent = camera.transform;
				ovrCamera.AttachGameObjectToCamera(ref GUIRenderObject);
				// Reset the transform values (we will be maintaining state of the GUI object
				// in local state)

				OVRUtils.SetLocalTransform(ref GUIRenderObject, ref t);
				// Deactivate object until we have completed the fade-in
				// Also, we may want to deactive the render object if there is nothing being rendered
				// into the UI
				// we will move the position of everything over to the left, so get
				// IPD / 2 and position camera towards negative X
				Vector3 lp = GUIRenderObject.transform.localPosition;
				float ipd = 0.0f;
				ovrCamera.GetIPD(ref ipd);
				lp.x -= ipd * 0.5f;
				lp.z +=1;
				GUIRenderObject.transform.localPosition = lp;
				
				//GUIRenderObject.SetActive(false);
			
			camera.enabled = false;
			camera.GetComponent<AudioListener>().enabled = false;
		}
		else {
			Transform t = GUIRenderObject.transform;
			OVRUtils.SetWorldTransform(ref GUIRenderObject, ref t);
			GUIRenderObject.transform.parent = null;
			//ovrCamera.DetachGameObjectFromCamera(ref GUIRenderObject);
			Destroy(ovrCamera.gameObject);
			camera.enabled = true;
			camera.GetComponent<AudioListener>().enabled = true;
			ovrCamera = null;
		}
	}
	
	void UpdateIPD()
	{
		if(Input.GetKeyDown (KeyCode.Equals))
		{
			float ipd = 0;
			ovrCamera.GetIPD(ref ipd);
			ipd += IPDIncrement;
			ovrCamera.SetIPD (ipd);
		}
		else if(Input.GetKeyDown (KeyCode.Minus))
		{
			float ipd = 0;
			ovrCamera.GetIPD(ref ipd);
			ipd -= IPDIncrement;
			ovrCamera.SetIPD (ipd);
		}
	}
	
	void OnGUI()
 	{	
		// Important to keep from skipping render events
		if (Event.current.type != EventType.Repaint)
			return;
	
		//***
		// Set the GUI matrix to deal with portrait mode
		Vector3 scale = Vector3.one;
		if(ovrCamera.PortraitMode == true)
		{
			float h = OVRDevice.HResolution;
			float v = OVRDevice.VResolution;
			scale.x = v / h; 					// calculate hor scale
    		scale.y = h / v; 					// calculate vert scale
		}
		crosshairSvMat = GUI.matrix; // save current matrix
    	// substitute matrix - only scale is altered from standard
    	GUI.matrix = Matrix4x4.TRS(Vector3.zero, Quaternion.identity, scale);
		
		// Cache current active render texture
		crosshairPreviousActive = RenderTexture.active;
		
		// if set, we will render to this texture
		if(crosshairRenderTexture != null)
		{
			RenderTexture.active = crosshairRenderTexture;
			GL.Clear (false, true, new Color (0.0f, 0.0f, 0.0f, 0.0f));
		}

		

		
		//GuiHelper.StereoDrawTexture(0.45f, 0.45f, 0.1f, 0.1f, ref TestImage, Color.white);
		if(HideCrosshair == false)
			crosshair.OnGUICrosshair();
		
		// Restore active render texture
		RenderTexture.active = crosshairPreviousActive;
		
		// ***
		// Restore previous GUI matrix
		GUI.matrix = crosshairSvMat;
 	}
	
	// Replace the GUI with our own texture and 3D plane that
	// is attached to the rendder camera for true 3D placement
	private OVRGUI  		GuiHelper 		 = new OVRGUI();
	private GameObject      GUIRenderObject  = null;
	private RenderTexture	GUIRenderTexture = null;
	
	private GameObject      crosshairRenderObject  = null;
	private RenderTexture	crosshairRenderTexture = null;

	RenderTexture crosshairPreviousActive;
	Matrix4x4 crosshairSvMat = GUI.matrix; // save current matrix
	

	RenderTexture previousActive;
	Matrix4x4 svMat = GUI.matrix; // save current matrix
	bool calledThisFrame = false;
	bool cleared = false;
	bool delayClear = true;
	// GUI
	
	// * * * * * * * * * * * * * * * * *
	// OnGUI
 	public void OnGUIBegin()
 	{	
		// Important to keep from skipping render events
		if (Event.current.type != EventType.Repaint)
			return;
		calledThisFrame = true;
		
		// Set the GUI matrix to deal with portrait mode
		Vector3 scale = Vector3.one;
		if(ovrCamera.PortraitMode == true)
		{
			float h = OVRDevice.HResolution;
			float v = OVRDevice.VResolution;
			scale.x = v / h; 					// calculate hor scale
    		scale.y = h / v; 					// calculate vert scale
		}

		svMat = GUI.matrix; // save current matrix
    	// substitute matrix - only scale is altered from standard
    	GUI.matrix = Matrix4x4.TRS(Vector3.zero, Quaternion.identity, scale);
		
		// Cache current active render texture
		previousActive = RenderTexture.active;
		
		// if set, we will render to this texture
		if(GUIRenderTexture != null)
		{
			RenderTexture.active = GUIRenderTexture;
			if(!cleared) {
				GL.Clear (false, true, new Color (0.0f, 0.0f, 0.0f, 0.0f));
				cleared = true;
				
			}
		}
		
		
		
	}
	
	public void OnGUIEnd() {
		
		// Update OVRGUI functions (will be deprecated eventually when 2D renderingc
		// is removed from GUI)
		//GuiHelper.SetFontReplace(FontReplace);
		
		//put stuff here
		GUI.Box(new Rect(Input.mousePosition.x, Screen.height - Input.mousePosition.y, 30, 30), cursor, "Label");
		
		
		// Restore active render texture
		RenderTexture.active = previousActive;
		
		// ***
		// Restore previous GUI matrix
		GUI.matrix = svMat;
 	}
}
