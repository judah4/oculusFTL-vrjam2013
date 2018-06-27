using UnityEngine;
using System.Collections;

public class BaseCharacter : Attackable {
	
	MoveController controller;
	
	[SerializeField]
	int life = 100;

	// Use this for initialization
	void Start () {
		controller = GetComponent<MoveController>();
	}
	
	// Update is called once per frame
	void Update () {
	
	}
	
	public override void OnHit (float damage)
	{
		life -= (int)(damage * 15);
		//Die(DeathType.Common);
		controller.Die(DeathType.Common);
	}
	
	public void Die(DeathType type) {
		switch(type) {
		case DeathType.Common:
			
			break;
		case DeathType.Explode:
			
			break;
		}
	}
}
