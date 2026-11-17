import struct
LUMPS=['entities','planes','textures','vertices','visibility','nodes','texinfo','faces','lighting','clipnodes','leaves','marksurfaces','edges','surfedges','models']
def read(path):
    b=open(path,'rb').read()
    ver=struct.unpack_from('<i',b,0)[0]
    lumps={}
    for i,n in enumerate(LUMPS):
        off,ln=struct.unpack_from('<ii',b,4+i*8)
        lumps[n]=b[off:off+ln]
    return ver,lumps
def entities(lumps):
    txt=lumps['entities'].decode('latin1','ignore')
    ents=[];cur=None
    for line in txt.splitlines():
        line=line.strip()
        if line=='{':cur={}
        elif line=='}':ents.append(cur);cur=None
        elif cur is not None and line.startswith('"'):
            parts=line.split('"')
            if len(parts)>=4:cur[parts[1]]=parts[3]
    return ents
def planes(lumps):
    d=lumps['planes'];n=len(d)//20
    return [struct.unpack_from('<4f',d,i*20) for i in range(n)]
def clipnodes(lumps):
    d=lumps['clipnodes'];n=len(d)//8
    return [struct.unpack_from('<hhh',d,i*8)[0:3] for i in range(n)]  # planenum, c0, c1 (as <h>) -- planenum is int32 really
def clipnodes2(lumps):
    d=lumps['clipnodes'];n=len(d)//8
    out=[]
    for i in range(n):
        pn,c0,c1=struct.unpack_from('<ihh',d,i*8)
        out.append((pn,c0,c1))
    return out
def models(lumps):
    d=lumps['models'];n=len(d)//64;out=[]
    for i in range(n):
        v=struct.unpack_from('<9f4i3i',d,i*64)
        out.append({'mins':v[0:3],'maxs':v[3:6],'origin':v[6:9],'head':v[9:13]})
    return out
