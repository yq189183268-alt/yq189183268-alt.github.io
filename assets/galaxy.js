/* A procedural galaxy. No image assets, remote requests, or personal data collection. */
(() => {
  'use strict';
  const canvas = document.getElementById('galaxy');
  const preference = window.matchMedia('(prefers-reduced-motion: reduce)');
  let renderer;
  try {
    if (!window.THREE) return;
    renderer = new THREE.WebGLRenderer({canvas, alpha:true, antialias:false, powerPreference:'low-power'});
  } catch (_) { return; }

  let seed = 18918;
  const random = () => {seed = (seed * 16807) % 2147483647; return (seed - 1) / 2147483646;};
  const normal = () => Math.sqrt(-2 * Math.log(Math.max(random(), .00001))) * Math.cos(2 * Math.PI * random());
  const clamp = (x,a,b) => Math.max(a,Math.min(b,x));
  const lerp = (a,b,t) => a+(b-a)*t;
  const smooth = (a,b,x) => {const t=clamp((x-a)/(b-a),0,1);return t*t*(3-2*t);};
  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(48,innerWidth/innerHeight,.1,160);
  const galaxy = new THREE.Group();
  scene.add(galaxy);
  const mobile = innerWidth < 761;
  const count = mobile ? 38000 : 100000;
  const positions = new Float32Array(count*3);
  const colors = new Float32Array(count*3);
  const sizes = new Float32Array(count);
  const phases = new Float32Array(count);
  const inner = new THREE.Color('#ffc184');
  const middle = new THREE.Color('#b47baf');
  const outer = new THREE.Color('#6889eb');
  const edge = new THREE.Color('#456ac2');
  const color = new THREE.Color();

  for(let i=0;i<count;i++){
    const j=i*3;
    let radius,angle,spread,x,y,z;
    if(i<count*.19){
      radius=Math.pow(random(),1.15)*2.1;
      angle=random()*Math.PI*2;
      x=Math.cos(angle)*radius;
      z=Math.sin(angle)*radius;
      y=normal()*.12*Math.min(.9,radius+.09)*(1-radius/2.6);
    } else {
      radius=Math.pow(random(),.7)*7.3;
      angle=(i%5)/5*Math.PI*2 + radius*.82;
      spread=(.12+radius*.075)*(random()<.13?2.8:1);
      x=Math.cos(angle)*radius+normal()*spread;
      z=Math.sin(angle)*radius+normal()*spread;
      y=normal()*(.06+Math.exp(-radius*.6)*.18);
    }
    positions[j]=x; positions[j+1]=y; positions[j+2]=z;
    if(radius<1.8) color.copy(inner).lerp(middle,Math.pow(radius/1.8,.9)*.55);
    else if(radius<4.4) color.copy(middle).lerp(outer,(radius-1.8)/2.6);
    else color.copy(outer).lerp(edge,(radius-4.4)/3);
    const brightness=.52+random()*.7;
    colors[j]=color.r*brightness; colors[j+1]=color.g*brightness; colors[j+2]=color.b*brightness;
    sizes[i]=(.65+Math.pow(random(),4)*1.8)*(radius<.5?.9:1);
    phases[i]=random()*Math.PI*2;
  }

  const geometry=new THREE.BufferGeometry();
  geometry.setAttribute('position',new THREE.BufferAttribute(positions,3));
  geometry.setAttribute('color',new THREE.BufferAttribute(colors,3));
  geometry.setAttribute('aSize',new THREE.BufferAttribute(sizes,1));
  geometry.setAttribute('aPhase',new THREE.BufferAttribute(phases,1));
  const uniforms={uTime:{value:0},uPixelRatio:{value:1},uOpacity:{value:1}};
  const material=new THREE.ShaderMaterial({
    uniforms,transparent:true,depthWrite:false,blending:THREE.AdditiveBlending,vertexColors:true,
    vertexShader:`
      attribute float aSize; attribute float aPhase;
      uniform float uTime; uniform float uPixelRatio;
      varying vec3 vColor; varying float vShimmer;
      void main(){
        vec3 p=position;
        float radius=length(p.xz);
        float a=uTime*(.010+.012/(radius+.5));
        p.x=position.x*cos(a)-position.z*sin(a);
        p.z=position.x*sin(a)+position.z*cos(a);
        vec4 mv=modelViewMatrix*vec4(p,1.);
        gl_Position=projectionMatrix*mv;
        gl_PointSize=clamp(aSize*uPixelRatio*(18./-mv.z),.65,6.*uPixelRatio);
        vColor=color;
        vShimmer=.82+.18*sin(uTime*.7+aPhase);
      }`,
    fragmentShader:`
      uniform float uOpacity; varying vec3 vColor; varying float vShimmer;
      void main(){
        float d=length(gl_PointCoord-vec2(.5))*2.;
        if(d>1.) discard;
        float light=exp(-3.6*d*d);
        gl_FragColor=vec4(vColor*1.8,light*.76*vShimmer*uOpacity);
      }`
  });
  galaxy.add(new THREE.Points(geometry,material));

  function glowTexture(){
    const textureCanvas=document.createElement('canvas');textureCanvas.width=256;textureCanvas.height=256;
    const ctx=textureCanvas.getContext('2d');
    const gradient=ctx.createRadialGradient(128,128,0,128,128,128);
    gradient.addColorStop(0,'rgba(255,255,255,1)');
    gradient.addColorStop(.08,'rgba(255,255,255,.85)');
    gradient.addColorStop(.24,'rgba(255,255,255,.35)');
    gradient.addColorStop(.5,'rgba(255,255,255,.07)');
    gradient.addColorStop(1,'rgba(255,255,255,0)');
    ctx.fillStyle=gradient;ctx.fillRect(0,0,256,256);
    return new THREE.CanvasTexture(textureCanvas);
  }
  const texture=glowTexture();
  const glows=[];
  function addGlow(hex,scale,alpha){
    const sprite=new THREE.Sprite(new THREE.SpriteMaterial({map:texture,color:hex,transparent:true,opacity:alpha,blending:THREE.AdditiveBlending,depthWrite:false}));
    sprite.scale.set(scale,scale*.68,1);sprite.userData.baseOpacity=alpha;
    galaxy.add(sprite);glows.push(sprite);
  }
  addGlow('#9b6fc4',15,.34);
  addGlow('#f29383',8,.5);
  addGlow('#ffba76',4.2,.64);
  addGlow('#ffe8bb',1.4,.55);

  const starCount=mobile?450:1100;
  const starsPosition=new Float32Array(starCount*3);
  const starsColor=new Float32Array(starCount*3);
  for(let i=0;i<starCount;i++){
    starsPosition[i*3]=(random()-.5)*80;
    starsPosition[i*3+1]=(random()-.5)*65;
    starsPosition[i*3+2]=(random()-.5)*65-20;
    const warm=random()>.8;
    starsColor[i*3]=warm?.62:.29;
    starsColor[i*3+1]=warm?.48:.37;
    starsColor[i*3+2]=warm?.4:.62;
  }
  const starsGeometry=new THREE.BufferGeometry();
  starsGeometry.setAttribute('position',new THREE.BufferAttribute(starsPosition,3));
  starsGeometry.setAttribute('color',new THREE.BufferAttribute(starsColor,3));
  const stars=new THREE.Points(starsGeometry,new THREE.PointsMaterial({size:mobile?.026:.022,vertexColors:true,transparent:true,opacity:.75,depthWrite:false,blending:THREE.AdditiveBlending}));
  scene.add(stars);

  const pointer={x:0,y:0};
  const currentPointer={x:0,y:0};
  let scroll=0,targetScroll=0,paused=preference.matches,visible=!document.hidden;
  let frameId=0,last=0,time=0,needsFrame=true;
  const aboutSection=document.getElementById('about');
  const contactSection=document.getElementById('contact');
  function updateScroll(){targetScroll=window.scrollY;needsFrame=true;requestRender();}
  function render(timestamp){
    frameId=0;
    if(!visible)return;
    const dt=last?Math.min((timestamp-last)/1000,.05):.016;
    last=timestamp;
    if(!paused)time+=dt;
    scroll=paused?targetScroll:lerp(scroll,targetScroll,1-Math.exp(-dt*7));
    const home=document.body.dataset.page==='home';
    const aboutStart=aboutSection?.offsetTop||innerHeight;
    const contactStart=contactSection?.offsetTop||aboutStart+innerHeight;
    const first=home?smooth(0,aboutStart,scroll):.9;
    const second=home?smooth(aboutStart,contactStart,scroll):(document.body.dataset.page==='contact'?.8:.15);
    const isSmall=innerWidth<761;
    const baseDistance=isSmall?27:13.1;
    camera.position.set(lerp(0,2.3,first)-second*3.3,lerp(isSmall?16:8.1,3.5,first),lerp(baseDistance,7.5,first)-second*1.5);
    if(!paused){
      currentPointer.x=lerp(currentPointer.x,pointer.x,1-Math.exp(-dt*2));
      currentPointer.y=lerp(currentPointer.y,pointer.y,1-Math.exp(-dt*2));
      camera.position.x+=currentPointer.x*.3;
      camera.position.y+=currentPointer.y*.18;
    }
    camera.lookAt(0,lerp(isSmall?2.7:1.6,-.5,first),0);
    galaxy.rotation.z=first*.19-second*.24;
    galaxy.position.x=first*3.1-second*5.3;
    galaxy.position.y=first*.6;
    const opacity=1-first*.78+second*.08;
    uniforms.uTime.value=time;
    uniforms.uOpacity.value=opacity;
    for(const glow of glows)glow.material.opacity=glow.userData.baseOpacity*opacity;
    stars.rotation.y=time*.0007;
    renderer.render(scene,camera);
    needsFrame=Math.abs(scroll-targetScroll)>.5;
    if(!paused||needsFrame)requestRender();
  }
  function requestRender(){if(!frameId&&visible)frameId=requestAnimationFrame(render);}
  function resize(){
    const ratio=Math.min(devicePixelRatio||1,innerWidth<761?1.5:1.75);
    renderer.setPixelRatio(ratio);renderer.setSize(innerWidth,innerHeight,false);
    camera.aspect=innerWidth/innerHeight;camera.updateProjectionMatrix();
    uniforms.uPixelRatio.value=ratio;needsFrame=true;requestRender();
  }
  window.addEventListener('pointermove',event=>{pointer.x=event.clientX/innerWidth*2-1;pointer.y=event.clientY/innerHeight*2-1;},{passive:true});
  window.addEventListener('scroll',updateScroll,{passive:true});
  window.addEventListener('resize',resize,{passive:true});
  document.addEventListener('visibilitychange',()=>{visible=!document.hidden;last=0;if(visible)requestRender();else{cancelAnimationFrame(frameId);frameId=0;}});
  canvas.addEventListener('webglcontextlost',event=>{event.preventDefault();cancelAnimationFrame(frameId);frameId=0;visible=false;document.body.classList.remove('webgl-ready');});
  canvas.addEventListener('webglcontextrestored',()=>{visible=!document.hidden;document.body.classList.add('webgl-ready');last=0;requestRender();});
  window.claireGalaxy={setPaused(value){paused=value;needsFrame=true;last=0;requestRender();}};
  resize();updateScroll();
  document.body.classList.add('webgl-ready');
})();
