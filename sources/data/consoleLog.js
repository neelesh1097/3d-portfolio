import * as THREE from 'three/webgpu'

const text = `
███╗   ██╗███████╗███████╗██╗     ███████╗███████╗██╗  ██╗
████╗  ██║██╔════╝██╔════╝██║     ██╔════╝██╔════╝██║  ██║
██╔██╗ ██║█████╗  █████╗  ██║     █████╗  ███████╗███████║
██║╚██╗██║██╔══╝  ██╔══╝  ██║     ██╔══╝  ╚════██║██╔══██║
██║ ╚████║███████╗███████╗███████╗███████╗███████║██║  ██║
╚═╝  ╚═══╝╚══════╝╚══════╝╚══════╝╚══════╝╚══════╝╚═╝  ╚═╝
                                                          
██╗   ██╗ █████╗ ██████╗  █████╗ ██╗   ██╗                
╚██╗ ██╔╝██╔══██╗██╔══██╗██╔══██╗██║   ██║                
 ╚████╔╝ ███████║██║  ██║███████║██║   ██║                
  ╚██╔╝  ██╔══██║██║  ██║██╔══██║╚██╗ ██╔╝                
   ██║   ██║  ██║██████╔╝██║  ██║ ╚████╔╝                 
   ╚═╝   ╚═╝  ╚═╝╚═════╝ ╚═╝  ╚═╝  ╚═══╝                  

╔═ Profile ═════════════╗
║ Neelesh Yadav — Full-Stack Software Developer
║ Gurugram, Haryana, India
║ Building scalable, workflow-driven enterprise platforms and real-time collaboration applications.
╚═══════════════════════╝

╔═ Socials & Contact ═══╗
║ Mail           ⇒ neelesh6kumar@gmail.com
║ Phone          ⇒ +91 8810250825
║ GitHub         ⇒ https://github.com/neelesh1097
║ LinkedIn       ⇒ https://linkedin.com/in/neelesh-yadav-a5988b292
╚═══════════════════════╝

╔═ Technical Skills ════╗
║ Frontend ⇒ JavaScript (ES6+), React.js, Next.js, TypeScript
║ Backend  ⇒ Node.js, Express.js, REST APIs
║ Database ⇒ PostgreSQL, MongoDB
║ Tools    ⇒ Git, GitHub, Postman, VS Code, Vite
╚═══════════════════════╝

╔═ Experience ══════════╗
║ TRPW Strategic Partner ⇒ Frontend Intern (Apr 2026 – Present)
║   - Audit Management Tool (AMT) & Betel Meet real-time video conferencing.
║ Univest                ⇒ Tech Intern (Jul 2025 – Sep 2025)
║   - Validated user-facing features, regression scenarios & critical issue testing.
║ Phoenix Labs           ⇒ Software Development Intern (Sep 2024 – Mar 2025)
║   - Backend services, API integrations & data processing workflows.
╚═══════════════════════╝

╔═ Education ═══════════╗
║ Gurugram University (2022 – 2026)
║ B.Tech in Artificial Intelligence — Gurugram, Haryana
╚═══════════════════════╝

╔═ 3D Engine & Stack ═══╗
║ Rendered with Three.js (${THREE.REVISION}) using TSL, WebGPU and WebGL2.
║ Physics  ⇒ Rapier3D (Wasm)
║ Audio    ⇒ Howler.js
║ Source   ⇒ https://github.com/neelesh1097/3d-portfolio
╚═══════════════════════╝
`
let finalText = ''
let finalStyles = []
const stylesSet = {
    letter: 'color: #ffffff; font: 400 1em monospace;',
    pipe: 'color: #D66FFF; font: 400 1em monospace;',
}
let currentStyle = null
for(let i = 0; i < text.length; i++)
{
    const char = text[i]

    const style = char.match(/[╔║═╗╚╝╔╝]/) ? 'pipe' : 'letter'
    if(style !== currentStyle)
    {
        currentStyle = style
        finalText += '%c'

        finalStyles.push(stylesSet[currentStyle])
    }
    finalText += char
}

export default [finalText, ...finalStyles]
