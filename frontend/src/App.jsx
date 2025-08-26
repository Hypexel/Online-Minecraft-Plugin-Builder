import React, { useState, useEffect, useRef } from 'react'
setStatus('zipping')
// create a zip in browser
const JSZip = (await import('jszip')).default
const zip = new JSZip()
for (const p in files) zip.file(p, files[p])
const content = await zip.generateAsync({type:'blob'})


const fd = new FormData();
fd.append('projectZip', content, 'project.zip')


setStatus('uploading')
const resp = await axios.post('/api/build', fd, { responseType: 'blob' })
const blob = new Blob([resp.data])
const { saveAs } = await import('file-saver')
saveAs(blob, 'plugin.jar')
setStatus('done')
}


const activeContent = files[active]


return (
<div className="app-root">
<div className="sidebar">
<div className="file-actions">
<button onClick={() => { const newPath = prompt('New file path (eg src/main/java/com/example/Hello.java)'); if(newPath) setFiles({...files, [newPath]: ''}); }}>New File</button>
<button onClick={() => handleBuild()}>Build (Maven)</button>
<div className="status">{status}</div>
</div>
<div className="file-list">
{Object.keys(files).map(k=> (
<div key={k} className={k===active? 'file active':'file'} onClick={()=>setActive(k)}>{k}</div>
))}
</div>
</div>
<div className="editor">
<Editor
height="100%"
defaultLanguage={active.endsWith('.java')? 'java': active.endsWith('.xml')? 'xml':'yaml'}
value={activeContent}
onChange={(v)=>updateFile(active, v)}
/>
</div>
</div>
)
}
