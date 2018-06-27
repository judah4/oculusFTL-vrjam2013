using UnityEngine;
using System.Collections;

public class Window : Wall {
	
	public bool side = false;

	// Use this for initialization
	void Start () {
		model = Instantiate( Resources.Load((side == true) ? "WindowSide" : "WindowFront"), transform.position, transform.rotation) as GameObject;
		model.transform.parent = transform;
		
		SubAttackable sa = model.AddComponent<SubAttackable>();
		sa.ParentAttackable = this;
	}
	
	// Update is called once per frame
	void Update () {
	
	}
}
