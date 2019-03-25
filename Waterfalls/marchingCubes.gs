#version 150 core
layout (points) in;
layout (max_vertices = 15) out;

in struct VS_OUT
{
	vec3 wsCoord;
	vec3 uvw;
	vec4 f0123;
	vec4 f4567;
	int mc_case;
} gs_in[];

out struct GS_OUT
{
    vec4 wsCoord_Ambo;
    vec3 wsNormal;
} gs_out;


vec3 wsVoxelSize = vec3(2.0/95.0);
vec3 voxelDimMinusOne = vec3(95, 256, 95);
vec4 inv_voxelDimMinusOne = vec4( 1.0/voxelDimMinusOne, 0 );

uniform sampler3D texture3D;
uniform sampler3D grad_ambo_tex;

uniform g_mc_lut1
{
    int case_to_numpolys[256];
    vec4 cornerAmask0123[12];
    vec4 cornerAmask4567[12];
    vec4 cornerBmask0123[12];
    vec4 cornerBmask4567[12];
    vec3 vec_start[12];
    vec3 vec_dir[12];
};

uniform g_mc_lut2
{
    ivec4 g_triTable[1280]; // 5 * 256
};

GS_OUT PlaceVertOnEdge(VS_OUT inputStuff, int edgeNum)
{
    float str0 = dot(cornerAmask0123[edgeNum], inputStuff.f0123) +
                 dot(cornerAmask4567[edgeNum], inputStuff.f4567);
    float str1 = dot(cornerBmask0123[edgeNum], inputStuff.f0123) +
                 dot(cornerBmask4567[edgeNum], inputStuff.f4567);

    float t = clamp(str0/(str0 - str1), 0.0, 1.0);

    vec3 pos_within_cell = vec_start[edgeNum] + t * vec_dir[edgeNum];

    vec3 wsCoord = inputStuff.wsCoord.xyz + pos_within_cell.xyz * wsVoxelSize; 

    vec3 uvw = inputStuff.uvw + (pos_within_cell * inv_voxelDimMinusOne).xyz;

    GS_OUT outputStuff;
    outputStuff.wsCoord_Ambo.xyz = wsCoord;
    outputStuff.wsCoord_Ambo.w = texture(grad_ambo_tex, uvw).w;
    outputStuff.wsNormal = vec3(1.0);

    return outputStuff;
}

void main() 
{    
    int num_polys = case_to_numpolys[gs_in[0].mc_case];
    int table_pos = gs_in[0].mc_case*5;
    for(int p=0; p<num_polys; p++)
    {
        GS_OUT outputStuff;
        ivec4 polydata = g_triTable[table_pos++];
        
        outputStuff = PlaceVertOnEdge(gs_in[0], polydata.x);
        gl_Position = outputStuff.wsCoord_Ambo;
        EmitVertex();
        gl_Position = vec4(outputStuff.wsNormal, 0.0);
        EmitVertex();

        outputStuff = PlaceVertOnEdge(gs_in[0], polydata.y);
        gl_Position = outputStuff.wsCoord_Ambo;
        EmitVertex();
        gl_Position = vec4(outputStuff.wsNormal, 0.0);
        EmitVertex();

        outputStuff = PlaceVertOnEdge(gs_in[0], polydata.z);
        gl_Position = outputStuff.wsCoord_Ambo;
        EmitVertex();
        gl_Position = vec4(outputStuff.wsNormal, 0.0);
        EmitVertex();

        EndPrimitive();
    }
} 