import json, math, sys, numpy as np
from PIL import Image
def build(outdir, limit=None):
    m=json.load(open(f'{outdir}/props/props.json'))
    blob=open(f'{outdir}/props/props.bin','rb').read()
    cache={}
    def mg(key):
        if key in cache: return cache[key]
        gl=[]
        for g in m['models'][key]['groups']:
            n=g['vertices']
            pos=np.frombuffer(blob,np.float32,count=n*3,offset=g['posOffset']).reshape(n,3).astype(np.float64)
            uv=np.frombuffer(blob,np.float32,count=n*2,offset=g['uvOffset']).reshape(n,2)
            tex=np.array(Image.open(f'{outdir}/props/'+g['tex']).convert('RGBA'))
            gl.append((pos,uv,tex,g['alpha']))
        cache[key]=gl; return gl
    out=[]
    for inst in m['instances'][:limit]:
        a=inst['rotY']; ca,sa=math.cos(a),math.sin(a)
        for pos,uv,tex,alpha in mg(inst['model']):
            x=pos[:,0]; y=pos[:,2]; z=pos[:,1]           # three local = (vx, vz, vy)
            X=x*ca+z*sa; Z=-x*sa+z*ca
            wp=np.stack([X+inst['x'],y+inst['y'],Z+inst['z']],1)
            out.append((wp,uv,tex,alpha))
    return out
def render(groups,out_png,eye,target,W=480,H=320,fov=72):
    fwd=(target-eye)/np.linalg.norm(target-eye); up=np.array([0,1.0,0]); right=np.cross(fwd,up); right/=np.linalg.norm(right); upv=np.cross(right,fwd)
    focal=(H/2)/math.tan(math.radians(fov)/2)
    color=np.zeros((H,W,3),np.uint8); depth=np.full((H,W),np.inf)
    for pos,uv,tex,alpha in groups:
        th,tw=tex.shape[0],tex.shape[1]
        rel=pos-eye; cz=rel@fwd; cx=rel@right; cy=rel@upv; ok=cz>0.05
        for i in range(0,len(pos)-2,3):
            if not(ok[i] and ok[i+1] and ok[i+2]): continue
            sx=W/2+focal*cx[i:i+3]/cz[i:i+3]; sy=H/2-focal*cy[i:i+3]/cz[i:i+3]
            x0=max(int(sx.min()),0); x1=min(int(sx.max())+1,W-1); y0=max(int(sy.min()),0); y1=min(int(sy.max())+1,H-1)
            if x1<x0 or y1<y0: continue
            den=(sy[1]-sy[2])*(sx[0]-sx[2])+(sx[2]-sx[1])*(sy[0]-sy[2])
            if abs(den)<1e-9: continue
            xs,ys=np.meshgrid(np.arange(x0,x1+1),np.arange(y0,y1+1))
            a=((sy[1]-sy[2])*(xs-sx[2])+(sx[2]-sx[1])*(ys-sy[2]))/den
            b=((sy[2]-sy[0])*(xs-sx[2])+(sx[0]-sx[2])*(ys-sy[2]))/den
            c=1-a-b; inside=(a>=-1e-3)&(b>=-1e-3)&(c>=-1e-3)
            if not inside.any(): continue
            z=1/(a/cz[i]+b/cz[i+1]+c/cz[i+2])
            u=a*uv[i,0]+b*uv[i+1,0]+c*uv[i+2,0]; v=a*uv[i,1]+b*uv[i+1,1]+c*uv[i+2,1]
            px=(u*tw).astype(int)%tw; py=(v*th).astype(int)%th
            texel=tex[py,px]; m=inside&(z<depth[ys,xs])
            if alpha: m&=texel[...,3]>127
            if not m.any(): continue
            depth[ys[m],xs[m]]=z[m]; color[ys[m],xs[m]]=texel[m][:,:3]
    Image.fromarray(color).save(out_png)
if __name__=='__main__':
    od=sys.argv[1]; png=sys.argv[2]; s=json.load(open(sys.argv[3]))
    g=build(od)
    render(g,png,np.array(s['ct'],float),np.array(s['look'],float))
    print('groups',len(g),'ok')
