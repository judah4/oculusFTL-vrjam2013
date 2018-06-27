using UnityEngine;
using System.Collections;

//[RequireComponent(typeof(Rigidbody))]
public class ShipControl : MonoBehaviour {
	
	float roll = 0;
	float yaw = 0;
	float pitch = 0;
	float thrust = 0;
	
	[SerializeField]
	float maxThrust = 200;
	[SerializeField]
	float maxRotateSpeed = 50;
	
	public SGT_Thruster thruster;

	// Use this for initialization
	void Start () {
	
	}
	
	// Update is called once per frame
	void Update () {
		
		if(thrust > maxThrust)
			thrust = maxThrust;
		if(thrust < -maxThrust)
			thrust = -maxThrust;
		Vector3 euler = new Vector3(pitch, yaw, roll);
		euler *= Time.deltaTime;
		//Debug.Log(euler + " " + Quaternion.Euler(pitch,yaw, roll).eulerAngles);
		transform.rotation *= Quaternion.Euler(euler);
		//transform.rotation = Quaternion.Lerp(transform.rotation, Quaternion.Euler(pitch,yaw, roll), 4 * Time.deltaTime);
		transform.position += (transform.forward * thrust * Time.deltaTime);
		//rigidbody = transform.forward * thrust;
		
		thruster.SetThrusterThrottle(thrust / maxThrust);
	}
	
	public void RotateMe(float p, float y, float r) {
		roll = r;
		pitch = p;
		yaw = y;
		
		if(pitch > maxRotateSpeed)
			pitch = maxRotateSpeed;
		else if(pitch < -maxRotateSpeed)
			pitch = -maxRotateSpeed;
		
		if(yaw > maxRotateSpeed)
			yaw = maxRotateSpeed;
		else if(yaw < -maxRotateSpeed)
			yaw = -maxRotateSpeed;
		
		if(roll > maxRotateSpeed)
			roll = maxRotateSpeed;
		else if(roll < -maxRotateSpeed)
			roll = -maxRotateSpeed;
	}
	
	public void ApplyThrust(float thrust) {
		this.thrust += thrust;
		
		if(this.thrust > maxThrust)
			this.thrust = maxThrust;
	}
	
	public void StopMovement() {
		thrust = 0;
	}
	
	public void LevelRotation() {
		roll = 0;
		pitch = 0;
		yaw = 0;
	}
}
