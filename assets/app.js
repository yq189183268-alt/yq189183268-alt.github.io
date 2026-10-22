(() => {
  'use strict';
  const reduced=window.matchMedia('(prefers-reduced-motion: reduce)');
  let paused=reduced.matches;
  let toastTimer;
  const motionButton=document.querySelector('.motion-toggle');
  const progress=document.querySelector('.scroll-progress>div');
  const toast=document.querySelector('.toast');

  function setMotion(value){
    paused=value;
    document.body.classList.toggle('is-paused',paused);
    motionButton.setAttribute('aria-pressed',String(paused));
    motionButton.setAttribute('aria-label',paused?'Play animation':'Pause animation');
    motionButton.title=paused?'Play animation':'Pause animation';
    if(window.claireGalaxy)window.claireGalaxy.setPaused(paused);
  }
  motionButton.addEventListener('click',()=>setMotion(!paused));
  reduced.addEventListener('change',()=>setMotion(reduced.matches));
  setMotion(paused);

  let scrollQueued=false;
  function updatePosition(){
    scrollQueued=false;
    const max=document.documentElement.scrollHeight-innerHeight;
    progress.style.transform=`scaleX(${max>0?Math.min(1,Math.max(0,scrollY/max)):0})`;
  }
  function queuePosition(){if(!scrollQueued){scrollQueued=true;requestAnimationFrame(updatePosition);}}
  window.addEventListener('scroll',queuePosition,{passive:true});
  window.addEventListener('resize',queuePosition,{passive:true});
  updatePosition();

  // Keep navigation native: direct section links work with or without JavaScript.
  document.querySelectorAll('a[href^="#"]').forEach(link=>{
    link.addEventListener('click',()=>{
      const section=document.getElementById(link.hash.slice(1));
      if(section&&section.matches('section')){
        section.setAttribute('tabindex','-1');
        section.addEventListener('blur',()=>section.removeAttribute('tabindex'),{once:true});
        // Focus without interrupting the browser's anchor scroll.
        requestAnimationFrame(()=>section.focus({preventScroll:true}));
      }
    });
  });

  const showToast=message=>{
    clearTimeout(toastTimer);toast.textContent=message;toast.classList.add('visible');
    toastTimer=setTimeout(()=>toast.classList.remove('visible'),3200);
  };
  document.querySelector('.copy-email')?.addEventListener('click',async()=>{
    const email='yq189183268@gmail.com';
    try{
      if(navigator.clipboard&&window.isSecureContext)await navigator.clipboard.writeText(email);
      else{
        const field=document.createElement('textarea');field.value=email;
        field.style.cssText='position:fixed;left:-9999px;top:0;opacity:0';
        document.body.appendChild(field);field.select();
        const copied=document.execCommand('copy');field.remove();
        if(!copied)throw new Error('Clipboard unavailable');
      }
      showToast('Email copied. Say hello!');
    }catch(_){showToast('Email: '+email);}
  });

  if(window.gsap&&!reduced.matches){
    gsap.from('.intro-reveal',{opacity:0,y:18,duration:1.3,stagger:.14,ease:'power3.out',delay:.12,clearProps:'all'});
    if('IntersectionObserver' in window){
      document.body.classList.add('motion-enabled');
      const observer=new IntersectionObserver(entries=>{
        entries.forEach(entry=>{
          if(!entry.isIntersecting)return;
          const nodes=entry.target.querySelectorAll('.reveal');
          gsap.to(nodes,{opacity:1,y:0,duration:1.1,stagger:.12,ease:'power3.out',clearProps:'transform',onComplete:()=>nodes.forEach(node=>node.classList.remove('reveal'))});
          observer.unobserve(entry.target);
        });
      },{threshold:.19});
      document.querySelectorAll('.about-content,.contact-content,.page-intro,.content-panel').forEach(node=>observer.observe(node));
    }
  }
  document.querySelector('.print-resume')?.addEventListener('click',()=>window.print());
  const menu=document.querySelector('.mobile-menu');
  menu?.querySelectorAll('a').forEach(link=>link.addEventListener('click',()=>{menu.open=false;}));
  document.addEventListener('keydown',event=>{
    if(event.key==='Escape'&&menu?.open){menu.open=false;menu.querySelector('summary').focus();}
  });
  document.addEventListener('click',event=>{if(menu?.open&&!menu.contains(event.target))menu.open=false;});
})();
