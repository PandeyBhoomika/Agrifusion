import { useRouter } from "expo-router";
import { Platform, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { WebView } from "react-native-webview";

export default function Game() {
    const router = useRouter();

    const html = `<!doctype html>
<html>
<head>
  <meta name="viewport" content="width=device-width,initial-scale=1"/>
  <script src="https://cdn.jsdelivr.net/npm/phaser@3/dist/phaser.min.js"></script>
  <style>
    html,body{height:100%;margin:0;padding:0;background:#87CEEB;overflow:hidden}
    #game{width:100%;height:100%}
    #errorBox{
      position:absolute;left:12px;right:12px;top:12px;
      background:rgba(200,50,50,0.95);color:#fff;padding:12px;border-radius:8px;
      font-family:Arial,Helvetica,sans-serif;font-size:13px;z-index:9999;display:none;
      white-space:pre-wrap;max-height:60vh;overflow:auto;
    }
    #audioToggle {
      position:absolute;right:12px;top:12px;z-index:9998;background:rgba(255,255,255,0.85);
      border-radius:20px;padding:6px 10px;font-size:18px;font-family:Arial,Helvetica,sans-serif;
      cursor:pointer; user-select:none;
    }
  </style>
</head>
<body>
  <div id="game"></div>
  <div id="errorBox"></div>
  <div id="audioToggle">🔊</div>

  <script>
    // forward logs & errors to React Native
    (function(){
      const oldLog = console.log;
      console.log = function(...args){
        try{ window.ReactNativeWebView?.postMessage(JSON.stringify({type:'log',payload:args})) }catch(e){}
        oldLog.apply(console,args);
      };
      window.onerror = (msg,src,line,col,err)=>{
        const text = "window.onerror: "+msg+"\\n"+(err?.stack || ("at "+src+":"+line+":"+col));
        window.ReactNativeWebView?.postMessage(JSON.stringify({type:'error',payload:text}));
        showError(text);
        return false;
      };
      window.onunhandledrejection = ev=>{
        const text = "UnhandledRejection: "+(ev.reason?.stack || String(ev.reason));
        window.ReactNativeWebView?.postMessage(JSON.stringify({type:'reject',payload:text}));
        showError(text);
      };
    })();

    function showError(txt){
      const box = document.getElementById('errorBox');
      box.style.display='block';
      box.textContent = txt;
    }

    (function(){
      try{
        // ---------------- AUDIO ENGINE ----------------
        let audioEnabled = true;
        let audioCtx = null;

        function initAudio(){
          if (audioCtx) return;
          audioCtx = new (window.AudioContext||window.webkitAudioContext)();

          // ambient pad (same as before)
          const ambientGain = audioCtx.createGain();
          ambientGain.gain.value = 0.02;
          const lp = audioCtx.createBiquadFilter();
          lp.type = "lowpass"; lp.frequency.value = 900;
          ambientGain.connect(lp); lp.connect(audioCtx.destination);

          [80,120,160].forEach((f,i)=>{
            const o = audioCtx.createOscillator();
            o.type = (i===0?"sine":"triangle");
            o.frequency.value = f + (Math.random()*4-2);
            const g = audioCtx.createGain();
            g.gain.value = 0.006 + Math.random()*0.01;
            o.connect(g); g.connect(ambientGain);
            o.start();
          });

          scheduleChirp();
        }

        let chirpTimeout=null;
        function scheduleChirp(){
          if (!audioCtx) return;
          clearTimeout(chirpTimeout);
          chirpTimeout = setTimeout(()=>{ playChirp(); scheduleChirp(); }, 3000+Math.random()*8000);
        }
        function playChirp(){
          if (!audioCtx || !audioEnabled) return;
          const t0 = audioCtx.currentTime;
          const o = audioCtx.createOscillator();
          const g = audioCtx.createGain();
          o.type="sine"; o.frequency.value = 700+Math.random()*300;
          g.gain.value=0.0001;
          o.connect(g); g.connect(audioCtx.destination);
          g.gain.exponentialRampToValueAtTime(0.018, t0+0.03);
          g.gain.exponentialRampToValueAtTime(0.0001, t0+0.45);
          o.start(t0); o.stop(t0+0.5);
        }

        // ---------------- NEW SPRAY SOUND ----------------
        function playSpraySound(){
          if (!audioEnabled) return;
          try{
            initAudio();
            if (!audioCtx) return;

            const t = audioCtx.currentTime;

            // noise source
            const bufferSize = audioCtx.sampleRate * 0.12;
            const noiseBuffer = audioCtx.createBuffer(1, bufferSize, audioCtx.sampleRate);
            const data = noiseBuffer.getChannelData(0);
            for (let i=0; i<bufferSize; i++){
              data[i] = (Math.random()*2 - 1) * 0.35;
            }

            const noise = audioCtx.createBufferSource();
            noise.buffer = noiseBuffer;

            // bandpass for aerosol "pshhh"
            const band = audioCtx.createBiquadFilter();
            band.type = "bandpass";
            band.frequency.value = 1400;   // sharper hiss
            band.Q.value = 5;

            // fast envelope
            const g = audioCtx.createGain();
            g.gain.setValueAtTime(0.0001, t);
            g.gain.exponentialRampToValueAtTime(0.05, t+0.03);
            g.gain.exponentialRampToValueAtTime(0.0001, t+0.25);

            noise.connect(band);
            band.connect(g);
            g.connect(audioCtx.destination);

            noise.start(t);
            noise.stop(t+0.3);
          }catch(e){}
        }

        // ----------- MISSION COMPLETE DING (unchanged) -----------
        function playWinDing(){
          if (!audioEnabled) return;
          try{
            initAudio();
            const now = audioCtx.currentTime;

            function tone(freq, start, dur){
              const o = audioCtx.createOscillator();
              const g = audioCtx.createGain();
              o.type="sine";
              o.frequency.setValueAtTime(freq, now+start);
              g.gain.value=0.0001;
              o.connect(g); g.connect(audioCtx.destination);
              g.gain.exponentialRampToValueAtTime(0.06, now+start+0.02);
              g.gain.exponentialRampToValueAtTime(0.0001, now+start+dur);
              o.start(now+start); o.stop(now+start+dur+0.02);
            }

            tone(660,0,0.35);
            tone(880,0.12,0.35);
          }catch(e){}
        }

        // toggle button
        const audioToggleEl = document.getElementById("audioToggle");
        audioToggleEl.onclick = ()=>{
          audioEnabled=!audioEnabled;
          audioToggleEl.textContent = audioEnabled?"🔊":"🔇";
          if (audioEnabled) { initAudio(); audioCtx.resume(); }
          else audioCtx && audioCtx.suspend();
        };

        // enable audio after user gesture
        window.addEventListener("pointerdown",()=>{ initAudio(); audioCtx?.resume(); },{once:true});

        // ---------------- PHASER GAME (unchanged) ----------------
        let cured=0, timeLeft=40;

        const config = {
          type: Phaser.AUTO,
          width: window.innerWidth,
          height: window.innerHeight,
          backgroundColor: "#87CEEB",
          parent:"game",
          scene:{ preload, create, update }
        };

        function preload(){}

        function create(){
          const w=this.scale.width, h=this.scale.height;

          // --- SKY --- (unchanged)
          drawCloud(this,w*0.2,h*0.18,1.0);
          drawCloud(this,w*0.45,h*0.14,1.15);
          drawCloud(this,w*0.72,h*0.2,0.95);

          // sun (unchanged)
          const sunC = this.add.container(w*0.88, h*0.16);
          const gSun=this.add.graphics();
          gSun.fillStyle(0xFFD447,1); gSun.fillCircle(0,0,28);
          sunC.add(gSun);
          for(let i=0;i<8;i++){
            const r=this.add.graphics();
            r.fillStyle(0xFFD877,0.85);
            r.fillRect(36,-4,10,8);
            r.rotation=0.25*i;
            sunC.add(r);
          }
          this.tweens.add({targets:sunC,angle:8,duration:8000,yoyo:true,repeat:-1});

          // birds
          const bird1=drawBird(this,w*0.43,h*0.22);
          const bird2=drawBird(this,w*0.53,h*0.24);
          this.tweens.add({targets:[bird1,bird2],y:"-=6",duration:900,yoyo:true,repeat:-1});

          // sky particles
          const skyParticles=[];
          for(let i=0;i<14;i++){
            const px=Math.random()*w, py=Math.random()*h*0.45;
            const s=this.add.circle(px,py,3+Math.random()*3,0xFFFFFF,0.6);
            s.speed=0.1+Math.random()*0.25;
            skyParticles.push(s);
          }

          // hills & trees
          drawHills(this,w,h);

          // ground
          this.add.rectangle(w/2,h*0.82,w,h*0.36,0x8B5A2B);
          this.add.rectangle(w/2,h*0.70,w,48,0x3FA34D);

          // HUD
          const curedText=this.add.text(16,16,"Cured: 0 / 4",{font:"20px Arial",fill:"#fff"});
          const timerText=this.add.text(w-16,16,timeLeft+"s",{font:"20px Arial",fill:"#fff"}).setOrigin(1,0);

          // mission box
          const mission=this.add.container(w/2,80);
          const mbg=this.add.graphics();
          mbg.fillStyle(0xF7D8A9,1);
          mbg.fillRoundedRect(-160,-32,320,64,12);
          mbg.lineStyle(3,0xB8860B,1);
          mbg.strokeRoundedRect(-160,-32,320,64,12);
          mission.add(mbg);
          mission.add(this.add.text(0,-6,"Today's Mission",{font:"18px Arial",fill:"#000",fontStyle:"bold"}).setOrigin(0.5));
          mission.add(this.add.text(0,16,"Apply Neem Oil to Pest Plants",{font:"14px Arial",fill:"#222"}).setOrigin(0.5));

          // plant positions (unchanged)
          const positions=[
            {x:w*0.16,y:h*0.70-20},
            {x:w*0.36,y:h*0.70-38},
            {x:w*0.58,y:h*0.70-20},
            {x:w*0.78,y:h*0.70-38}
          ];

          const pestPlants=[], healthyPlants=[];
          positions.forEach((pos,idx)=>{
            const p=createPestPlant(this,pos.x,pos.y,1.05);
            pestPlants.push(p);

            const hP=createHealthyPlant(this,pos.x,pos.y,1.05);
            hP.setVisible(false);
            healthyPlants.push(hP);

            // idle sway
            this.tweens.add({
              targets:p, angle:{from:-2,to:2},
              duration:1400+idx*120, yoyo:true, repeat:-1, ease:"Sine.easeInOut"
            });

            const bug=p.getByName("bug");
            if(bug){
              this.tweens.add({
                targets:bug, x:"+=6",
                duration:900+idx*100, yoyo:true, repeat:-1, ease:"Sine.easeInOut"
              });
            }
          });

          // spray emoji
          const sprayStartX=w*0.18, sprayStartY=h*0.78;
          const sprayEmoji=this.add.text(sprayStartX,sprayStartY,"🧴",{font:"56px serif"})
            .setInteractive({draggable:true});
          this.input.setDraggable(sprayEmoji);

          // spray trail
          function emitSpray(x,y){
            const p=this.add.circle(x,y,4,0xD7F3FF,0.95);
            this.tweens.add({
              targets:p, y:y-18-Math.random()*12, alpha:0, scale:{from:1,to:0.4},
              duration:550, onComplete:()=>p.destroy()
            });
          }

          let lastTrail=0;
          this.input.on("drag",(pointer,obj,dx,dy)=>{
            obj.x=dx; obj.y=dy;
            const now=Date.now();
            if(now-lastTrail>80){
              emitSpray.call(this,obj.x-6,obj.y+6);
              lastTrail=now;

              // PLAY NEW SPRAY SOUND
              playSpraySound();
            }
            audioCtx?.resume();
          });

          // spray interaction
          sprayEmoji.on("dragend",()=>{
            const hitR=92;
            for(let i=0;i<pestPlants.length;i++){
              const p=pestPlants[i];
              if(p.isCured) continue;
              const dx=sprayEmoji.x-p.x, dy=sprayEmoji.y-p.y;
              const d=Math.sqrt(dx*dx+dy*dy);
              if(d<hitR){
                p.isCured=true;
                p.getByName("bug")?.setVisible(false);
                healthyPlants[i].setVisible(true);
                cured++;
                curedText.setText("Cured: "+cured+" / 4");

                const sp=createSparkle(this,p.x,p.y-36,0.45);
                this.tweens.add({targets:sp,alpha:0,scale:{from:1,to:0.25},duration:600,onComplete:()=>sp.destroy()});
                spawnConfetti(this,p.x,p.y-20,12);

                if(cured===pestPlants.length){
                  playWinDing();   // 🔔 play win chime
                  showPopup(this,true);
                }
                break;
              }
            }
            sprayEmoji.x=sprayStartX;
            sprayEmoji.y=sprayStartY;
          });

          // countdown
          this.time.addEvent({
            delay:1000, loop:true,
            callback:()=>{
              if(timeLeft<=0) return;
              timeLeft--;
              timerText.setText(timeLeft+"s");
              if(timeLeft===0 && cured<pestPlants.length) showPopup(this,false);
            }
          });

          // sky particles move
          this.sys.events.on("update",()=>{
            skyParticles.forEach(p=>{
              p.y+=p.speed;
              if(p.y>h*0.55) p.y=Math.random()*h*0.25;
            });
          });

          initAudio();
        }

        function update(){}

        // --------- helpers (unchanged) ---------
        function drawCloud(scene,x,y,s=1){
          const g=scene.add.graphics();
          g.fillStyle(0xFFFFFF,1);
          g.fillEllipse(x-30*s,y,50*s,28*s);
          g.fillEllipse(x,y-6*s,70*s,32*s);
          g.fillEllipse(x+40*s,y,50*s,28*s);
        }

        function drawBird(scene,x,y){
          const c=scene.add.container(x,y);
          const g=scene.add.graphics();
          g.fillStyle(0x4DA6FF,1);
          g.fillTriangle(-8,0,0,-8,6,0);
          g.fillTriangle(8,0,16,-6,24,0);
          c.add(g);
          return c;
        }

        function drawHills(scene,w,h){
          const g=scene.add.graphics();
          g.fillStyle(0xC6F3D0,1);
          g.fillEllipse(w*0.25,h*0.62,420,220);
          g.fillStyle(0x9FE0A0,1);
          g.fillEllipse(w*0.65,h*0.64,480,260);

          for(let i=0;i<6;i++){
            const tx=(i/5)*w*0.9 + w*0.05;
            const ty=h*0.66;
            const t1=scene.add.graphics();
            t1.fillStyle(0x3CB371,1);
            t1.fillCircle(tx,ty-8,28);
            t1.fillCircle(tx+22,ty,24);
            t1.fillStyle(0x8B4513,1);
            t1.fillRect(tx-6,ty,12,26);
            scene.tweens.add({targets:t1,y:"+=2",duration:2500+i*200,yoyo:true,repeat:-1,ease:"Sine.easeInOut"});
          }
        }

        function createPestPlant(scene,x,y,s=1){
          const c=scene.add.container(x,y);
          const stem=scene.add.rectangle(0,20,10*s,70*s,0x8B5A2B).setOrigin(0.5,1); stem.angle=-6;
          const L=scene.add.ellipse(-22*s,-6*s,46*s,28*s,0x6AA84F).setStrokeStyle(3,0x355E2C).setAlpha(0.98);
          const R=scene.add.ellipse(22*s,-6*s,46*s,28*s,0x6AA84F).setStrokeStyle(3,0x355E2C).setAlpha(0.98);
          L.rotation=Phaser.Math.DegToRad(-6);
          R.rotation=Phaser.Math.DegToRad(6);
          const hiL=scene.add.graphics(); hiL.fillStyle(0xFFFFFF,0.18); hiL.fillEllipse(-18*s,-14*s,22*s,10*s);
          const hiR=scene.add.graphics(); hiR.fillStyle(0xFFFFFF,0.18); hiR.fillEllipse(18*s,-14*s,22*s,10*s);
          const bug=scene.add.circle(0,-30*s,10*s,0x0B0B0B).setName("bug");
          c.add([stem,L,R,hiL,hiR,bug]); c.isCured=false;
          return c;
        }

        function createHealthyPlant(scene,x,y,s=1){
          const c=scene.add.container(x,y);
          const stem=scene.add.rectangle(0,20,10*s,70*s,0x3C7D32).setOrigin(0.5,1); stem.angle=-4;
          const leaves=[
            {x:0,y:-10,w:52,h:30,rot:0},
            {x:-28,y:-2,w:44,h:26,rot:-6},
            {x:28,y:-2,w:44,h:26,rot:6},
            {x:-20,y:-28,w:38,h:22,rot:-4},
            {x:20,y:-28,w:38,h:22,rot:4},
          ];
          leaves.forEach(p=>{
            const shadow=scene.add.ellipse(p.x*s+4*s,p.y*s+6*s,p.w*s,p.h*s,0x123412,0.06);
            const leaf=scene.add.ellipse(p.x*s,p.y*s,p.w*s,p.h*s,0x34C759).setStrokeStyle(3,0x2E8B57);
            leaf.rotation=Phaser.Math.DegToRad(p.rot);
            const hi=scene.add.graphics(); hi.fillStyle(0xFFFFFF,0.18); hi.fillEllipse(p.x*s,(p.y-10)*s,(p.w*0.45)*s,(p.h*0.35)*s);
            c.add([shadow,leaf,hi]);
          });
          return c;
        }

        function createSparkle(scene,x,y,s=0.6){
          const c=scene.add.container(x,y);
          const g=scene.add.graphics();
          g.fillStyle(0xFFD700,1);
          g.fillRect(-4*s,-1*s,8*s,2*s);
          g.fillRect(-1*s,-4*s,2*s,8*s);
          c.add(g);
          return c;
        }

        function spawnConfetti(scene,x,y,n=10){
          for(let i=0;i<n;i++){
            const rx=x+(Math.random()*40-20);
            const ry=y+(Math.random()*10-10);
            const c=scene.add.rectangle(rx,ry,6,8,Phaser.Display.Color.RandomRGB().color);
            const vx=(Math.random()*160-80);
            const vy=-120-Math.random()*80;
            scene.tweens.add({
              targets:c,
              x:c.x+vx,
              y:c.y+vy+250,
              angle:Math.random()*360,
              duration:1100+Math.random()*600,
              ease:"Cubic.easeOut",
              onComplete:()=>c.destroy()
            });
          }
        }

        function showPopup(scene,success){
          const w=scene.scale.width, h=scene.scale.height;
          scene.__popup?.destroy(true);
          const c=scene.add.container(w/2,h/2);
          const g=scene.add.graphics();
          g.fillStyle(0x122523,0.92);
          g.fillRoundedRect(-160,-60,320,120,12);
          const text=(success?"Mission Complete! 🎉\\nCured ":"Time's Up!\\nCured ")+cured+" / 4";
          const t=scene.add.text(0,0,text,{font:"20px Arial",fill:"#fff",align:"center"}).setOrigin(0.5);
          c.add([g,t]);
          scene.__popup=c;
        }

        // RUN GAME
        new Phaser.Game(config);
        console.log("Phaser started OK with new spray sound");

      }catch(e){
        showError("Init error:\\n"+(e.stack||e));
      }
    })();
  </script>
</body>
</html>
`;

    function onMessage(e) {
        try {
            const msg = JSON.parse(e.nativeEvent.data);
            console.log("[WebView msg]", msg);
        } catch (err) {
            console.log("[WebView raw]", e.nativeEvent.data);
        }
    }

    return (
        <View style={{ flex: 1 }}>
            <View style={styles.header}>
                <TouchableOpacity onPress={() => router.back()}>
                    <Text style={styles.back}>◀ Back</Text>
                </TouchableOpacity>
                <Text style={styles.title}>Farm Day</Text>
                <View style={{ width: 40 }} />
            </View>

            {/* --- PLATFORM SWITCH --- */}
            {Platform.OS === "web" ? (
                <iframe
                    srcDoc={html}
                    style={{ width: "100%", height: "100%", border: "none" }}
                    sandbox="allow-scripts allow-same-origin"
                />
            ) : (
                <WebView
                    originWhitelist={["*"]}
                    source={{ html }}
                    javaScriptEnabled
                    domStorageEnabled
                    onMessage={onMessage}
                    style={{ flex: 1 }}
                />
            )}
        </View>
    );
}

const styles = StyleSheet.create({
    header: {
        height: 60, backgroundColor: "#222",
        flexDirection: "row", alignItems: "center",
        justifyContent: "space-between", paddingHorizontal: 12
    },
    title: { color: "#fff", fontSize: 18 },
    back: { color: "#fff", fontSize: 16 }
});
