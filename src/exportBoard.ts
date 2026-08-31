import { GODS, LANDMARKS, MAPS, MARKER_COLORS, MARKER_TYPES, ROLE_IMAGES, getLandmarkPoint } from './data'
import type { BoardState } from './types'
import { downloadBlob } from './utils'

const loadImage = (src: string) => new Promise<HTMLImageElement>((resolve, reject) => { const image = new Image(); image.onload=()=>resolve(image); image.onerror=reject; image.src=src })
const safeName = (name: string) => name.trim().replace(/[^\p{L}\p{N}-]+/gu, '-').replace(/^-|-$/g, '') || 'tactica'
export interface ExportArea { x: number; y: number; width: number; height: number }

export async function exportBoardPng(state: BoardState, area: ExportArea = { x: 0, y: 0, width: 1, height: 1 }) {
  const size = 1600, canvas = document.createElement('canvas'); canvas.width=size; canvas.height=size
  const ctx = canvas.getContext('2d')!
  ctx.save(); ctx.scale(1/area.width,1/area.height); ctx.translate(-area.x*size,-area.y*size)
  const map = MAPS.find(m => m.id === state.mapId) ?? MAPS[0]
  const mapImage = await loadImage(map.src); ctx.drawImage(mapImage,0,0,size,size)
  const gradient=ctx.createLinearGradient(0,size,size,0); gradient.addColorStop(0,'rgba(14,112,185,.18)'); gradient.addColorStop(.45,'transparent'); gradient.addColorStop(.55,'transparent'); gradient.addColorStop(1,'rgba(190,55,34,.18)'); ctx.fillStyle=gradient;ctx.fillRect(0,0,size,size)
  for (const stroke of state.strokes) {
    if (stroke.points.length<2) continue; ctx.beginPath(); ctx.moveTo(stroke.points[0].x*size,stroke.points[0].y*size); stroke.points.slice(1).forEach(p=>ctx.lineTo(p.x*size,p.y*size)); ctx.strokeStyle=stroke.color;ctx.lineWidth=stroke.width*2.2;ctx.globalAlpha=stroke.opacity;ctx.lineCap='round';ctx.lineJoin='round';ctx.stroke();ctx.globalAlpha=1
    if(stroke.kind==='arrow'){const a=stroke.points.at(-2)!,b=stroke.points.at(-1)!,angle=Math.atan2(b.y-a.y,b.x-a.x),len=22+stroke.width*2;ctx.fillStyle=stroke.color;ctx.globalAlpha=stroke.opacity;ctx.beginPath();ctx.moveTo(b.x*size,b.y*size);ctx.lineTo(b.x*size-Math.cos(angle-.55)*len,b.y*size-Math.sin(angle-.55)*len);ctx.lineTo(b.x*size-Math.cos(angle+.55)*len,b.y*size-Math.sin(angle+.55)*len);ctx.fill();ctx.globalAlpha=1}
  }
  for(const token of state.tokens){const radius=token.size*.79,x=token.x*size,y=token.y*size,god=GODS.find(g=>g.name===token.god),image=await loadImage(god?.src??ROLE_IMAGES[token.role]);ctx.save();ctx.beginPath();ctx.arc(x,y,radius,0,Math.PI*2);ctx.clip();const scale=Math.max(radius*2/image.width,radius*2/image.height);const iw=image.width*scale,ih=image.height*scale;ctx.drawImage(image,x-iw/2,y-ih*(god?.objectPosition ? .2 : .5),iw,ih);ctx.restore();ctx.beginPath();ctx.arc(x,y,radius,0,Math.PI*2);ctx.lineWidth=7;ctx.strokeStyle=token.team==='ally'?'#28a9ff':'#ff5b45';ctx.stroke();ctx.fillStyle='#071018';ctx.beginPath();ctx.arc(x-radius*.7,y-radius*.7,12,0,Math.PI*2);ctx.fill();ctx.fillStyle='#fff';ctx.font='bold 14px sans-serif';ctx.textAlign='center';ctx.fillText(token.team==='ally'?'A':'E',x-radius*.7,y-radius*.7+5)}
  for(const marker of state.markers){
    const meta=MARKER_TYPES.find(m=>m.id===marker.type)??MARKER_TYPES[0],landmark=marker.landmarkId?LANDMARKS.find(item=>item.id===marker.landmarkId):undefined,point=landmark?getLandmarkPoint(landmark,state.mapId):marker,x=point.x*size,y=point.y*size,r=marker.size*.65
    ctx.strokeStyle=MARKER_COLORS[marker.color];ctx.fillStyle=MARKER_COLORS[marker.color];ctx.lineWidth=5
    if(marker.type==='objective'){
      ctx.lineWidth=Math.max(7,marker.size*.12);ctx.beginPath();ctx.arc(x,y,r*.82,0,Math.PI*2);ctx.stroke()
    }else{
      ctx.fillStyle='rgba(6,12,18,.9)';ctx.beginPath();ctx.arc(x,y,r,0,Math.PI*2);ctx.fill();ctx.stroke();ctx.fillStyle=MARKER_COLORS[marker.color];ctx.font=`bold ${r}px serif`;ctx.textAlign='center';ctx.textBaseline='middle';ctx.fillText(meta.icon,x,y)
    }
    if(marker.label){ctx.font='bold 19px sans-serif';ctx.textAlign='center';ctx.textBaseline='middle';const w=ctx.measureText(marker.label).width+22;ctx.fillStyle='rgba(6,12,18,.9)';ctx.fillRect(x-w/2,y+r+8,w,30);ctx.fillStyle='#fff';ctx.fillText(marker.label,x,y+r+24)}
  }
  ctx.restore()
  ctx.fillStyle='rgba(4,9,14,.88)';ctx.fillRect(0,0,size,62);ctx.fillStyle='#d9bb73';ctx.textAlign='left';ctx.textBaseline='middle';ctx.font='700 27px sans-serif';ctx.fillText(state.tacticName,28,31);ctx.fillStyle='#c6d1d8';ctx.textAlign='right';ctx.font='18px sans-serif';ctx.fillText('SMITE 2 TACTICAL BOARD',size-28,31)
  const blob=await new Promise<Blob>((resolve,reject)=>canvas.toBlob(value=>value?resolve(value):reject(new Error('No se pudo generar el PNG')),'image/png'))
  downloadBlob(blob,`${safeName(state.tacticName)}.png`)
}
export function exportBoardJson(state: BoardState){downloadBlob(new Blob([JSON.stringify(state,null,2)],{type:'application/json'}),`${safeName(state.tacticName)}.json`)}
