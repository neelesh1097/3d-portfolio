import * as THREE from 'three/webgpu'

// Global WebGPU IDL parameter sanitization and safety shield
function sanitizeUint(val, def) {
    if (typeof val !== 'number' || isNaN(val) || !isFinite(val) || val < 0) return def
    return Math.floor(val)
}

function patchEncoder(proto) {
    if (!proto) return
    if (typeof proto.draw === 'function' && !proto._drawPatched) {
        const origDraw = proto.draw
        proto.draw = function(vertexCount, instanceCount, firstVertex, firstInstance) {
            const vc = sanitizeUint(vertexCount, 0)
            const ic = sanitizeUint(instanceCount, 1)
            const fv = sanitizeUint(firstVertex, 0)
            const fi = sanitizeUint(firstInstance, 0)
            if (vc === 0 || ic === 0) return
            try {
                return origDraw.call(this, vc, ic, fv, fi)
            } catch(e) {
                console.warn('[WebGPU] Suppressed draw error:', e)
            }
        }
        proto._drawPatched = true
    }
    if (typeof proto.drawIndexed === 'function' && !proto._drawIndexedPatched) {
        const origDrawIndexed = proto.drawIndexed
        proto.drawIndexed = function(indexCount, instanceCount, firstIndex, baseVertex, firstInstance) {
            const ic = sanitizeUint(indexCount, 0)
            const instc = sanitizeUint(instanceCount, 1)
            const fi = sanitizeUint(firstIndex, 0)
            const bv = sanitizeUint(baseVertex, 0)
            const fin = sanitizeUint(firstInstance, 0)
            if (ic === 0 || instc === 0) return
            try {
                return origDrawIndexed.call(this, ic, instc, fi, bv, fin)
            } catch(e) {
                console.warn('[WebGPU] Suppressed drawIndexed error:', e)
            }
        }
        proto._drawIndexedPatched = true
    }
}

if (typeof window !== 'undefined') {
    if (typeof window.GPURenderPassEncoder !== 'undefined') patchEncoder(window.GPURenderPassEncoder.prototype)
    if (typeof window.GPURenderBundleEncoder !== 'undefined') patchEncoder(window.GPURenderBundleEncoder.prototype)
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
