import * as THREE from 'three/webgpu'
import { Game } from './Game.js'
import { attribute, cross, dot, float, Fn, mat3, modelViewMatrix, positionGeometry, texture, uniform, vec2, vec3, vec4 } from 'three/tsl'

const getRotationMatrix = Fn(([u, v]) =>
{
    const cosTheta = dot(u, v)
    const axis = cross(u, v)
    const sinTheta = axis.length()

    const normalizedAxis = sinTheta.greaterThan(0.0001).select(axis.div(sinTheta), vec3(0, 1, 0))

    const c = cosTheta
    const s = sinTheta
    const t = c.oneMinus()

    const rotMat = mat3(
        t.mul(normalizedAxis.x).mul(normalizedAxis.x).add(c), t.mul(normalizedAxis.x).mul(normalizedAxis.y).sub(s.mul(normalizedAxis.z)), t.mul(normalizedAxis.x).mul(normalizedAxis.z).add(s.mul(normalizedAxis.y)),
        t.mul(normalizedAxis.x).mul(normalizedAxis.y).add(s.mul(normalizedAxis.z)), t.mul(normalizedAxis.y).mul(normalizedAxis.y).add(c), t.mul(normalizedAxis.y).mul(normalizedAxis.z).sub(s.mul(normalizedAxis.x)),
        t.mul(normalizedAxis.x).mul(normalizedAxis.z).sub(s.mul(normalizedAxis.y)), t.mul(normalizedAxis.y).mul(normalizedAxis.z).add(s.mul(normalizedAxis.x)), t.mul(normalizedAxis.z).mul(normalizedAxis.z).add(c)
    )

    return sinTheta.greaterThan(0.0001).select(rotMat, mat3(1, 0, 0, 0, 1, 0, 0, 0, 1))
})

export class Trails
{
    constructor()
    {
        this.game = Game.getInstance()

        if(this.game.debug.active)
        {
            this.debugPanel = this.game.debug.panel.addFolder({
                title: '🌈 Trails',
                expanded: false,
            })
        }
        
        this.subdivisions = 32
        this.texel = 1 / this.subdivisions
        this.distanceThrottle = 0.4
        this.emissiveMultiplier = uniform(5)
        this.fresnelOffset = uniform(0.25)
        this.decay = 0.2
        this.items = []

        this.setGeometry()
        
        this.game.ticker.events.on('tick', () =>
        {
            this.update()
        }, 10)

        if(this.game.debug.active)
        {
            this.debugPanel.addBinding(this.emissiveMultiplier, 'value', { label: 'emissiveMultiplier', min: 0, max: 10, step: 0.01 })
            this.debugPanel.addBinding(this.fresnelOffset, 'value', { label: 'fresnelOffset', min: 0, max: 1, step: 0.01 })
            this.debugPanel.addBinding(this, 'decay', { min: 0, max: 1, step: 0.001 })
        }
    }

    setGeometry()
    {
        this.geometry = new THREE.CylinderGeometry(0.1, 0.1, 1, 4, this.subdivisions, true)
        this.geometry.rotateY(Math.PI * 0.25)
        this.geometry.rotateX(- Math.PI * 0.5)
        this.geometry.translate(0, 0, 0.5)
        
        this.geometry.deleteAttribute('uv')
    }

    create()
    {
        const item = {}
        item.lastPosition = new THREE.Vector3(Infinity, Infinity, Infinity)
        item.position = new THREE.Vector3()
        item.alpha = 0

        item.dataTexture = new THREE.DataTexture(
            new Float32Array(this.subdivisions * 4),
            this.subdivisions,
            1,
            THREE.RGBAFormat,
            THREE.FloatType
        )

        const material = new THREE.MeshBasicNodeMaterial({ transparent: true, depthWrite: false })
        const customNormal = vec3().toVarying()
        const ratio = float(0).toVarying()
        const alpha = float(0).toVarying()

        material.positionNode = Fn(() =>
        {
            // Ratio
            ratio.assign(positionGeometry.z.oneMinus())

            // Trail data
            const trailData = texture(item.dataTexture, vec2(ratio, 0.5))
            const trailPosition = trailData.xyz

            // Direction
            const nextPosition = texture(item.dataTexture, vec2(ratio.add(this.texel), 0.5)).xyz
            const diff = nextPosition.sub(trailPosition)
            const len = diff.length()
            const direction = len.greaterThan(0.0001).select(diff.div(len), vec3(0, 0, -1))

            // Rotation matrix
            const rotationMatrix = getRotationMatrix(direction, vec3(0, 0, -1))

            // Rotated position
            const basePosition = vec3(positionGeometry.x, positionGeometry.y, 0)
            const rotatedPoint = rotationMatrix.mul(basePosition)

            // Normal
            customNormal.assign(modelViewMatrix.mul(vec4(rotationMatrix.mul(attribute('normal')), 0)))

            // Alpha
            alpha.assign(trailData.w)
            
            return trailPosition.add(rotatedPoint)
        })()

        material.outputNode = Fn(() =>
        {
            const fresnel = customNormal.dot(vec3(0, 0, 1)).abs().oneMinus()

            const gradientUv = vec2(
                0.5,
                ratio.oneMinus().sub(fresnel.oneMinus().mul(this.fresnelOffset))
            )
            const baseColor = texture(this.game.materials.gradientTexture, gradientUv).rgb.mul(this.emissiveMultiplier)
            
            return vec4(vec3(baseColor), ratio.oneMinus().mul(alpha))
        })()
        item.mesh = new THREE.Mesh(this.geometry, material)
        item.mesh.renderOrder = 1
        item.mesh.frustumCulled = false
        this.game.scene.add(item.mesh)

        this.items.push(item)
        
        return item
    }

    update()
    {
        for(const item of this.items)
        {
            if(!item.position || Number.isNaN(item.position.x) || Number.isNaN(item.position.y) || Number.isNaN(item.position.z))
                continue

            const data = item.dataTexture.source.data.data

            // Throttle by distance
            const positionDelta = item.lastPosition.clone().sub(item.position)
            const distance = positionDelta.length()
            
            if(distance > this.distanceThrottle)
            {
                // Move data one "pixel"
                for(let i = this.subdivisions - 1; i > 0; i--)
                {
                    const i4 = i * 4
                    data[i4    ] = data[i4 - 4]
                    data[i4 + 1] = data[i4 - 3]
                    data[i4 + 2] = data[i4 - 2]
                    data[i4 + 3] = data[i4 - 1]
                }

                // Save time and position
                item.lastPosition.copy(item.position)
            }

            // Fade out
            for(let i = this.subdivisions - 1; i >= 0; i--)
            {
                const i4 = i * 4
                data[i4 + 3] = Math.max(data[i4 + 3] - this.game.ticker.deltaScaled * this.decay, 0)
            }

            // Draw new position
            data[0] = item.position.x
            data[1] = item.position.y
            data[2] = item.position.z
            data[3] = item.alpha

            item.dataTexture.needsUpdate = true
        }
    }
}