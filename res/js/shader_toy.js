export const FRAGMENTSHADER = {
  raindrop: `
    // Heartfelt - by Martijn Steinrucken aka BigWings - 2017
    // Email:countfrolic@gmail.com Twitter:@The_ArtOfCode
    // License Creative Commons Attribution-NonCommercial-ShareAlike 3.0 Unported License.

    #define S(a, b, t) smoothstep(a, b, t)

    uniform float iTime;
    uniform vec3 iResolution;
    uniform sampler2D uTexture;

    vec3 N13(float p) {
      //  from DAVE HOSKINS
      vec3 p3 = fract(vec3(p) * vec3(.1031,.11369,.13787));
      p3 += dot(p3, p3.yzx + 19.19);
      return fract(vec3((p3.x + p3.y)*p3.z, (p3.x+p3.z)*p3.y, (p3.y+p3.z)*p3.x));
    }

    vec4 N14(float t) {
      return fract(sin(t*vec4(123., 1024., 1456., 264.))*vec4(6547., 345., 8799., 1564.));
    }
    float N(float t) {
        return fract(sin(t*12345.564)*7658.76);
    }

    float Saw(float b, float t) {
      return S(0., b, t)*S(1., b, t);
    }

    vec2 DropLayer2(vec2 uv, float t) {
      vec2 UV = uv;
      
      uv.y += t*0.75;
      vec2 a = vec2(6., 1.);
      vec2 grid = a*2.;
      vec2 id = floor(uv*grid);
      
      float colShift = N(id.x); 
      uv.y += colShift;
      
      id = floor(uv*grid);
      vec3 n = N13(id.x*35.2+id.y*2376.1);
      vec2 st = fract(uv*grid)-vec2(.5, 0);
      
      float x = n.x-.5;
      
      float y = UV.y*20.;
      float wiggle = sin(y+sin(y));
      x += wiggle*(.5-abs(x))*(n.z-.5);
      x *= .7;
      float ti = fract(t+n.z);
      y = (Saw(.85, ti)-.5)*.9+.5;
      vec2 p = vec2(x, y);
      
      float d = length((st-p)*a.yx);
      
      float mainDrop = S(.4, .0, d);
      
      float r = sqrt(S(1., y, st.y));
      float cd = abs(st.x-x);
      float trail = S(.23*r, .15*r*r, cd);
      float trailFront = S(-.02, .02, st.y-y);
      trail *= trailFront*r*r;
      
      y = UV.y;
      float trail2 = S(.2*r, .0, cd);
      float droplets = max(0., (sin(y*(1.-y)*120.)-st.y))*trail2*trailFront*n.z;
      y = fract(y*10.)+(st.y-.5);
      float dd = length(st-vec2(x, y));
      droplets = S(.3, 0., dd);
      float m = mainDrop+droplets*r*trailFront;
      
      return vec2(m, trail);
    }

    float StaticDrops(vec2 uv, float t) {
      uv *= 40.;

      vec2 id = floor(uv);
      uv = fract(uv)-.5;
      vec3 n = N13(id.x*107.45+id.y*3543.654);
      vec2 p = (n.xy-.5)*.7;
      float d = length(uv-p);
      
      float fade = Saw(.025, fract(t+n.z));
      float c = S(.3, 0., d)*fract(n.z*10.)*fade;
      return c;
    }

    vec2 Drops(vec2 uv, float t, float l0, float l1, float l2) {
      float s = StaticDrops(uv, t)*l0; 
      vec2 m1 = DropLayer2(uv, t)*l1;
      vec2 m2 = DropLayer2(uv*1.85, t)*l2;
      
      float c = s+m1.x+m2.x;
      c = S(.3, 1., c);
      
      return vec2(c, max(m1.y*l0, m2.y*l1));
    }

    void main() {
      vec2 uv = (gl_FragCoord.xy-.5*iResolution.xy) / iResolution.y;
      vec2 UV = gl_FragCoord.xy/iResolution.xy;
      float T = iTime;
      
      
      float t = T*.2;
      
      float rainAmount = sin(T*.05)*.3+.7;
      
      float maxBlur = mix(3., 6., rainAmount);
      float minBlur = 2.;
      
      float story = 0.;
      float heart = 0.;
      
      float staticDrops = S(-.5, 1., rainAmount)*2.;
      float layer1 = S(.25, .75, rainAmount);
      float layer2 = S(.0, .5, rainAmount);
      
      
      vec2 c = Drops(uv, t, staticDrops, layer1, layer2);
    
      vec2 e = vec2(.001, 0.);
      float cx = Drops(uv+e, t, staticDrops, layer1, layer2).x;
      float cy = Drops(uv+e.yx, t, staticDrops, layer1, layer2).x;
      vec2 n = vec2(cx-c.x, cy-c.x);		// expensive normals
      
      float focus = mix(maxBlur-c.y, minBlur, S(.1, .2, c.x));
      vec3 col = textureLod(uTexture, UV+n, focus).rgb;
      
      gl_FragColor = vec4(col, 1.);
    }`,
  star: `
    // Star Nest by Pablo Roman Andrioli
    // License: MIT

    #define iterations 16
    #define formuparam 0.53

    #define volsteps 14
    #define stepsize 0.05

    #define zoom   0.800
    #define tile   0.850
    #define speed  0.01

    #define brightness 0.0015
    #define darkmatter 0.300
    #define distfading 0.780
    #define saturation 0.800

    uniform float iTime;
    uniform vec3 iResolution;
    varying vec2 vUv;

    void main() {
      // get coords and direction
      // THREE 和 ShaderToy 坐标换算有差异，继续使用 gl_FragCoord
      vec2 uv = gl_FragCoord.xy/iResolution.xy-.5;
      // vec2 uv = vUv - .5;
      uv.y*=iResolution.y/iResolution.x;
      vec3 dir=vec3(uv*zoom,1.);
      float time=iTime*speed+.25;

      float a1=.5;
      float a2=.8;
      mat2 rot1=mat2(cos(a1),sin(a1),-sin(a1),cos(a1));
      mat2 rot2=mat2(cos(a2),sin(a2),-sin(a2),cos(a2));
      dir.xz*=rot1;
      dir.xy*=rot2;
      vec3 from=vec3(1.,.5,0.5);
      from+=vec3(time*2.,time,-2.);
      from.xz*=rot1;
      from.xy*=rot2;
      
      //volumetric rendering
      float s=0.1;
      vec3 v=vec3(0.);
      for (int r=0; r<volsteps; r++) {
        vec3 p=from+s*dir*.5;
        p = abs(vec3(tile)-mod(p,vec3(tile*2.))); // tiling fold
        float pa,a=pa=0.;
        for (int i=0; i<iterations; i++) { 
          p=abs(p)/dot(p,p)-formuparam; // the magic formula
          a+=abs(length(p)-pa); // absolute sum of average change
          pa=length(p);
        }
        float dm=max(0.,darkmatter-a*a*.001); //dark matter
        a*=a*a; // add contrast
        // float fade = 1.;
        float fade = pow(distfading,max(0.,float(r)));
        if (r>6) fade*=1.-dm; // dark matter, don't render near
        v+=fade;
        // 偏蓝绿光
        // v+=vec3(s*s*s*s,s*s,s*s)*a*brightness*fade; // coloring based on distance
        v+=vec3(16.*s*s*s*s, 4.*s*s, 2.*s)*a*brightness*fade; // coloring based on distance

        fade*=distfading; // distance fading
        s+=stepsize;
      }
      v=mix(vec3(length(v)),v,saturation); //color adjust
      gl_FragColor = vec4(v * .01, 1.);
    }`
}