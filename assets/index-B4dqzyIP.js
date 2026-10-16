(function(){const r=document.createElement("link").relList;if(r&&r.supports&&r.supports("modulepreload"))return;for(const s of document.querySelectorAll('link[rel="modulepreload"]'))a(s);new MutationObserver(s=>{for(const t of s)if(t.type==="childList")for(const o of t.addedNodes)o.tagName==="LINK"&&o.rel==="modulepreload"&&a(o)}).observe(document,{childList:!0,subtree:!0});function n(s){const t={};return s.integrity&&(t.integrity=s.integrity),s.referrerPolicy&&(t.referrerPolicy=s.referrerPolicy),s.crossOrigin==="use-credentials"?t.credentials="include":s.crossOrigin==="anonymous"?t.credentials="omit":t.credentials="same-origin",t}function a(s){if(s.ep)return;s.ep=!0;const t=n(s);fetch(s.href,t)}})();const g=11;var p=(e=>(e.Element="element",e.Blocker="blocker",e.Bonus="bonus",e))(p||{}),B=(e=>(e.Horizontal="x",e.Vertical="y",e))(B||{}),h=(e=>(e.Point="point",e.Line="line",e.Bomb="bomb",e))(h||{});function z(e,r){for(let n=0;n<Math.min(e.length,r.length);n++)if(e[n]!==r[n])return e[n]-r[n];return e.length-r.length}function F(e,r){var a;const n=((a=e[0])==null?void 0:a.length)??0;if(e.length>g||n>g||e.some(s=>s.length!==n))throw new Error(`The field must be rectangular and at most ${g} × ${g}.`);if(e.forEach((s,t)=>{s.forEach((o,l)=>{if(o){if(o.position.x!==l||o.position.y!==t)throw new Error("Item positions must match their field coordinates.");if(o.type===p.Bonus?o.weight!==0:!Number.isInteger(o.weight)||o.weight<1||o.weight>5)throw new Error("Items need priorities 1–5; bonuses need priority 0.")}})}),r.kind===h.Line&&r.dimension!==B.Horizontal&&r.dimension!==B.Vertical)throw new Error("Line dimension must be horizontal or vertical.");if(r.kind===h.Point&&(!Number.isInteger(r.elementsToDestroy)||r.elementsToDestroy<1))throw new Error("Point target count must be a positive integer.");if(r.kind===h.Bomb&&(!Number.isInteger(r.explosionRadius)||r.explosionRadius<0))throw new Error("Bomb radius must be a nonnegative integer.")}function H(e,r){var l;F(e,r);const n=e.length,a=((l=e[0])==null?void 0:l.length)??0;if(!n||!a)return null;const s=[];for(let i=0;i<n;i++)for(let c=0;c<a;c++)s.push({x:c,y:i});const t=(i,c)=>{const f=c.filter(({x:u,y:d})=>e[d][u]!==null).sort((u,d)=>u.y-d.y||u.x-d.x);return{targets:i,affected:f,priorities:f.map(({x:u,y:d})=>e[d][u].weight).sort((u,d)=>d-u)}};if(r.kind===h.Point){const i=[...s].sort((c,f)=>{var u,d;return(((u=e[f.y][f.x])==null?void 0:u.weight)??-1)-(((d=e[c.y][c.x])==null?void 0:d.weight)??-1)}).slice(0,r.elementsToDestroy);return t(i,i)}let o=null;for(const i of s){const c=[i],f=e[i.y][i.x];if(r.kind===h.Bomb){c.length=0;const d=Math.max(0,i.y-r.explosionRadius),x=Math.min(n-1,i.y+r.explosionRadius);for(let v=d;v<=x;v++){const w=Math.max(0,i.x-r.explosionRadius),$=Math.min(a-1,i.x+r.explosionRadius);for(let y=w;y<=$;y++)c.push({x:y,y:v})}}else if(!((f==null?void 0:f.type)===p.Blocker&&f.isBlocker))for(const d of[-1,1]){const x=r.dimension===B.Horizontal?d:0,v=r.dimension===B.Vertical?d:0;for(let w=i.x+x,$=i.y+v;w>=0&&w<a&&$>=0&&$<n;w+=x,$+=v){c.push({x:w,y:$});const y=e[$][w];if((y==null?void 0:y.type)===p.Blocker&&y.isBlocker)break}}const u=t([i],c);(!o||z(u.priorities,o.priorities)>0)&&(o=u)}return o}const N=[{label:"🎯 Triple strike",bonus:{type:p.Bonus,weight:0,kind:h.Point,position:{x:0,y:0},elementsToDestroy:3}},{label:"🚀 Vertical rocket ↕️",bonus:{type:p.Bonus,weight:0,kind:h.Line,position:{x:0,y:0},dimension:B.Vertical}},{label:"🚀 Horizontal rocket ↔️",bonus:{type:p.Bonus,weight:0,kind:h.Line,position:{x:0,y:0},dimension:B.Horizontal}},{label:"💣 Area bomb",bonus:{type:p.Bonus,weight:0,kind:h.Bomb,position:{x:0,y:0},explosionRadius:2}}],A=e=>e.map(([r,n])=>({x:r,y:n}));function I(e){const r=A(e===0?[[2,1],[4,2],[7,2],[3,4],[1,5],[7,5],[8,5]]:[[3,2],[4,2]]),n=A(e===0?[]:[[0,2],[1,2],[6,2],[4,3],[6,4],[2,5],[5,6],[6,6],[7,7]]),a=A(e===0?[[3,8],[4,8]]:[[4,8],[5,8]]),s=(t,o,l)=>t.some(i=>i.x===o&&i.y===l);return Array.from({length:g},(t,o)=>Array.from({length:g},(l,i)=>{const c={x:i,y:o};return s(r,i,o)?{type:p.Blocker,position:c,weight:2,isBlocker:!0}:s(a,i,o)?{...N[3].bonus,position:c}:{type:p.Element,position:c,weight:s(n,i,o)?5:1}}))}function R(e){return e.map(r=>r.map(n=>n?n.type===p.Blocker&&n.isBlocker?`B${n.weight}`:String(n.weight):".").join(" ")).join(`
`)}function M(e){const r=e.trim().split(/\r?\n/);if(r.length!==g)throw new Error(`Expected ${g} rows; found ${r.length}.`);return r.map((n,a)=>{const s=n.trim().split(/\s+/);if(s.length!==g)throw new Error(`Row ${a+1}: expected ${g} cells; found ${s.length}.`);return s.map((t,o)=>{const l={x:o,y:a};if(t===".")return null;if(t==="0")return{type:p.Bonus,weight:0,kind:h.Bomb,position:l,explosionRadius:2};if(/^B[1-5]$/.test(t))return{type:p.Blocker,weight:Number(t[1]),position:l,isBlocker:!0};if(/^[1-5]$/.test(t))return{type:p.Element,weight:Number(t),position:l};throw new Error(`Row ${a+1}, column ${o+1}: use 1–5, B1–B5, 0, or .`)})})}function O(e=Math.random){const r=Array.from({length:g},()=>Array.from({length:g},()=>{const n=e(),a=Math.floor(e()*5)+1;return n<.1?"0":n<.25?`B${a}`:String(a)}).join(" "));return M(r.join(`
`))}let k=0,L=3,b=I(0),E=R(b),S="";const m=document.querySelector("#app"),q=({x:e,y:r})=>`${e},${r}`,_=({x:e,y:r})=>`(${e}, ${r})`,P="cursor-pointer rounded border px-3 py-2 text-left focus-visible:outline-2 focus-visible:outline-offset-2";function j(){const e=H(b,N[L].bonus),r=new Set(e.affected.map(q)),n=new Set(e.targets.map(q)),a=b.map((t,o)=>`
    <span class="flex items-center justify-center text-xs text-gray-500">${o}</span>
    ${t.map((l,i)=>{const c={x:i,y:o},f=r.has(q(c)),u=n.has(q(c)),d=(l==null?void 0:l.type)===p.Blocker&&l.isBlocker,x=`Column ${i}, row ${o}: priority ${(l==null?void 0:l.weight)??"empty"}${d?", blocker":""}${f?", affected":""}${u?", target":""}`;return`
        <div
          class="relative flex aspect-square items-center justify-center border text-xs sm:text-base ${f?"border-red-400 bg-red-200":"border-gray-300 bg-white"} ${u?"z-10 bg-red-400":""}"
          aria-label="${x}"
          title="${x}"
        >
          ${(l==null?void 0:l.weight)??""}${d?'<span class="absolute right-0.5 top-0 text-[9px]" aria-hidden="true">B</span>':""}
        </div>`}).join("")}
  `).join("");m.innerHTML=`
    <main class="mx-auto max-w-5xl p-4 font-sans text-gray-900 sm:p-6">
      <h1 class="mb-4 text-xl font-semibold">🎯 Best bonus target shot</h1>

      <div class="mb-5 flex flex-wrap gap-2" role="group" aria-label="Field controls">
        ${[0,1].map(t=>`
          <button
            type="button"
            data-example="${t}"
            aria-pressed="${k===t}"
            class="${P} ${k===t?"border-black bg-gray-100":"border-gray-300"}"
          >Example ${t+1}</button>
        `).join("")}
        <button type="button" id="shuffle" class="${P} border-gray-300">Shuffle</button>
      </div>

      <div class="grid min-w-0 grid-cols-1 gap-6 md:grid-cols-[minmax(0,1fr)_240px]">
        <section class="min-w-0" aria-label="11 by 11 game field">
          <div class="grid grid-cols-[16px_repeat(11,minmax(0,1fr))] gap-0.5">
            <span></span>
            ${Array.from({length:11},(t,o)=>`
              <span class="text-center text-xs text-gray-500">${o}</span>
            `).join("")}
            ${a}
          </div>
          <p class="mt-3 text-sm">Numbers: priorities. B: blocker. Light red: affected. Dark red: target.</p>
        </section>

        <aside class="min-w-0">
          <h2 class="mb-2 font-semibold">Bonus</h2>
          <div class="flex flex-col gap-2" role="group" aria-label="Bonus type">
            ${N.map((t,o)=>`
              <button
                type="button"
                data-bonus="${o}"
                aria-pressed="${L===o}"
                class="${P} ${L===o?"border-black bg-gray-100":"border-gray-300"}"
              >${t.label}</button>
            `).join("")}
          </div>

          <div class="mt-5 space-y-2 text-sm" aria-live="polite" aria-atomic="true">
            <p><strong>Targets (x, y):</strong> ${e.targets.map(_).join(", ")}</p>
            <p><strong>Pieces hit:</strong> ${e.affected.length}</p>
            <p class="break-words"><strong>Priorities:</strong> ${e.priorities.join(", ")}</p>
          </div>
          <p class="mt-4 text-sm text-gray-600">Coordinates start at 0. Priorities are compared highest first. Rockets stop at blockers; bombs cover 5 × 5 cells.</p>
        </aside>
      </div>
      <section class="mt-6" aria-labelledby="editor-label">
        <label id="editor-label" for="field-editor" class="mb-2 block font-semibold">Edit field</label>
        <p id="editor-help" class="mb-2 text-sm text-gray-600">11 rows of 11 space-separated cells. Use 1–5 for pieces, B1–B5 for blockers, 0 for bonuses, and . for empty cells.</p>
        <textarea
          id="field-editor"
          rows="11"
          spellcheck="false"
          wrap="off"
          aria-describedby="editor-help editor-error"
          class="block w-full max-w-xl rounded border border-gray-300 p-2 font-mono text-sm focus-visible:outline-2"
        ></textarea>
        <p id="editor-error" role="alert" class="mt-2 text-sm text-red-700"></p>
        <button type="button" id="apply-field" class="${P} mt-3 border-gray-300">Apply field</button>
      </section>
    </main>`;const s=m.querySelector("#field-editor");s.value=E,s.setAttribute("aria-invalid",String(!!S)),m.querySelector("#editor-error").textContent=S,s.addEventListener("input",()=>{E=s.value}),m.querySelector("#apply-field").addEventListener("click",()=>{var t;try{b=M(E),E=R(b),k=null,S=""}catch(o){S=o instanceof Error?o.message:"Invalid field."}j(),(t=m.querySelector("#apply-field"))==null||t.focus()}),m.querySelector("#shuffle").addEventListener("click",()=>{var t;b=O(),E=R(b),k=null,S="",j(),(t=m.querySelector("#shuffle"))==null||t.focus()}),m.querySelectorAll("[data-bonus]").forEach(t=>{t.addEventListener("click",()=>{var o;L=Number(t.dataset.bonus),j(),(o=m.querySelector(`[data-bonus="${L}"]`))==null||o.focus()})}),m.querySelectorAll("[data-example]").forEach(t=>{t.addEventListener("click",()=>{var o;k=Number(t.dataset.example),b=I(k),E=R(b),S="",j(),(o=m.querySelector(`[data-example="${k}"]`))==null||o.focus()})})}j();
