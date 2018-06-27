using UnityEngine;
using System.Collections;

[RequireComponent(typeof(ProximitySelect))]
public class ShipComponent : Attackable {
	
	public Compartment compartment;
	
	[SerializeField]
	protected int currentPower = 0;
	[SerializeField]
	protected int currentMax = 1;
	[SerializeField]
	protected int maxPower = 1;
	
	[SerializeField]
	protected bool broken = false;
	
	public int CurrentPower {
		get {return currentPower; }
	}
	
	public int CurrentMax {
		get {return currentMax; }
	}
	
	public float Damage {
		get {return damage; }
	}
	
	
	[SerializeField]
	protected float damage = 0;
	
	protected ProximitySelect prox;
	
	public Transform healthCheckMount;
	Transform healthThing;
	protected HealthState healthState = HealthState.Default;
	
	public void OnAwake() {
		damage = 0;
	}
	
	// Use this for initialization
	public void OnStart () {
		prox = GetComponent<ProximitySelect>();
		
		UpdateHealthCheck();
		
		
	}
	
	void Awake() {
		OnAwake();
	}
	
	void Start() {
		OnStart();
	}
	
	// Update is called once per frame
	void Update () {
		//broken = (damage >= currentMax );
			
	}
	
	public bool AssignPower() {
		if(currentPower < maxPower) {
			currentPower++;
			return true;
			
		}
		
		return false;
		
	}
	
	public bool RemovePower() {
		if(currentPower > 0) {
			currentPower--;
			return true;
			
		}
		
		return false;
		
	}
	
	public void UpdateHealthCheck() {
		if(broken && healthState != HealthState.Broken) {
			healthState = HealthState.Broken;
			if(healthThing != null)
				Destroy(healthThing.gameObject);
			
			healthThing = (Instantiate(Resources.Load("HealthThings/Broken"), transform.position, transform.rotation) as GameObject).transform;
		}
		
		else if(damage <= 0 && healthState != HealthState.Healthy) {
			healthState = HealthState.Healthy;
			if(healthThing != null)
				Destroy(healthThing.gameObject);
			
			healthThing = (Instantiate(Resources.Load("HealthThings/Check"), transform.position, transform.rotation) as GameObject).transform;
		}
		else if(damage > 0 && !broken && healthState != HealthState.Damaged) {
			healthState = HealthState.Damaged;
			if(healthThing != null)
				Destroy(healthThing.gameObject);
			
			healthThing = (Instantiate(Resources.Load("HealthThings/Damaged"), transform.position, transform.rotation) as GameObject).transform;
		}
		
		if(healthCheckMount != null) {
			healthThing.parent = healthCheckMount;
			healthThing.position = healthCheckMount.position;
			healthThing.rotation = healthCheckMount.rotation;
		}
		else {
			healthThing.parent = transform;
		}
	}
	
	public void Fix(float fixedAmount) {
		damage -= fixedAmount;
		
		if(broken) {
			if(damage >= currentMax - 1) {
				broken = false;
			}
		}
		
		UpdateHealthCheck();
	}
	
	public void Hit(float damage) {
		
		this.damage += damage;
		Debug.Log("Damaged " + name + " for " + damage + " current damage " + this.damage);
		
		if(this.damage >= currentMax - .01f ) {
			this.damage = currentMax;
			if(!broken) {
				broken = true;
				compartment.Hit(1);
			}
		}
		AfterDamagePowerCheck();
		UpdateHealthCheck();
	}
	
	public override void OnHit (float damage)
	{
		Debug.Log("Damaged " + name + " for " + damage); 
		
		this.damage += damage;
		//compartment.OnHit( damage);
		
		if(this.damage >= currentMax - .01f) {
			this.damage = currentMax;
			if(!broken) {
				broken = true;
				compartment.Hit(1);
			}
		}
		AfterDamagePowerCheck();
		UpdateHealthCheck();
	}
	
	public virtual void AfterDamagePowerCheck() {
		while(CurrentMax - CurrentPower - (int)Damage  < 0)
				compartment.ship.RemovePower(this);
	}
	

}
		
public enum HealthState	{
	Default,
	Healthy,
	Damaged,
	Broken
}
