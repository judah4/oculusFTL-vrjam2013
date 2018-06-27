using UnityEngine;
using System.Collections;

public class PlayerInput : MonoBehaviour {
	
	public GameObject bulletPrefab;
	
	public static PlayerInput instance;
	public BaseCharacter character;
		
	
	public MoveController controller;
	public CharacterAim characterAim;
	public CharacterSound soundPlayer;
	
	void Awake() {
		instance = this;
	}
	
	// Use this for initialization
	void Start () {
		controller = GetComponent<MoveController>();
	}
	
	// Update is called once per frame
	void Update () {
		
		if(Input.GetKeyDown(KeyCode.Escape)) {
			Application.Quit();
		}
		
		controller.MoveMe(Input.GetAxis("Vertical"), Input.GetAxis("Horizontal"));
		controller.RotateMe(Input.GetAxis("Mouse X"));
		controller.RollMe(-Input.GetAxis("Yaw"));
		
		if(Input.GetKey(KeyCode.Space)) {
			controller.Jump(true);
		}
		else if(Input.GetKey(KeyCode.LeftControl)) {
			controller.Jump(false);
		}
		if(Input.GetMouseButtonDown(0)) {
			soundPlayer.Shoot();
			Attackable target;
			
			//Quaternion coneRandomRotation = Quaternion.Euler (Random.Range (-1.5f, 1.5f), Random.Range (-1.5f, 1.5f), 0);
			GameObject go  = Instantiate (bulletPrefab, characterAim.aimFrom.position, characterAim.aimFrom.rotation) as GameObject; //* coneRandomRotation) as GameObject;
			SimpleBullet bullet  = go.GetComponent<SimpleBullet> ();
			
			bullet.dist = 50;
			
			Ray ray;
			RaycastHit info;
			if(characterAim.Shoot(out target, out ray, out info)) {
				if(target.tag != character.tag)
					target.OnHit(.2f);
				
				bullet.ray = ray;
				bullet.info = info;
			}
		}
	}
}
