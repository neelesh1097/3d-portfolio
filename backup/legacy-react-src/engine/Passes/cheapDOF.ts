import { hashBlur } from 'three/examples/jsm/tsl/display/hashBlur.js';
import { convertToTexture, Fn, mix, nodeObject, uniform, uv } from 'three/tsl';
import { Node } from 'three/webgpu';

class CheapDOFNode extends Node {
  static get type(): string {
    return 'CheapDOFNode';
  }

  textureNode: any;
  start = uniform(0.22);
  end = uniform(0.5);
  repeats = uniform(20);
  amount = uniform(0.0028);
  strength = uniform(1);

  constructor(textureNode: any) {
    super('vec4');
    this.textureNode = textureNode;
  }

  setup(): any {
    const outputNode = Fn(() => {
      const blurMask = uv()
        .y.sub(0.5)
        .abs()
        .smoothstep(this.start, this.end)
        .mul(this.strength);

      const blurOutput = hashBlur(this.textureNode, blurMask.mul(this.amount), {
        repeats: this.repeats,
        premultipliedAlpha: true,
      } as any);

      return mix(this.textureNode, blurOutput, blurMask);
    })();

    return outputNode;
  }
}

export const cheapDOF = (node: any): any => nodeObject(new CheapDOFNode(convertToTexture(node)));

