import Phaser from 'phaser';

/**
 * UnrealPostFX — Post-Processing Shader Pipeline estilo Unreal Engine 5 / Octopath Traveler 2.5D.
 * Aplica Bloom (brilho suave), Tilt-Shift Depth of Field (profundidade de campo) e Vignette cinematográfico.
 */
export class UnrealPostFX extends Phaser.Renderer.WebGL.Pipelines.PostFXPipeline {
  private _bloomIntensity = 0.45;
  private _vignetteStrength = 0.35;

  constructor(game: Phaser.Game) {
    super({
      game,
      name: 'UnrealPostFX',
      fragShader: `
        precision mediump float;

        uniform sampler2D uMainSampler;
        uniform vec2 uResolution;
        uniform float uTime;
        uniform float uBloom;
        uniform float uVignette;

        varying vec2 outTexCoord;

        void main() {
          vec2 uv = outTexCoord;
          vec4 color = texture2D(uMainSampler, uv);

          // 1. Tilt-Shift Depth of Field (Desfoque suave no topo e rodapé estilo 2.5D HD-2D)
          float distFromCenterY = abs(uv.y - 0.5) * 2.0;
          float blurFactor = smoothstep(0.45, 1.0, distFromCenterY) * 0.0035;

          vec4 blurColor = vec4(0.0);
          blurColor += texture2D(uMainSampler, uv + vec2(-blurFactor, -blurFactor)) * 0.12;
          blurColor += texture2D(uMainSampler, uv + vec2(0.0, -blurFactor)) * 0.15;
          blurColor += texture2D(uMainSampler, uv + vec2(blurFactor, -blurFactor)) * 0.12;
          blurColor += texture2D(uMainSampler, uv + vec2(-blurFactor, 0.0)) * 0.15;
          blurColor += texture2D(uMainSampler, uv) * 0.22;
          blurColor += texture2D(uMainSampler, uv + vec2(blurFactor, 0.0)) * 0.15;
          blurColor += texture2D(uMainSampler, uv + vec2(-blurFactor, blurFactor)) * 0.12;
          blurColor += texture2D(uMainSampler, uv + vec2(0.0, blurFactor)) * 0.15;
          blurColor += texture2D(uMainSampler, uv + vec2(blurFactor, blurFactor)) * 0.12;

          vec4 finalColor = mix(color, blurColor, smoothstep(0.4, 0.95, distFromCenterY));

          // 2. Bloom / Light Glow (Brilho volumétrico de tochas e magias)
          vec3 brightPass = max(finalColor.rgb - vec3(0.65), vec3(0.0));
          finalColor.rgb += brightPass * uBloom;

          // 3. Cinematic Color Grading (Contraste rico estilo Unreal Engine)
          finalColor.rgb = pow(finalColor.rgb, vec3(0.92)); // Ajuste de Gamma
          finalColor.rgb = mix(finalColor.rgb, finalColor.rgb * vec3(1.05, 1.02, 0.96), 0.5); // Warm Tone Balance

          // 4. Vignette Cinematográfico nas bordas
          vec2 vignetteUV = uv * (1.0 - uv.yx);
          float vignette = vignetteUV.x * vignetteUV.y * 15.0;
          vignette = pow(vignette, uVignette);
          finalColor.rgb *= clamp(vignette, 0.2, 1.0);

          gl_FragColor = finalColor;
        }
      `,
    });
  }

  onPreRender(): void {
    this.set1f('uBloom', this._bloomIntensity);
    this.set1f('uVignette', this._vignetteStrength);
    this.set1f('uTime', this.game.loop.time / 1000);
    this.set2f('uResolution', this.renderer.width, this.renderer.height);
  }
}
