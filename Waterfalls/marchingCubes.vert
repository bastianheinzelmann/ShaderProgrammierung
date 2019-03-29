#version 410 core
in vec2 aUV;

in int gl_InstanceID;

out struct VS_OUT
{
	vec4 wsCoord;
	vec3 uvw;
	vec4 f0123;
	vec4 f4567;
	int mc_case;
} vs_out;

uniform SliceInfos
{
	float slice_world_space_Y_coord[256];
};

uniform sampler3D texture3D;

float WorldSpaceVolumeHeight = 2.0*(256/96.0);
// ivec3 voxelDim = ivec3(96, 256, 96);
vec3 voxelDimMinusOne = vec3(95, 256, 95);
//vec3 wsVoxelSize = vec3(2.0/95.0);
//vec4 inv_voxelDim = vec4( 1.0/voxelDim, 0 );
vec4 inv_voxelDimMinusOne = vec4( 1.0/voxelDimMinusOne, 0 );

#define WS_to_UVW(ws) (vec3(ws.xz*0.5+0.5, ws.y*WorldSpaceVolumeHeight).xzy)

void main()
{
	vec3 wsCoord;
	wsCoord.xz = aUV.xy * 2 - 1;
	wsCoord.y = slice_world_space_Y_coord[gl_InstanceID];
	vec3 uvw = WS_to_UVW(wsCoord);

	vec4 step = vec4(inv_voxelDimMinusOne.xyz, 0);
	vec4 f0123 = vec4(	texture(texture3D, uvw + step.www).x,
						texture(texture3D, uvw + step.wwz).x,
						texture(texture3D, uvw + step.xwz).x,
						texture(texture3D, uvw + step.xww).x);
	vec4 f4567 = vec4(	texture(texture3D, uvw + step.wyw).x,
						texture(texture3D, uvw + step.wyz).x,
						texture(texture3D, uvw + step.xyz).x,
						texture(texture3D, uvw + step.xyw).x);

	ivec4 n0123 = ivec4(clamp(f0123*99999, 0.0, 1.0));
	ivec4 n4567 = ivec4(clamp(f4567*99999, 0.0, 1.0));
	int mc_case = (n0123.x     ) | (n0123.y << 1) | (n0123.z << 2) | (n0123.w << 3)
				| (n4567.x << 4) | (n4567.y << 5) | (n4567.z << 6) | (n4567.w << 7);

	vs_out.wsCoord = vec4(wsCoord, 0);
	vs_out.uvw = uvw;
	vs_out.f0123 = f0123;
	vs_out.f4567 = f4567;
	vs_out.mc_case = mc_case;

	gl_Position = vec4(1);
}  