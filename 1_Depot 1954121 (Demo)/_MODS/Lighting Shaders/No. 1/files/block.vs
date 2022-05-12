#version 330 core

layout(location = 0) in vec4 vert;
layout(location = 1) in vec3 color;

out vec3 gsColor;

// model view matrix
uniform float MV[25];

uniform uvec2 texSize;

void main()
{
	// multiply the vertex by MV
	float v[5] = float[5](vert.x, vert.y, vert.z, vert.w, 1.0);
	vec4 result;
	for (int row = 0; row < 4; ++row)
	{
		result[row] = 0;
		for (int col = 0; col < 5; ++col)
		{
			result[row] += MV[col * 5 + row] * v[col];
		}
	}

	//result.y += sin(result.x);

	gl_Position = result;
	gsColor = vec3(
		float(color.x) / texSize.x,
		float(color.y) / texSize.y,
		float(color.z)
	);
}