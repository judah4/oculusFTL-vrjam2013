using UnityEngine;
using System.Collections;

public class ShipRoom : Attackable {
	
	public Compartment compartment;
	
	public Wall[] walls = new Wall[6];
	public Door[] doors = new Door[6];
	
	public bool windowTop = false;
	
	public WallType doorFor = WallType.Open;
	public WallType doorBack = WallType.Open;
	public WallType doorLeft = WallType.Open;
	public WallType doorRight = WallType.Open;


	// Use this for initialization
	void Start () {
		walls[(int)WallFacings.down] = new GameObject("Wall Down").AddComponent<Wall>();
		walls[(int)WallFacings.down].ParentAttackable = this;
		walls[(int)WallFacings.down].transform.parent = transform;
		walls[(int)WallFacings.down].transform.localPosition = new Vector3(0, -1.5f, 0);
		
		if(windowTop) {
			walls[(int)WallFacings.up] = new GameObject("Window Up").AddComponent<Window>();
			walls[(int)WallFacings.up].transform.parent = transform;
			walls[(int)WallFacings.up].ParentAttackable = this;
			walls[(int)WallFacings.up].transform.localPosition = new Vector3(0, 1.5f, 0);
			walls[(int)WallFacings.up].transform.localRotation = Quaternion.Euler(0, 180, 180);
		}
		else {
			walls[(int)WallFacings.up] = new GameObject("Wall Up").AddComponent<Wall>();
			walls[(int)WallFacings.up].transform.parent = transform;
			walls[(int)WallFacings.up].ParentAttackable = this;
			walls[(int)WallFacings.up].transform.localPosition = new Vector3(0, 1.5f, 0);
			walls[(int)WallFacings.up].transform.localRotation = Quaternion.Euler(0, 0, 180);
		}
		if(doorFor == WallType.Door) {
			doors[(int)WallFacings.forward] = new GameObject("Door Forward").AddComponent<Door>();
			doors[(int)WallFacings.forward].transform.parent = transform;
			doors[(int)WallFacings.forward].ParentAttackable = this;
			doors[(int)WallFacings.forward].transform.localPosition = new Vector3(0, 0, 1.5f);
			doors[(int)WallFacings.forward].transform.localRotation = Quaternion.Euler(90, 180, 0);
		}
		else if(doorFor == WallType.Wall) {
			walls[(int)WallFacings.forward] = new GameObject("Wall Forward").AddComponent<Wall>();
			walls[(int)WallFacings.forward].transform.parent = transform;
			walls[(int)WallFacings.forward].ParentAttackable = this;
			walls[(int)WallFacings.forward].transform.localPosition = new Vector3(0, 0, 1.5f);
			walls[(int)WallFacings.forward].transform.localRotation = Quaternion.Euler(-90, 0, 0);
		}
		else if(doorFor == WallType.WindowFront) {
			walls[(int)WallFacings.forward] = new GameObject("Window Forward").AddComponent<Window>();
			walls[(int)WallFacings.forward].transform.parent = transform;
			walls[(int)WallFacings.forward].ParentAttackable = this;
			walls[(int)WallFacings.forward].transform.localPosition = new Vector3(0, 0, 1.5f);
			walls[(int)WallFacings.forward].transform.localRotation = Quaternion.Euler(90, 180, 0);
		}
		
		if(doorBack == WallType.Door) {
			doors[(int)WallFacings.backward] = new GameObject("Door Back").AddComponent<Door>();
			doors[(int)WallFacings.backward].transform.parent = transform;
			doors[(int)WallFacings.backward].ParentAttackable = this;
			doors[(int)WallFacings.backward].transform.localPosition = new Vector3(0, 0, -1.5f);
			doors[(int)WallFacings.backward].transform.localRotation = Quaternion.Euler(90, 0, 0);
		}
		else if(doorBack == WallType.Wall) {
			walls[(int)WallFacings.backward] = new GameObject("Wall Back").AddComponent<Wall>();
			walls[(int)WallFacings.backward].transform.parent = transform;
			walls[(int)WallFacings.backward].ParentAttackable = this;
			walls[(int)WallFacings.backward].transform.localPosition = new Vector3(0, 0, -1.5f);
			walls[(int)WallFacings.backward].transform.localRotation = Quaternion.Euler(90, 0, 0);
		}
		
		if(doorLeft == WallType.Door) {
			doors[(int)WallFacings.left] = new GameObject("Door Left").AddComponent<Door>();
			doors[(int)WallFacings.left].transform.parent = transform;
			doors[(int)WallFacings.left].ParentAttackable = this;
			doors[(int)WallFacings.left].transform.localPosition = new Vector3( -1.5f, 0, 0);
			doors[(int)WallFacings.left].transform.localRotation = Quaternion.Euler(90, 90, 0);
		}
		else if(doorLeft == WallType.Wall) {
			walls[(int)WallFacings.left] = new GameObject("Wall Left").AddComponent<Wall>();
			walls[(int)WallFacings.left].transform.parent = transform;
			walls[(int)WallFacings.left].ParentAttackable = this;
			walls[(int)WallFacings.left].transform.localPosition = new Vector3(-1.5f, 0, 0);
			walls[(int)WallFacings.left].transform.localRotation = Quaternion.Euler(0, 0, -90);
		}
		else if(doorLeft == WallType.WindowSide) {
			Window w =  new GameObject("Window Left").AddComponent<Window>();
			w.side = true;
			walls[(int)WallFacings.left] = w;
			walls[(int)WallFacings.left].transform.parent = transform;
			walls[(int)WallFacings.left].ParentAttackable = this;
			walls[(int)WallFacings.left].transform.localPosition = new Vector3(-1.5f, 0, 0);
			walls[(int)WallFacings.left].transform.localRotation = Quaternion.Euler(90, 90, 0);
		}
		
		if(doorRight == WallType.Door) {
			doors[(int)WallFacings.right] = new GameObject("Door Right").AddComponent<Door>();
			doors[(int)WallFacings.right].transform.parent = transform;
			doors[(int)WallFacings.right].ParentAttackable = this;
			doors[(int)WallFacings.right].transform.localPosition = new Vector3(1.5f, 0, 0);
			doors[(int)WallFacings.right].transform.localRotation = Quaternion.Euler(90, 270, 0);
		}
		else if(doorRight == WallType.Wall) {
			walls[(int)WallFacings.right] = new GameObject("Wall Right").AddComponent<Wall>();
			walls[(int)WallFacings.right].transform.parent = transform;
			walls[(int)WallFacings.right].ParentAttackable = this;
			walls[(int)WallFacings.right].transform.localPosition = new Vector3(1.5f, 0, 0);
			walls[(int)WallFacings.right].transform.localRotation = Quaternion.Euler(0, 0, 90);
		}
		else if(doorRight == WallType.WindowSide) {
			Window w =  new GameObject("Window Right").AddComponent<Window>();
			w.side = true;
			walls[(int)WallFacings.right] = w;
			walls[(int)WallFacings.right].transform.parent = transform;
			walls[(int)WallFacings.right].ParentAttackable = this;
			walls[(int)WallFacings.right].transform.localPosition = new Vector3(1.5f, 0, 0);
			walls[(int)WallFacings.right].transform.localRotation = Quaternion.Euler(0, 180, 270);
		}
	}
	
	// Update is called once per frame
	void Update () {
	
	}
	
	public override void OnHit (float damage)
	{
		Debug.Log("Damaged" + name);
		compartment.OnHit( damage);
	}
	
}

public enum WallType {
	Open,
	Wall,
	Door,
	WindowFront,
	WindowSide,
	WindowTop,
}

public enum WallFacings {
	up,
	down,
	left, 
	right,
	forward,
	backward
}
