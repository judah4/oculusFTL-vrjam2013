using UnityEngine;
using System.Collections;

public class RotateThing : MonoBehaviour {
	
	public float rotate = 90;

	// Use this for initialization
	void Start () {
	
	}
	
	// Update is called once per frame
	void Update () {
		transform.Rotate(0, rotate * Time.deltaTime, 0);
	}
}
