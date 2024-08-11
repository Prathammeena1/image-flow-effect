uniform float uTime;
uniform sampler2D uImage1;
uniform sampler2D uImage2;
uniform sampler2D uImage3;
uniform sampler2D uImage4;
uniform vec2 uDropPosition; // Pass the random drop position

varying vec2 vUv;

void main() {
    vec2 uv = vUv;

    // Calculate distance from the drop position
    float dist = distance(uv, uDropPosition);

    // Create a single ripple effect based on distance and time
    float ripple = sin(dist * 150.0 - uTime * 3.);
    ripple *= exp(-dist *10.0); // Attenuation over distance

    // Apply the ripple effect to the UV coordinates
    uv += normalize(uv - uDropPosition) * ripple * 0.1; // Adjust the strength of the distortion

    // Check if the UV coordinates are outside the texture
    if (uv.x < 0.0 || uv.y < 0.0 || uv.x > 1.0 || uv.y > 1.0) {
        discard;
    }

    // Sample the texture using the distorted UVs
    gl_FragColor = texture2D(uImage1, uv);
}
