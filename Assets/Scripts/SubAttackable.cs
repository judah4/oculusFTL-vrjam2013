using UnityEngine;
using System.Collections;

public class SubAttackable : Attackable {
	
	[SerializeField]
	Attackable attackable;
	
	public Attackable ParentAttackable {
		set { 
			attackable = value;
			tag = attackable.tag;
		}
	}

	// Use this for initialization
	void Start () {
		if(attackable != null)
			tag = attackable.tag;
	}
	
	// Update is called once per frame
	void Update () {
	
	}
	
	public override void OnHit (float damage)
	{
		Debug.Log("Damaged " + name + " for " + damage);
		if(attackable) 
			attackable.OnHit(damage);
		
	}
}
