#version 330 core

vec3 neg(vec3 col) {
	return vec3(1.0,1.0,1.0) - col;
}

vec3 scenary(vec3 D) {
	
	float rot = acos(D.x/cos(D.y));

	float ground = clamp(
		(D.y + cos(rot*2.0) + 1.0) * 1.5 - 0.5,
		0.0, 1.0);
	
	float dir = (D.y + D.x) / 1.4142;
	float sky = (2.0 - dir*dir*dir*dir) / 2.0;
	
	vec3 skyCol = vec3(0.1, 0.1, 0.15);
	skyCol = neg(neg(skyCol)*sky);
	
	float trees = -abs(sin(rot*10.0)) + 1.0 - abs(D.y);

	vec3 treeCol = vec3(0.0, 0.0, 0.0);

	return mix(skyCol * ground, treeCol, trees);
}

// Interpolated values from the vertex shaders
in vec3 fsColor;
in vec4 fsPos;

// Ouput data
out vec4 color;

uniform float MV[25];

// Values that stay constant for the whole mesh.
uniform sampler2D texSampler;
uniform uvec2 texSize;

void main()
{
	// Output color = color of the texture at the specified UV
	
	
	mat4 view_orr = mat4(
	MV[0],MV[1],MV[2],MV[3],
	MV[5],MV[6],MV[7],MV[8],
	MV[10],MV[11],MV[12],MV[13],
	MV[15],MV[16],MV[17],MV[18]
	);
	vec4 view_pos = vec4(MV[20],MV[21],MV[22],MV[23]);
	
	vec4 p = vec4(fsPos.xyz/fsPos.w, 1.0);
	
	vec4 world = inverse(view_orr)*(p-view_pos);
	
	vec3 X = dFdx(world.xyz);
	vec3 Y = dFdy(world.xyz);
	
	vec3 N = normalize(cross(X,Y)); //Thanks Koulatko :)
	
	vec3 diffuse = texture(texSampler, vec2(fsColor.x, fsColor.y + (floor(fsColor.z) / texSize.y))).xyz;
	
	vec3 V = normalize((inverse(view_orr)*p).xyz); //Thanks Koulatko :)
	
	vec3 D = reflect(V,N);
	
	color = vec4(diffuse + scenary(D) * 0.5, 1.0);
	
	//color = vec4(scenary(D), 1.0); //for testing the scenary function

}