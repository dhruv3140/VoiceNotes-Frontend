import { jsPDF } from 'jspdf';
import latinUrl from '../assets/fonts/font-0.ttf?url';
import hindiUrl from '../assets/fonts/NotoSansDevanagari.ttf?url';

let fontsReady;
async function loadFonts() {
  fontsReady ||= Promise.all([
    new FontFace('VoxPdfLatin', `url(${latinUrl})`).load(),
    new FontFace('VoxPdfHindi', `url(${hindiUrl})`).load(),
  ]).then(fonts => fonts.forEach(font => document.fonts.add(font)));
  return fontsReady;
}
const dateText = value => {
  if (!value) return 'Date not recorded';
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? 'Date not recorded' : date.toLocaleDateString(undefined, { day:'numeric', month:'short', year:'numeric' });
};

// Browser text shaping preserves Hindi and mixed-language notes. Pages are
// high-resolution images with an embedded-font text layer for search/copy.
// Complex-script selection geometry can differ slightly from the shaped image.
export async function createNotesPdf(notes, exportedAt = new Date()) {
  await loadFonts();
  const W=1654, H=2339, M=142, bottom=H-180;
  const pdf=new jsPDF({unit:'mm',format:'a4',compress:true});
  pdf.setProperties({title:'VoxNote - exported notes',subject:'Personal notes',creator:'VoxNote'});
  const pages=[];
  const encode=async url=>{const bytes=new Uint8Array(await (await fetch(url)).arrayBuffer());let raw='';for(let i=0;i<bytes.length;i++)raw+=String.fromCharCode(bytes[i]);return btoa(raw);};
  const [latin,hindi]=await Promise.all([encode(latinUrl),encode(hindiUrl)]);
  pdf.addFileToVFS('latin.ttf',latin);pdf.addFont('latin.ttf','VoxLatin','normal');
  pdf.addFileToVFS('hindi.ttf',hindi);pdf.addFont('hindi.ttf','VoxHindi','normal');
  const textLayers=new Map();
  let canvas, ctx, y;
  const font=(size=31)=>{ctx.font=`${size}px VoxPdfLatin, VoxPdfHindi, sans-serif`;};
  const text=(value,x,top,size=31,color='#263d39')=>{font(size);ctx.fillStyle=color;ctx.fillText(String(value),x,top);const layer=textLayers.get(canvas)||[];layer.push({value:String(value),x,top,size});textLayers.set(canvas,layer);};
  function newPage(){
    canvas=document.createElement('canvas');canvas.width=W;canvas.height=H;ctx=canvas.getContext('2d');ctx.textBaseline='top';ctx.fillStyle='#fff';ctx.fillRect(0,0,W,H);
    ctx.fillStyle='#163d38';ctx.fillRect(0,0,W,24);
    ctx.fillStyle='#d6eddf';ctx.beginPath();ctx.roundRect(M,95,70,70,20);ctx.fill();
    // A simple note mark, not an invented corporate seal.
    ctx.strokeStyle='#25544a';ctx.lineWidth=3;ctx.strokeRect(M+24,113,23,32);ctx.beginPath();ctx.moveTo(M+29,122);ctx.lineTo(M+42,122);ctx.moveTo(M+29,131);ctx.lineTo(M+42,131);ctx.stroke();
    text('VoxNote',M+92,91,53,'#173d38');text('THOUGHTS, WORTH KEEPING.',M+94,155,18,'#5b7567');
    text('NOTES / PERSONAL COPY',W-M-340,112,20,'#607269');
    ctx.strokeStyle='#cfddd3';ctx.lineWidth=2;ctx.beginPath();ctx.moveTo(M,215);ctx.lineTo(W-M,215);ctx.stroke();
    text(`Exported ${dateText(exportedAt)}  ·  ${notes.length} ${notes.length===1?'note':'notes'}`,M,245,24,'#61746b');
    y=325;pages.push(canvas);
  }
  function lines(value,size=31){
    font(size);const result=[];
    for(const paragraph of String(value).replace(/\r\n?/g,'\n').split('\n')){
      if(!paragraph){result.push('');continue;}
      let line='';
      const chunks=paragraph.match(/\S+\s*/gu)||[''];
      for(const chunk of chunks){
        if(ctx.measureText(line+chunk).width<=W-M*2){line+=chunk;continue;}
        if(line){result.push(line.trimEnd());line='';}
        if(ctx.measureText(chunk).width<=W-M*2){line=chunk;continue;}
        // Keep combining characters together in long URLs/unbroken words.
        const parts=typeof Intl.Segmenter==='function'?[...new Intl.Segmenter(undefined,{granularity:'grapheme'}).segment(chunk)].map(x=>x.segment):Array.from(chunk);
        for(const part of parts){if(ctx.measureText(line+part).width>W-M*2&&line){result.push(line);line='';}line+=part;}
      }
      if(line)result.push(line.trimEnd());
    }
    return result;
  }
  const ensure=(height,continued)=>{if(y+height>bottom){newPage();if(continued){text(continued,M,y,22,'#61746b');y+=48;}}};
  newPage();
  notes.forEach((note,index)=>{
    const meta=note.metadata||{};const body=String(meta.transcript??'');
    const title=String(meta.title||note.title||body.split('\n').find(x=>x.trim())||'Untitled note').trim();
    const heading=lines(title,43).slice(0,3);if(lines(title,43).length>3)heading[2]+='…';
    ensure(heading.length*61+190);
    text(`NOTE ${String(index+1).padStart(2,'0')}`,M,y,21,'#50745e');y+=46;
    heading.forEach(line=>{text(line,M,y,43,'#183f37');y+=61;});
    const details=[`Created ${dateText(meta.created_at)}`,`Folder: ${meta.folder_name||'General'}`];
    if(Array.isArray(meta.tags)&&meta.tags.length)details.push(`Tags: ${meta.tags.join(', ')}`);
    lines(details.join('  ·  '),23).forEach(line=>{ensure(37,`Note ${index+1} · continued`);text(line,M,y,23,'#61746b');y+=37;});y+=32;
    for(const line of lines(body||'(Empty note)',31)){ensure(52,`Note ${index+1} · continued`);text(line,M,y,31);y+=52;}
    y+=48;if(y+30<bottom){ctx.strokeStyle='#e1e8e1';ctx.lineWidth=2;ctx.beginPath();ctx.moveTo(M,y);ctx.lineTo(W-M,y);ctx.stroke();}y+=60;
  });
  pages.forEach((page,index)=>{
    canvas=page;ctx=page.getContext('2d');ctx.textBaseline='top';ctx.strokeStyle='#cfddd3';ctx.lineWidth=2;ctx.beginPath();ctx.moveTo(M,H-130);ctx.lineTo(W-M,H-130);ctx.stroke();text('VoxNote  /  Your thoughts, in one place.',M,H-99,21,'#61746b');text(`${index+1} / ${pages.length}`,W-M-110,H-99,21,'#61746b');
    if(index)pdf.addPage();pdf.addImage(page.toDataURL('image/png'),'PNG',0,0,210,297,undefined,'FAST');
    for(const line of textLayers.get(page)||[]){pdf.setFont(/[\u0900-\u097f]/u.test(line.value)?'VoxHindi':'VoxLatin');pdf.setFontSize(line.size*210/W*72/25.4);pdf.text(line.value,line.x*210/W,(line.top+line.size*.8)*297/H,{renderingMode:'invisible'});}
  });
  return pdf;
}
