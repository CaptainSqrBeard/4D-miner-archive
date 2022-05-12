#version 330 core

layout(lines_adjacency) in;
layout(triangle_strip, max_vertices = 12) out;

in vec3 gsColor[];
out vec3 fsColor;
out vec4 bornal;
out vec3 fragPos;

// projection matrix is handled here after the coordinates are converted to 3D
uniform mat4 P;

void main()
{
	// calculate intersection between simplex and hyperplane (3D view)

	// simplex edge vertex indices (i0, i1)
	// each consecutive pair corresponds to an edge number: 0, 1, 2, 3, 4, 5
	int edges[12] = int[12](0, 1 /* 0 */, 0, 2 /* 1 */, 0, 3 /* 2 */, 1, 2 /* 3 */, 1, 3 /* 4 */, 2, 3 /* 5 */);

	// keep track of which simplex vertices intersect with the hyperplane
	bool insidePts[4] = bool[4](false, false, false, false);

	// number of intersection points
	int k = 0;
	// intersection points
	vec4 pts[4];
	// the edge that each point is found in (0 - 5)
	int ptEdges[4];
	// corresponding colors
	vec3 colors[4];

	vec4 pp69 = gl_in[0].gl_Position;
	vec4 pp0 = gl_in[1].gl_Position-pp69;
	vec4 pp1 = gl_in[2].gl_Position-pp69;
	vec4 pp2 = gl_in[3].gl_Position-pp69;
	{ //Geometric algebruh moment
	float exy = (pp0.x*pp1.y)-(pp0.y*pp1.x);
	float exz = (pp0.x*pp1.z)-(pp0.z*pp1.x);
	float exw = (pp0.x*pp1.w)-(pp0.w*pp1.x);
	float eyz = (pp0.y*pp1.z)-(pp0.z*pp1.y);
	float eyw = (pp0.y*pp1.w)-(pp0.w*pp1.y);
	float ezw = (pp0.z*pp1.w)-(pp0.w*pp1.z);
	float oxyz = (exy*pp2.z)-(exz*pp2.y)+(eyz*pp2.x);
	float oxyw = (exy*pp2.w)-(exw*pp2.y)+(eyw*pp2.x);
	float oxzw = (exz*pp2.w)-(exw*pp2.z)+(ezw*pp2.x);
	float oyzw = (eyz*pp2.w)-(eyw*pp2.z)+(ezw*pp2.y);
	bornal = normalize(vec4(oyzw,-oxzw,oxyw,-oxyz));
	}

	for (int i = 0; i < 12; i += 2)
	{
		if (k == 4)
		{
			break;
		}

		int k0 = edges[i];
		int k1 = edges[i + 1];
		vec4 p0 = gl_in[k0].gl_Position;
		vec4 p1 = gl_in[k1].gl_Position;

		// vertices are on the same side of the hyperplane so the edge doesn't intersect
		if ((p0[3] < 0.0000001 && p1[3] < 0.0000001) || (p0[3] > -0.0000001 && p1[3] > -0.0000001))
		{
			continue;
		}

		// intersection
		float a = 0;
		if (abs(p1[3] - p0[3]) > 0.0000001)
		{
			a = (-p0[3]) / (p1[3] - p0[3]);
		}
		pts[k] = mix(p0, p1, a);

		// interpolate TUV coords
		colors[k] = mix(gsColor[k0], gsColor[k1], a);

		pts[k][3] = 1.0;

		ptEdges[k] = i / 2;
		++k;
	}
	
	// 3 intersection points = triangle
	if (k == 3)
	{
		for (int i = 0; i < 3; ++i)
		{
			gl_Position = P * pts[i];
			fsColor = colors[i];
			EmitVertex();
		}
	}
	// 4 intersection points = quad (2 triangles) or simplex (4 triangles)
	else if (k == 4)
	{
		int k0 = 0;
		int k1;
		int k2;
		int k3;
		// set k1 to the opposite point of k0
		if (ptEdges[1] == 5 - ptEdges[k0])
		{
			k1 = 1;
			k2 = 2;
			k3 = 3;
		}
		else if (ptEdges[2] == 5 - ptEdges[k0])
		{
			k1 = 2;
			k2 = 1;
			k3 = 3;
		}
		else
		{
			k1 = 3;
			k2 = 1;
			k3 = 2;
		}
		
		gl_Position = P * pts[k0];
		fsColor = colors[k0];
		fragPos = pts[k0].xyz;
		EmitVertex();

		gl_Position = P * pts[k1];
		fsColor = colors[k1];
		fragPos = pts[k1].xyz;
		EmitVertex();

		gl_Position = P * pts[k2];
		fsColor = colors[k2];
		fragPos = pts[k2].xyz;
		EmitVertex();
		EndPrimitive();

		gl_Position = P * pts[k0];
		fsColor = colors[k0];
		fragPos = pts[k0].xyz;
		EmitVertex();

		gl_Position = P * pts[k1];
		fsColor = colors[k1];
		fragPos = pts[k1].xyz;
		EmitVertex();

		gl_Position = P * pts[k3];
		fsColor = colors[k3];
		fragPos = pts[k3].xyz;
		EmitVertex();
		EndPrimitive();
	}

}