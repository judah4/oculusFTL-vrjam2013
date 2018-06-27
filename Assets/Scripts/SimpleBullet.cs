using UnityEngine;
using System.Collections;

public class SimpleBullet : MonoBehaviour {

	float speed   = 10;
	float lifeTime   = 0.5f;
	public float dist   = 10000;
	
	public Ray ray;
	public RaycastHit info;

	private float spawnTime  = 0.0f;
	private Transform tr  ;

	void OnEnable () {
		tr = transform;
		spawnTime = Time.time;
	}
	
	void Update () {
		tr.position += tr.forward * speed * Time.deltaTime;
		dist -= speed * Time.deltaTime;
		if (Time.time > spawnTime + lifeTime || dist < 0) {
			GameObject.Destroy (gameObject);
			//BulletMark.instance.RaycastBullet(ray, info);
		}
	}
}
