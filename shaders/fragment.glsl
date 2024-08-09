uniform sampler2D uImage;
uniform float uTime;

varying vec2 vUv;

void main() {
  vec4 color = texture2D(uImage, vUv);
  gl_FragColor = color;
}
