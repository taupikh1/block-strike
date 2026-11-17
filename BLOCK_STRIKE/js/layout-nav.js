/* Walkable ground grid for the simplified ES layout only.
 * The original BSP A* graph and its recovery logic remain in nav-graph.js. */
const LayoutNav=(()=>{
 let limit=0,width=0,free=null;
 const index=(x,z)=>(z+limit)*width+x+limit;
 function reset(){limit=0;free=null}
 function build(){
  limit=Math.floor(worldLim());width=limit*2+1;free=new Uint8Array(width*width);
  const walls=obs.filter(o=>o.y1<1.7&&o.y2>.35);
  for(let z=-limit;z<=limit;z++)for(let x=-limit;x<=limit;x++)if(!walls.some(o=>x>o.x1-.44&&x<o.x2+.44&&z>o.z1-.44&&z<o.z2+.44))free[index(x,z)]=1;
 }
 function nearest(p){
  if(!free)build();const x=Math.round(p.x),z=Math.round(p.z);
  for(let r=0;r<width;r++){let best=-1,dist=Infinity;
   for(let dz=-r;dz<=r;dz++)for(let dx=-r;dx<=r;dx++){if(Math.max(Math.abs(dx),Math.abs(dz))!==r)continue;const xx=x+dx,zz=z+dz;if(Math.abs(xx)>limit||Math.abs(zz)>limit)continue;const id=index(xx,zz),d=(xx-p.x)**2+(zz-p.z)**2;if(free[id]&&d<dist){dist=d;best=id}}
   if(best>=0)return best;
  }return -1;
 }
 const point=id=>V(id%width-limit,0,Math.floor(id/width)-limit);
 function snap(p){const n=nearest(p);if(n>=0)p.copy(point(n))}
 function path(a,b){
  const start=nearest(a),goal=nearest(b);if(start<0||goal<0)return [];
  const parent=new Int32Array(free.length).fill(-1),queue=new Int32Array(free.length);let first=0,last=1;queue[0]=start;parent[start]=start;
  while(first<last){const cur=queue[first++];if(cur===goal)break;const x=cur%width,z=Math.floor(cur/width);
   for(const next of [x>0?cur-1:-1,x<width-1?cur+1:-1,z>0?cur-width:-1,z<width-1?cur+width:-1])if(next>=0&&free[next]&&parent[next]<0){parent[next]=cur;queue[last++]=next}
  }
  if(parent[goal]<0)return [];const out=[];let n=goal;while(n!==start){out.push(point(n));n=parent[n]}return out.reverse();
 }
 function step(b,target,speed,dt){
  const p=b.g.position;let n=b.layoutNav;
  if(!n||n.age>2||n.target.distanceToSquared(target)>9){n=b.layoutNav={path:path(p,target),age:0,target:target.clone()}}
  n.age+=dt;while(n.path.length&&n.path[0].distanceToSquared(p)<.12)n.path.shift();const q=n.path[0];if(!q)return;
  const d=q.clone().sub(p);d.y=0;const distance=d.length();if(distance>0)p.addScaledVector(d,Math.min(speed*dt,distance)/distance);collide(p,.4);
 }
 return {reset,snap,step};
})();
