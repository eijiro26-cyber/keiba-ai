const $=x=>document.getElementById(x);
const sample=`1　ブリンカー　ボーンディスウェイ 57.0 (11番人気)
牡7 / 黒鹿
(5,4,5,21)
丸山元気(57.0) 牧光二(美浦)
2　サヴォーナ 27.7 (9番人気)
牡6 / 鹿
(4,4,1,10)
池添謙一(57.0) 中竹和也(栗東)
3　ロデオドライブ 4.3 (3番人気)
牡3 / 鹿
(3,1,0,0)
C.ルメール(57.0) 辻哲英(美浦)
4　ドゥレッツァ 8.3 (4番人気)
牡6 / 青鹿
(5,2,2,4)
田辺裕信(59.0) 尾関知人(美浦)
5　ゾロアストロ 3.5 (1番人気)
牡3 / 芦
(2,2,1,1)
岩田望来(55.0) 宮田敬介(美浦)
6　チェルヴィニア 12.9 (6番人気)
牝5 / 鹿
(4,2,0,8)
津村明秀(56.0) 木村哲也(美浦)
7　ジュンブロッサム 41.9 (10番人気)
牡7 / 黒鹿
(5,7,1,15)
杉原誠人(58.0) 友道康彦(栗東)
8　ダノンシーマ 3.6 (2番人気)
牡4 / 黒鹿
(5,1,4,0)
川田将雅(57.0) 中内田充正(栗東)
9　アーバンシック 14.0 (7番人気)
牡5 / 栗
(4,1,1,7)
三浦皇成(59.0) 武井亮(美浦)
10　バレエマスター 27.1 (8番人気)
牡7 / 鹿
(4,1,3,28)
菊沢一樹(57.0) 梅田智之(栗東)
11　ステレンボッシュ 12.1 (5番人気)
牝5 / 鹿
(3,4,2,6)
戸崎圭太(56.0) 宮田敬介(美浦)`;
$("sample").onclick=()=>{$("input").value=sample};
$("clear").onclick=()=>{$("input").value="";$("result").hidden=true;$("progress").hidden=true};
function parse(t){let a=t.split(/\r?\n/),out=[];for(let i=0;i<a.length;i++){let m=a[i].match(/^(?:\S+\s*)?(\d{1,2})[　\s]+(.+?)\s+(\d{1,2}(?:\.\d)?)\s*(?:\(\d+番人気\))?$/);if(!m)continue;let rec=null,jockey="",age=null;for(let j=i+1;j<Math.min(i+5,a.length);j++){let r=a[j].match(/^\((\d+),(\d+),(\d+),(\d+)\)$/);if(r)rec=r.slice(1).map(Number);let q=a[j].match(/(?:牡|牝|騸)(\d+)/);if(q)age=+q[1];let z=a[j].match(/^(.+?)\(\d/);if(z)jockey=z[1]}if(!rec)rec=[0,0,0,0];out.push({no:+m[1],name:m[2].trim(),wt:+m[3],rec,jockey,age})}return out}
function score(h,course,dist,track){let [w,s,t,o]=h.rec,n=Math.max(1,w+s+t+o),top=(w+s+t)/n,win=w/n;let x=48+win*28+top*18+(h.age<=4?3:h.age>=7?-2:1)-(h.wt-55)*1.1+(dist>=1800&&dist<=2400?3:1)+(track==="良"?0:track==="稍重"?1:track==="重"?2:2.5)+(course==="新潟"||course==="中京"?1:0);return Math.max(35,Math.min(96,x))}
async function run(hs,runs){let sc=hs.map(h=>score(h,$("course").value,+$("distance").value,$("track").value)),wt=sc.map(x=>Math.exp((x-70)/7)),sum=wt.reduce((a,b)=>a+b,0),cdf=[],z=0;wt.forEach(x=>{z+=x/sum;cdf.push(z)});let win=Array(hs.length).fill(0),top=Array(hs.length).fill(0);function pick(){let r=Math.random(),l=0,h=cdf.length-1;while(l<h){let m=(l+h)>>1;r<cdf[m]?h=m:l=m+1}return l}for(let k=0;k<runs;k++){let c=[];while(c.length<Math.min(3,hs.length)){let x=pick();if(!c.includes(x))c.push(x)}win[c[0]]++;c.forEach(x=>top[x]++);if(k%10000===0){$("bar").style.width=(k/runs*100)+"%";$("status").textContent=`${k.toLocaleString()} / ${runs.toLocaleString()}回`;await new Promise(requestAnimationFrame)}}return hs.map((h,i)=>({...h,score:sc[i],win:win[i]/runs,top:top[i]/runs})).sort((a,b)=>b.win-a.win)}
$("predict").onclick=async()=>{let hs=parse($("input").value);if(!hs.length){alert("馬を読み取れませんでした。JRA出馬表を貼り付けてください。");return}$("progress").hidden=false;$("result").hidden=true;$("status").textContent="準備中…";let r=await run(hs,+$("runs").value),marks=["◎","○","▲","△","△","☆","△","△","△","△","△"];$("tbody").innerHTML=r.map((h,i)=>`<tr><td class="mark">${marks[i]}</td><td class="horse">${h.no} ${h.name}<br><small>${h.jockey}</small></td><td>${h.score.toFixed(1)}</td><td>${(h.win*100).toFixed(2)}%</td><td>${(h.top*100).toFixed(2)}%</td></tr>`).join("");$("summary").innerHTML=`<b>${$("course").value}・芝${$("distance").value}m・${$("track").value}</b><br>オッズを使わず${$("runs").value.toLocaleString()}回シミュレーション。`;$("result").hidden=false;$("status").textContent="完了";$("bar").style.width="100%"};
