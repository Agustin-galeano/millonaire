import asyncio, json, statistics
from playwright.async_api import async_playwright
URL='file:///home/claude/millonaire/index.html'
LOOK="{skin:1,hair:'corto',hairc:0,hat:'galera',acc:'monoculo',outfit:'traje',col:'marino',det:'rojo'}"
async def with_state(b, js_state):
    ctx=await b.new_context(viewport={'width':390,'height':844},device_scale_factor=2,has_touch=True)
    await ctx.add_init_script("if(!sessionStorage.getItem('seeded')){sessionStorage.setItem('seeded','1');"+js_state+"}")
    pg=await ctx.new_page(); errs=[]
    pg.on('pageerror',lambda e:errs.append(str(e))); pg.on('console',lambda m:errs.append(m.text) if m.type=='error' else None)
    await pg.goto(URL); await pg.wait_for_timeout(800)
    return ctx,pg,errs
async def main():
    async with async_playwright() as p:
        b=await p.chromium.launch(); R={}
        # manipulación de saldo con la app cerrada
        ctx,pg,errs=await with_state(b,"localStorage.setItem('millonaire-v2',JSON.stringify({name:'Tramposo',wallet:999999999,vip:true,look:"+LOOK+",unlocks:{oro:true,diamantes:true,cadena:true},rooms:[{id:'salon',paid:0}],cur:0,pieces:[],uid:1,listings:[],welcomed:true}));")
        R['tamper']={'sub':await pg.evaluate("document.getElementById('sub').innerText"),'errs':errs}
        await pg.click('#bVault'); await pg.wait_for_timeout(200)
        R['tamper']['vault']=(await pg.locator('#dlgBody').inner_text())[:160]
        await ctx.close()
        # estado incompleto / corrupto
        for name,st in {'missing_fields':"{wallet:5}",'bad_json':"'{nope'"}.items():
            js=f"localStorage.setItem('millonaire-v2',{st if name=='bad_json' else 'JSON.stringify('+st+')'});"
            ctx,pg,errs=await with_state(b,js)
            R['corrupt_'+name]=errs[:2]
            await pg.screenshot(path=f'corrupt_{name}.png'); await ctx.close()
        # rendimiento con Palacio lleno
        js="""const types=['sillon','mesa','esmeralda','amatista','oro','piano','lampara','trono','estatua','cofre'];const pcs=[];let u=1;for(let i=0;i<12;i++)for(let j=0;j<12;j++){if(i===6&&j===6)continue;if(pcs.length>=140)break;pcs.push({u:u++,t:types[(i*3+j)%types.length],paid:100,r:1,i,j,s:0,seed:u});}
localStorage.setItem('millonaire-v2',JSON.stringify({name:'Perf',wallet:1,vip:true,look:"""+LOOK+""",unlocks:{},rooms:[{id:'salon',paid:0},{id:'palacio',paid:4999.99}],cur:1,pieces:pcs,uid:u,listings:[],welcomed:true}));"""
        ctx,pg,errs=await with_state(b,js)
        await pg.screenshot(path='palacio_full.png')
        res={}
        cdp=await ctx.new_cdp_session(pg)
        for rate in (1,4,6):
            await cdp.send('Emulation.setCPUThrottlingRate',{'rate':rate})
            await pg.wait_for_timeout(500)
            # mide cuánto tarda cada render (el bucle va a 24 fps)
            ft=await pg.evaluate("""()=>new Promise(r=>{const ts=[];let last=performance.now();function f(t){ts.push(t-last);last=t;if(ts.length<90)requestAnimationFrame(f);else r(ts)}requestAnimationFrame(f)})""")
            res[f'x{rate}']={'median_raf_ms':round(statistics.median(ft),1),'p95':round(sorted(ft)[int(len(ft)*.95)],1)}
        # tiempo de un render puro (llamando al loop indirectamente: medimos tareas largas)
        lt=await pg.evaluate("""()=>new Promise(r=>{const out=[];const po=new PerformanceObserver(l=>{for(const e of l.getEntries())out.push(e.duration)});po.observe({type:'longtask',buffered:false});setTimeout(()=>{po.disconnect();r(out)},3000)})""")
        res['longtasks_3s_x6']={'count':len(lt),'max_ms':round(max(lt),1) if lt else 0}
        res['errs']=errs
        res['state_bytes']=len(await pg.evaluate("localStorage.getItem('millonaire-v2')"))
        R['perf_palacio_140']=res
        await ctx.close()
        print(json.dumps(R,indent=1))
        await b.close()
asyncio.run(main())
