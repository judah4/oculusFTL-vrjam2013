using UnityEngine;
using System.Collections;

public class Wall : SubAttackable {
	
	protected GameObject model;
	
	
	
	

	// Use this for initialization
	void Start () {
		model = Instantiate( Resources.Load("Panel"), transform.position, transform.rotation) as GameObject;
		model.transform.parent = transform;
		
	 	SubAttackable sa = model.AddComponent<SubAttackable>();
		sa.ParentAttackable = this;
	}
	
	// Update is called once per frame
	void Update () {
	
	}
}
