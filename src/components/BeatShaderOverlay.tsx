import React, { useEffect, useRef } from 'react';

export const BeatShaderOverlay: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const gl = canvas.getContext('webgl');
    if (!gl) return;

    // Vertex Shader
    const vsSource = `
      attribute vec2 a_position;
      varying vec2 v_texcoord;
      void main() {
        gl_Position = vec4(a_position, 0.0, 1.0);
        v_texcoord = a_position * 0.5 + 0.5;
      }
    `;

    // Fragment Shader (Pulse and shift color)
    const fsSource = `
      precision mediump float;
      varying vec2 v_texcoord;
      uniform float u_time;
      uniform float u_beatIntensity;
      
      void main() {
        // Distance from center for vignette/pulse
        vec2 center = vec2(0.5, 0.5);
        float dist = distance(v_texcoord, center);
        
        // Base rhythmic color shifting (warm amber/orange/red tones)
        vec3 colorA = vec3(1.0, 0.4, 0.0);
        vec3 colorB = vec3(0.8, 0.1, 0.2);
        vec3 mixColor = mix(colorA, colorB, sin(u_time * 0.5) * 0.5 + 0.5);
        
        // The pulse expands from the edges or center
        float pulse = smoothstep(0.8, 0.2, dist) * u_beatIntensity;
        
        // Add subtle noise/wave
        float wave = sin(dist * 20.0 - u_time * 5.0) * 0.05 * u_beatIntensity;
        
        // Final alpha blends as a soft overlay
        float alpha = (pulse * 0.4 + wave * 0.1) * u_beatIntensity;
        
        gl_FragColor = vec4(mixColor, clamp(alpha, 0.0, 0.6));
      }
    `;

    const compileShader = (source: string, type: number) => {
      const shader = gl.createShader(type);
      if (!shader) return null;
      gl.shaderSource(shader, source);
      gl.compileShader(shader);
      return shader;
    };

    const vs = compileShader(vsSource, gl.VERTEX_SHADER);
    const fs = compileShader(fsSource, gl.FRAGMENT_SHADER);
    if (!vs || !fs) return;

    const program = gl.createProgram();
    if (!program) return;
    gl.attachShader(program, vs);
    gl.attachShader(program, fs);
    gl.linkProgram(program);
    gl.useProgram(program);

    const positionBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([
      -1, -1,
       1, -1,
      -1,  1,
      -1,  1,
       1, -1,
       1,  1,
    ]), gl.STATIC_DRAW);

    const positionLocation = gl.getAttribLocation(program, 'a_position');
    gl.enableVertexAttribArray(positionLocation);
    gl.vertexAttribPointer(positionLocation, 2, gl.FLOAT, false, 0, 0);

    const timeLoc = gl.getUniformLocation(program, 'u_time');
    const intensityLoc = gl.getUniformLocation(program, 'u_beatIntensity');

    let startTime = performance.now();
    let currentIntensity = 0.0;
    let targetIntensity = 0.0;
    let animationId: number;

    const handleBeat = (e: any) => {
      const step = e.detail?.step || 0;
      // Strong beat on 0 and 4, medium on 2 and 6
      if (step === 0 || step === 4) {
        targetIntensity = 1.0;
      } else if (step === 2 || step === 6) {
        targetIntensity = 0.5;
      } else {
        targetIntensity = 0.1;
      }
    };

    window.addEventListener('audioBeat', handleBeat);

    const resize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
      gl.viewport(0, 0, canvas.width, canvas.height);
    };
    window.addEventListener('resize', resize);
    resize();

    // Enable blending for transparent overlay
    gl.enable(gl.BLEND);
    gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);

    const render = (time: number) => {
      const elapsed = (time - startTime) / 1000;
      
      // Decay intensity
      currentIntensity += (targetIntensity - currentIntensity) * 0.1;
      targetIntensity *= 0.95; // decay the target to 0 so it falls off quickly

      gl.clearColor(0, 0, 0, 0);
      gl.clear(gl.COLOR_BUFFER_BIT);

      gl.uniform1f(timeLoc, elapsed);
      gl.uniform1f(intensityLoc, currentIntensity);

      gl.drawArrays(gl.TRIANGLES, 0, 6);
      
      animationId = requestAnimationFrame(render);
    };

    animationId = requestAnimationFrame(render);

    return () => {
      window.removeEventListener('audioBeat', handleBeat);
      window.removeEventListener('resize', resize);
      cancelAnimationFrame(animationId);
      gl.deleteProgram(program);
      gl.deleteShader(vs);
      gl.deleteShader(fs);
      gl.deleteBuffer(positionBuffer);
    };
  }, []);

  return (
    <canvas 
      ref={canvasRef} 
      className="fixed inset-0 w-full h-full pointer-events-none z-[100]"
      style={{ mixBlendMode: 'screen' }}
    />
  );
};
