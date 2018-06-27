using UnityEngine;
using System.Collections;

public class SpaceManager : MonoBehaviour {
	
	
	
	public bool debugMode = false;
	
	public GameObject[] nebula;
	public GameObject spaceCloud;
	public GameObject[] astroids;
	//public GameObject spacebits;
	
	[SerializeField]
	SpaceType currentType = SpaceType.OpenSpace;
	
	new Camera camera;
	
	
	
	// Use this for initialization
	void Start () {
		camera = Camera.main;
	}
	
	// Update is called once per frame
	void Update () {
		switch(currentType) {
		case SpaceType.OpenSpace:
			for(int cnt = 0; cnt < astroids.Length; cnt++) {
				astroids[cnt].SetActive(false);
			}
			
			for(int cnt = 0; cnt < nebula.Length; cnt++) {
				nebula[cnt].SetActive(false);
			}
			spaceCloud.SetActive(true);
			//spacebits.SetActive(true);
			break;
		case SpaceType.Astroids:
			for(int cnt = 0; cnt < astroids.Length; cnt++) {
				astroids[cnt].SetActive(true);
			}
			for(int cnt = 0; cnt < nebula.Length; cnt++) {
				nebula[cnt].SetActive(false);
			}
			spaceCloud.SetActive(true);
			//spacebits.SetActive(false);
			break;
			
		case SpaceType.Nebula:
			for(int cnt = 0; cnt < astroids.Length; cnt++) {
				astroids[cnt].SetActive(false);
			}
			for(int cnt = 0; cnt < nebula.Length; cnt++) {
				nebula[cnt].SetActive(true);
			}
			//nebula.transform.position = camera.transform.position;
			spaceCloud.SetActive(true);
			//spacebits.SetActive(true);
			break;
			
			
		}
	}
	
	public void SwitchSpaceType(SpaceType spaceType) {
		currentType = spaceType;
	}
	
	void OnGUI() {
		if(!debugMode)
			return;
		
		CameraManager.Instance.OnGUIBegin();
		
		GUI.Box(new Rect(210, 20, 80, 150), "");
		GUI.BeginGroup(new Rect(210, 20, 80, 150));
		
		for(int cnt = 0; cnt < 3; cnt++) {
			if(GUI.Button(new Rect(5, 5  + 30 * cnt, 70, 25), ((SpaceType)cnt).ToString())) {
				SwitchSpaceType((SpaceType)cnt);
			}
		}
		
		
		GUI.EndGroup();
		
		CameraManager.Instance.OnGUIEnd();
	}
	
}

public enum SpaceType {
	OpenSpace,
	Astroids,
	Nebula,
}
