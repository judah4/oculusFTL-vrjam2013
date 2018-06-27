using UnityEngine;
using System.Collections;

[RequireComponent(typeof(AudioSource))]
public class CharacterSound : MonoBehaviour {
	
	public AudioClip weaponSound;

	// Use this for initialization
	void Start () {
	
	}
	
	// Update is called once per frame
	void Update () {
	
	}
	
	public void Shoot() {
		audio.Stop();
		audio.clip = weaponSound;
		audio.Play();
	}
}
