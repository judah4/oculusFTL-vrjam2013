Shader "ForceX/Vertex Lit (Texture, Alpha)" {
	Properties {
		_MainTex ("Texture", 2D) = "white" {}
	}

	Category {
		Tags { "Queue"="Geometry"Queue = Transparent}
		Lighting Off
		ZWrite Off
		Blend SrcAlpha OneMinusSrcAlpha 
		BindChannels {
			Bind "Color", color
			Bind "Vertex", vertex
			Bind "TexCoord", texcoord
		}
		SubShader {
			Pass {
				SetTexture [_MainTex] {
					Combine texture * primary DOUBLE
				}
			}
		}
	}
}