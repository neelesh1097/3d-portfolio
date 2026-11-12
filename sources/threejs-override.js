import * as THREE from 'three/webgpu'
import WebGPUBackend from 'three/src/renderers/webgpu/WebGPUBackend.js'

// Patch WebGPUBackend._draw to ensure all draw parameters are strictly valid unsigned integers
if(WebGPUBackend && WebGPUBackend.prototype && WebGPUBackend.prototype._draw)
{
    const origDraw = WebGPUBackend.prototype._draw
    WebGPUBackend.prototype._draw = function(renderObject, info, renderContextData, pipelineGPU, bindings, vertexBuffers, drawParams, passEncoderGPU, currentSets, cameraIndexSlot = -1)
    {
        if(!drawParams)
            return

        const toUint = (val, defaultVal = 0) =>
        {
            if(typeof val !== 'number' || Number.isNaN(val) || !Number.isFinite(val) || val < 0)
                return defaultVal
            return Math.floor(val)
        }

        const count = toUint(drawParams.vertexCount, 0)
        const instanceCount = toUint(drawParams.instanceCount, 1)
        const first = toUint(drawParams.firstVertex, 0)

        if(count === 0 || instanceCount === 0)
            return

        drawParams.vertexCount = count
        drawParams.instanceCount = instanceCount
        drawParams.firstVertex = first

        try
        {
            return origDraw.call(this, renderObject, info, renderContextData, pipelineGPU, bindings, vertexBuffers, drawParams, passEncoderGPU, currentSets, cameraIndexSlot)
        }
        catch(err)
        {
            console.warn('[WebGPU] Caught draw error on object:', renderObject?.object?.name || renderObject?.object?.type, err)
        }
    }
}

THREE.Object3D.prototype.copy = function( source, recursive = true )
{
    this.name = source.name;

    this.up.copy( source.up );

    this.position.copy( source.position );
    this.rotation.order = source.rotation.order;
    this.quaternion.copy( source.quaternion );
    this.scale.copy( source.scale );

    this.matrix.copy( source.matrix );
    this.matrixWorld.copy( source.matrixWorld );

    this.matrixAutoUpdate = source.matrixAutoUpdate;

    this.matrixWorldAutoUpdate = source.matrixWorldAutoUpdate;
    this.matrixWorldNeedsUpdate = source.matrixWorldNeedsUpdate;

    this.layers.mask = source.layers.mask;
    this.visible = source.visible;

    this.castShadow = source.castShadow;
    this.receiveShadow = source.receiveShadow;

    this.frustumCulled = source.frustumCulled;
    this.renderOrder = source.renderOrder;

    this.animations = source.animations.slice();

    // this.userData = JSON.parse( JSON.stringify( source.userData ) );

    if ( recursive === true ) {

        for ( let i = 0; i < source.children.length; i ++ ) {

            const child = source.children[ i ];
            this.add( child.clone() );

        }

    }

    return this;

}
