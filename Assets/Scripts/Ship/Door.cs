using UnityEngine;
using System.Collections;

public class Door : SubAttackable {
	
	GameObject model;

	// Use this for initialization
	void Start () {
		model = Instantiate( Resources.Load("Door"), transform.position, transform.rotation) as GameObject;
		model.transform.parent = transform;
		
		SubAttackable sa = model.AddComponent<SubAttackable>();
		sa.ParentAttackable = this;
	}
	
	// Update is called once per frame
	void Update () {
	
	}
}
