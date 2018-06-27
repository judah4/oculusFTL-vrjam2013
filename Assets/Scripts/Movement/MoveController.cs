using UnityEngine;
using System.Collections;

[RequireComponent(typeof(Rigidbody))]
public class MoveController : MonoBehaviour {
	
	bool dead = false;
	new Rigidbody rigidbody;
	
	public float moveSpeed = 5;
	public float rotateSpeed = 100;
	
	[SerializeField]
	float forward = 0;
	[SerializeField]
	float strafe = 0;
	
	[SerializeField]
	float rotate;
	
	float roll = 0;
	float jumpUp = 0;
	
	[SerializeField]
	bool noGrav = false;
	
	bool allowedRotation = true;
	
	public BaseCharacter character;
	
	public bool NoGravity {
		set { noGrav = value; }
	}
	
	Vector3 upVector = Vector3.up;
	
	public Transform gravTransform;

	// Use this for initialization
	void Start () {
		rigidbody = GetComponent<Rigidbody>();
		
		
	}
	
	// Update is called once per frame
	void Update () {
		if(gravTransform == null)
			upVector = transform.up;
		else
			upVector = gravTransform.up;
		
		if(noGrav == false) {
			roll = 0;
			if(transform.localRotation.eulerAngles.z != 0) {
				transform.localRotation = Quaternion.Lerp(transform.localRotation, Quaternion.Euler(0, transform.localRotation.eulerAngles.y, 0), 1 * Time.deltaTime);
			}
		}
		
		transform.rotation *= (Quaternion.Euler(new Vector3(0, ((allowedRotation == true) ? rotate : 0f), roll) * rotateSpeed * Time.deltaTime));
		Vector3 moveVec = ((transform.right * strafe * moveSpeed) + (transform.forward * forward * moveSpeed));
		//Debug.Log(moveVec.ToString());
		rigidbody.velocity = moveVec;//+ (transform.up * Physics.gravity.y)), ForceMode.VelocityChange);
		
		if(jumpUp != 0) {
			rigidbody.AddForce((Physics.gravity.y * -jumpUp * transform.up * 5)); 
		}
		else {
			if(noGrav == false)
				rigidbody.AddForce((Physics.gravity.y * upVector * 5));
		}
		jumpUp = 0;
	}
	
	public void MoveMe(float forward, float strafe) {
		if(dead) {
			return;
			
		}
		this.forward = forward;
		this.strafe = strafe;
	}
	
	public void RotateMe(float rotation) {
		if(dead) {
			return;
			
		}
		rotate = rotation;
	}
	
	public void RollMe(float rotation) {
		if(dead) {
			return;
			
		}
		roll = rotation;
	}
	
	public void AllowRotation(bool allow) {
		allowedRotation = !allow;
	}
	
	public void Jump(bool up) {
		if(dead) {
			return;
			
		}
		if(up) {
			jumpUp = 1;
		}
		else
			jumpUp = -1;
	}
	
	public void Die(DeathType type) {
		dead = true;
		rotate = 0;
		roll = 0;
		forward = 0;
		strafe = 0;
		jumpUp = 0;
		character.Die(type);
	}
}
