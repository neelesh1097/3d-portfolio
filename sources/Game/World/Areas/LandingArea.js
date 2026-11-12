import * as THREE from 'three/webgpu'
import { color, float, Fn, instancedArray, mix, normalWorld, positionGeometry, step, texture, uniform, uv, vec2, vec3, vec4 } from 'three/tsl'
import { Inputs } from '../../Inputs/Inputs.js'
import { InteractivePoints } from '../../InteractivePoints.js'
import { Area } from './Area.js'
import gsap from 'gsap'
import { MeshDefaultMaterial } from '../../Materials/MeshDefaultMaterial.js'
import glyphsData from './letterGlyphs.json'

export class LandingArea extends Area
{
    constructor(model)
    {
        super(model)

        this.localTime = uniform(0)

        this.setLetters()
        this.setKiosk()
        this.setControls()
        this.setBonfire()
        this.setAchievement()
    }

    create3DLetterGeometry(char)
    {
        const cmds = glyphsData[char] || []
        const path = new THREE.ShapePath()
        for (const cmd of cmds) {
            if (cmd.type === 'M') path.moveTo(cmd.x, -cmd.y)
            else if (cmd.type === 'L') path.lineTo(cmd.x, -cmd.y)
            else if (cmd.type === 'Q') path.quadraticCurveTo(cmd.x1, -cmd.y1, cmd.x, -cmd.y)
            else if (cmd.type === 'C') path.bezierCurveTo(cmd.x1, -cmd.y1, cmd.x2, -cmd.y2, cmd.x, -cmd.y)
        }
        const shapes = path.toShapes()
        const geo = new THREE.ExtrudeGeometry(shapes, {
            depth: 0.46,
            bevelEnabled: true,
            bevelThickness: 0.04,
            bevelSize: 0.03,
            bevelSegments: 2,
            curveSegments: 6
        })
        geo.center()

        const count = geo.attributes.position.count
        const uvs = new Float32Array(count * 2)
        for (let k = 0; k < count; k++) {
            uvs[k * 2 + 0] = 0.7356
            uvs[k * 2 + 1] = 0.5
        }
        geo.setAttribute('uv', new THREE.BufferAttribute(uvs, 2))
        geo.computeVertexNormals()
        return geo
    }

    setLetters()
    {
        const letters = ['N', 'E', 'E', 'L', 'E', 'S', 'H']
        const startLocal = new THREE.Vector3(-8.85, -2.53, 4.82)
        const endLocal = new THREE.Vector3(-1.15, -2.53, 1.18)
        const quat = new THREE.Quaternion(0, 0.21644, 0, 0.9763)
        const paletteMat = this.game.materials.getFromName('palette')

        const halfExtentsMap = {
            N: [0.65, 0.77, 0.27],
            E: [0.51, 0.75, 0.27],
            L: [0.48, 0.75, 0.27],
            S: [0.53, 0.78, 0.27],
            H: [0.62, 0.79, 0.27]
        }

        for (let i = 0; i < letters.length; i++) {
            const ch = letters[i]
            const alpha = letters.length > 1 ? i / (letters.length - 1) : 0.5
            const localPos = new THREE.Vector3().lerpVectors(startLocal, endLocal, alpha)
            const worldPos = localPos.clone().add(this.model.position)

            const geo = this.create3DLetterGeometry(ch)
            const mesh = new THREE.Mesh(geo, paletteMat)
            mesh.castShadow = true
            mesh.receiveShadow = true

            const halfExtents = halfExtentsMap[ch] || [0.55, 0.75, 0.27]

            const object = this.game.objects.add(
                { model: mesh, updateMaterials: false },
                {
                    type: 'dynamic',
                    position: worldPos,
                    rotation: quat.clone(),
                    mass: 0.12,
                    sleeping: true,
                    colliders: [
                        {
                            shape: 'cuboid',
                            parameters: halfExtents,
                            category: 'object'
                        }
                    ]
                }
            )

            if (object && object.physical && object.physical.colliders[0]) {
                object.physical.colliders[0].setActiveEvents(this.game.RAPIER.ActiveEvents.CONTACT_FORCE_EVENTS)
                object.physical.colliders[0].setContactForceEventThreshold(5)
                object.physical.onCollision = (force, position) => {
                    this.game.audio.groups.get('hitBrick').playRandomNext(force, position)
                }
            }
        }
    }

    setKiosk()
    {
        // Interactive point
        const interactivePoint = this.game.interactivePoints.create(
            this.references.items.get('kioskInteractivePoint')[0].position,
            'Map',
            InteractivePoints.ALIGN_RIGHT,
            InteractivePoints.STATE_CONCEALED,
            () =>
            {
                this.game.inputs.interactiveButtons.clearItems()
                this.game.modals.open('map')
                // interactivePoint.hide()
            },
            () =>
            {
                this.game.inputs.interactiveButtons.addItems(['interact'])
            },
            () =>
            {
                this.game.inputs.interactiveButtons.removeItems(['interact'])
            },
            () =>
            {
                this.game.inputs.interactiveButtons.removeItems(['interact'])
            }
        )

        // this.game.map.items.get('map').events.on('close', () =>
        // {
        //     interactivePoint.show()
        // })
    }

    setControls()
    {
        // Interactive point
        const interactivePoint = this.game.interactivePoints.create(
            this.references.items.get('controlsInteractivePoint')[0].position,
            'Controls',
            InteractivePoints.ALIGN_RIGHT,
            InteractivePoints.STATE_CONCEALED,
            () =>
            {
                this.game.inputs.interactiveButtons.clearItems()
                this.game.menu.open('controls')
                interactivePoint.hide()
            },
            () =>
            {
                this.game.inputs.interactiveButtons.addItems(['interact'])
            },
            () =>
            {
                this.game.inputs.interactiveButtons.removeItems(['interact'])
            },
            () =>
            {
                this.game.inputs.interactiveButtons.removeItems(['interact'])
            }
        )

        // Menu instance
        const menuInstance = this.game.menu.items.get('controls')

        menuInstance.events.on('close', () =>
        {
            interactivePoint.show()
        })

        menuInstance.events.on('open', () =>
        {
            if(this.game.inputs.mode === Inputs.MODE_GAMEPAD)
                menuInstance.tabs.goTo('gamepad')
            else if(this.game.inputs.mode === Inputs.MODE_MOUSEKEYBOARD)
                menuInstance.tabs.goTo('mouse-keyboard')
            else if(this.game.inputs.mode === Inputs.MODE_TOUCH)
                menuInstance.tabs.goTo('touch')
        })
    }

    setBonfire()
    {
        const position = this.references.items.get('bonfireHashes')[0].position

        // Particles
        let particles = null
        {
            const emissiveMaterial = this.game.materials.getFromName('emissiveOrangeRadialGradient')
    
            const count = 30
            const elevation = uniform(5)
            const positions = new Float32Array(count * 3)
            const scales = new Float32Array(count)
    
    
            for(let i = 0; i < count; i++)
            {
                const i3 = i * 3
    
                const angle = Math.PI * 2 * Math.random()
                const radius = Math.pow(Math.random(), 1.5) * 1
                positions[i3 + 0] = Math.cos(angle) * radius
                positions[i3 + 1] = Math.random()
                positions[i3 + 2] = Math.sin(angle) * radius
    
                scales[i] = 0.02 + Math.random() * 0.06
            }
            
            const positionAttribute = instancedArray(positions, 'vec3').toAttribute()
            const scaleAttribute = instancedArray(scales, 'float').toAttribute()
    
            const material = new THREE.SpriteNodeMaterial()
            material.outputNode = emissiveMaterial.outputNode
    
            const progress = float(0).toVar()
    
            material.positionNode = Fn(() =>
            {
                const newPosition = positionAttribute.toVar()
                progress.assign(newPosition.y.add(this.localTime.mul(newPosition.y)).fract())
    
                newPosition.y.assign(progress.mul(elevation))
                newPosition.xz.addAssign(this.game.wind.direction.mul(progress))
    
                const progressHide = step(0.8, progress).mul(100)
                newPosition.y.addAssign(progressHide)
                
                return newPosition
            })()
            material.scaleNode = Fn(() =>
            {
                const progressScale = progress.remapClamp(0.5, 1, 1, 0)
                return scaleAttribute.mul(progressScale)
            })()
    
            const geometry = new THREE.CircleGeometry(0.5, 8)
    
            particles = new THREE.Mesh(geometry, material)
            particles.visible = false
            particles.position.copy(position)
            particles.count = count
            this.game.scene.add(particles)
        }

        // Hashes
        {
            const alphaNode = Fn(() =>
            {
                const baseUv = uv(1)
                const distanceToCenter = baseUv.sub(0.5).length()
    
                const voronoi = texture(
                    this.game.noises.voronoi,
                    baseUv
                ).g
    
                voronoi.subAssign(distanceToCenter.remap(0, 0.5, 0.3, 0))
    
                return voronoi
            })()
    
            const material = new MeshDefaultMaterial({
                colorNode: color(0x6F6A87),
                alphaNode: alphaNode,
                hasWater: false,
                hasLightBounce: false
            })
    
            const mesh = this.references.items.get('bonfireHashes')[0]
            mesh.material = material
        }

        // Burn
        const burn = this.references.items.get('bonfireBurn')[0]
        burn.visible = false

        // Interactive point
        this.game.interactivePoints.create(
            this.references.items.get('bonfireInteractivePoint')[0].position,
            'Res(e)t',
            InteractivePoints.ALIGN_RIGHT,
            InteractivePoints.STATE_CONCEALED,
            () =>
            {
                this.game.reset()

                gsap.delayedCall(2, () =>
                {
                    // Bonfire
                    particles.visible = true
                    burn.visible = true
                    this.game.ticker.wait(2, () =>
                    {
                        particles.geometry.boundingSphere.center.y = 2
                        particles.geometry.boundingSphere.radius = 2
                    })

                    // Sound
                    this.game.audio.groups.get('campfire').items[0].positions.push(position)
                })
            },
            () =>
            {
                this.game.inputs.interactiveButtons.addItems(['interact'])
            },
            () =>
            {
                this.game.inputs.interactiveButtons.removeItems(['interact'])
            },
            () =>
            {
                this.game.inputs.interactiveButtons.removeItems(['interact'])
            }
        )
    }

    setAchievement()
    {
        this.events.on('boundingIn', () =>
        {
            this.game.achievements.setProgress('areas', 'landing')
        })
        this.events.on('boundingOut', () =>
        {
            this.game.achievements.setProgress('landingLeave', 1)
        })
    }

    update()
    {
        this.localTime.value += this.game.ticker.deltaScaled * 0.1
    }
}