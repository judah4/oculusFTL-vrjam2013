using UnityEngine;
using System.Collections;

public class ShipInput : MonoBehaviour {
	
	public ShipControl controller;
	public float rotationAmount = 1000;

	// Use this for initialization
	void Start () {
	
	}
	
	// Update is called once per frame
	void Update () {
		controller.ApplyThrust(Input.GetAxis("Thrust") * 30 * Time.deltaTime);
		controller.RotateMe(Input.GetAxis("Vertical") * rotationAmount * Time.deltaTime, Input.GetAxis("Horizontal") * rotationAmount * Time.deltaTime, Input.GetAxis("Yaw") * -rotationAmount * Time.deltaTime);
	}
}
