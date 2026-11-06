import asyncio, json
from playwright.async_api import async_playwright
URL='file:///home/claude/millonaire/index.html'
async def fresh(b, w,h, dsf=2, touch=True):
    pg=await b.new_page(viewport={'width':w,'height':h},device_scale_factor=dsf,has_touch=touch)
    errs=[]; pg.on('pageerror',lambda e:errs.append(str(e))); pg.on('console',lambda m:errs.append(m.text) if m.type=='error' else None)
    await pg.goto(URL); await pg.wait_for_timeout(500)
    return pg,errs
async def main():
    async with async_playwright() as p:
        b=await p.chromium.launch()
        R={}
        # 1) tamaños de pantalla
        for name,(w,h) in {'phone_small':(360,640),'phone':(390,844),'tablet':(820,1180),'tablet_land':(1180,820),'desktop':(1440,900),'phone_land':(844,390)}.items():
            pg,errs=await fresh(b,w,h)
            await pg.click('#wGo'); await pg.wait_for_timeout(400)
            await pg.screenshot(path=f'size_{name}.png')
            box=await pg.locator('#room').bounding_box()
            R['size_'+name]={'canvas':box,'errs':errs}
            await pg.close()
        # 2) exploit: comprar y revender a bots
        pg,errs=await fresh(b,390,844)
        await pg.click('#wGo')
        start=json.loads(await pg.evaluate("localStorage.getItem('millonaire-v2')"))['wallet']
        # simulate: buy diamond, list at +10%, force ticks via clock
        await pg.evaluate("""()=>{}""")
        await pg.click('#bShop'); await pg.click('#catTabs .tab[data-cat=gema]'); await pg.locator('.card').nth(3).click()
        for k in range(5): await pg.click('#buyBtn'); await pg.wait_for_timeout(50)
        await pg.click('#sheet .x')
        for k in range(5):
            await pg.click('#bVault'); await pg.locator('details summary').first.click(); await pg.locator('details[open] [data-sell]').first.click(); await pg.click('#sellGo'); await pg.click('#dlg .x')
        mid=json.loads(await pg.evaluate("localStorage.getItem('millonaire-v2')"))['wallet']
        await pg.wait_for_timeout(15000*4+500)
        st=json.loads(await pg.evaluate("localStorage.getItem('millonaire-v2')"))
        wd=json.loads(await pg.evaluate("localStorage.getItem('millonaire-world-v2')"))
        mine=[l for l in wd['listings'] if l['seller']=='me']
        R['exploit']={'wallet_start':start,'after_buy':mid,'after_60s':st['wallet'],'listings_left':len(mine),'errs':errs}
        # 3) ediciones duplicadas del diamante rosa
        eds=[]
        for l in wd['listings']:
            if l['piece']['t']=='rosa': eds.append(('bot' if l['seller']!='me' else 'me', l['piece'].get('ed')))
        R['rosa_listings']=eds; R['minted']=wd['minted']
        # 4) manipular saldo desde el cliente
        await pg.evaluate("""()=>{const s=JSON.parse(localStorage.getItem('millonaire-v2'));s.wallet=999999999;s.vip=true;localStorage.setItem('millonaire-v2',JSON.stringify(s));}""")
        await pg.reload(); await pg.wait_for_timeout(500)
        R['tamper']=await pg.evaluate("document.getElementById('sub').innerText")
        await pg.close()
        # 5) datos corruptos
        pg,errs=await fresh(b,390,844)
        await pg.evaluate("()=>{localStorage.setItem('millonaire-v2','{\"wallet\":5}');}")
        await pg.reload(); await pg.wait_for_timeout(600)
        R['corrupt_state']=errs[:3]
        await pg.close()
        # 6) rendimiento: Palacio lleno
        pg,errs=await fresh(b,390,844)
        await pg.evaluate("""()=>{const s=JSON.parse(localStorage.getItem('millonaire-v2'));}""")
        await pg.evaluate("""()=>{const types=['sillon','mesa','esmeralda','amatista','oro','piano','lampara','trono','estatua','cofre'];const pcs=[];let u=1;for(let i=0;i<12;i++)for(let j=0;j<12;j++){if(i===6&&j===6)continue;if(pcs.length>=140)break;pcs.push({u:u++,t:types[(i*3+j)%types.length],paid:100,r:1,i,j,s:0,seed:u});}
          const s={name:'Perf',wallet:1,vip:true,look:{skin:1,hair:'corto',hairc:0,hat:'galera',acc:'monoculo',outfit:'traje',col:'marino',det:'rojo'},unlocks:{},rooms:[{id:'salon',paid:0},{id:'palacio',paid:4999.99}],cur:1,pieces:pcs,uid:u,listings:[],welcomed:true};localStorage.setItem('millonaire-v2',JSON.stringify(s));}""")
        await pg.reload(); await pg.wait_for_timeout(1000)
        cdp=await pg.context.new_cdp_session(pg)
        await cdp.send('Emulation.setCPUThrottlingRate',{'rate':6})
        ft=await pg.evaluate("""()=>new Promise(r=>{const ts=[];let last=performance.now();function f(t){ts.push(t-last);last=t;if(ts.length<120)requestAnimationFrame(f);else r(ts)}requestAnimationFrame(f)})""")
        prof=await pg.evaluate("""()=>{const t0=performance.now();return 0}""")
        pcs=len(json.loads(await pg.evaluate("localStorage.getItem('millonaire-v2')"))['pieces'])
        ls=len(await pg.evaluate("localStorage.getItem('millonaire-v2')"))
        import statistics
        R['perf_palacio']={'pieces':pcs,'median_frame_ms_6x_throttle':statistics.median(ft),'p95':sorted(ft)[int(len(ft)*.95)],'state_bytes':ls}
        await pg.screenshot(path='palacio_full.png')
        await pg.close()
        print(json.dumps(R,indent=1,default=str))
        await b.close()
asyncio.run(main())
