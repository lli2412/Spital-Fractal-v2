#ifdef GL_ES
precision mediump float;
#endif

uniform vec2 u_resolution;
uniform float u_time;
uniform float u_amp;
uniform float u_fft[128];

float hash(vec2 p){return fract(sin(dot(p,vec2(127.1,311.7)))*43758.5453123);}
float noise(vec2 p){
  vec2 i=floor(p);
  vec2 f=fract(p);
  vec2 u=f*f*(3.0-2.0*f);
  return mix(mix(hash(i+vec2(0,0)),hash(i+vec2(1,0)),u.x),
             mix(hash(i+vec2(0,1)),hash(i+vec2(1,1)),u.x),u.y);
}

void main(){
  vec2 uv = (gl_FragCoord.xy - 0.5*u_resolution.xy) / u_resolution.y;
  float t = u_time*0.2;
  float amp = u_amp*0.5;
  
  float n = noise(uv*3.0 + vec2(t*1.2, t*0.7));
  float flow = sin(n*6.28 + t*3.0) * amp;
  
  // спектр в центр
  float freq = 0.0;
  for(int i=0;i<128;i++){
    freq += u_fft[i]/255.0 * sin(float(i)*0.05+uv.x*3.14);
  }
  
  float intensity = smoothstep(0.3,0.0,length(uv)) * (freq+amp);
  
  vec3 col = vec3(0.4+0.6*sin(t+freq*3.0),
                  0.3+0.7*sin(t*1.3+amp*5.0),
                  0.5+0.5*sin(t*1.7+freq*2.0));
  
  col *= intensity*2.0;
  
  // свечение (bloom-like)
  col += vec3(0.05,0.08,0.1) * exp(-10.0*length(uv+flow*0.3));
  
  gl_FragColor = vec4(col,1.0);
}
