#version 330 core
layout (points) in;
layout (max_vertices = 15) out;

in VS_OUT
{
	vec3 wsCoord;
	vec3 uvw;
	vec4 f0123;
	vec4 f4567;
	int mc_case;
} gs_in[];

out GS_OUT
{
    vec4 wsCoord_Ambo;
    vec3 wsNormal;
} gs_out;

uniform sampler3D texture3D;
uniform sampler3D grad_ambo_tex;

uniform g_mc_lut1
{
    uint case_to_numpolys[256];
    vec4 cornerAmask0123[12];
    vec4 cornerAmask4567[12];
    vec4 cornerBmask0123[12];
    vec4 cornerBmask4567[12];
    vec3 vec_start[12];
    vec3 vec_dir[12];
}

uniform g_mc_lut2
{
    ivec4 g_triTable[1280]; // 5 * 256
}

void main() 
{    
    uint num_polys = case_to_numpolys[];
} 