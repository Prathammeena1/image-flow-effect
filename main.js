import "./style.css";
import * as THREE from "three";
import vertex from "./shaders/vertex.glsl";
import fragment from "./shaders/fragment.glsl";
import gsap from "gsap";

class Site {
  constructor({ dom }) {
    this.time = 0;
    this.container = dom;
    this.width = window.innerWidth;
    this.height = window.innerHeight;
    this.images = [...dom.querySelectorAll(".images img")];
    this.material;
    this.imageStore = [];
    this.uStartIndex = 0;
    this.uEndIndex = 1;
    this.dropPosition = new THREE.Vector2(0.5, 0.5);
    this.isAnimating = false;

    this.scene = new THREE.Scene();
    this.camera = new THREE.PerspectiveCamera(
      75,
      this.width / this.height,
      100,
      2000
    );

    this.camera.position.z = 200;
    this.camera.fov = 2 * Math.atan(this.height / 2 / 200) * (180 / Math.PI);

    this.renderer = new THREE.WebGLRenderer({
      antialias: true,
      alpha: true,
    });

    this.renderer.setPixelRatio(window.devicePixelRatio);
    this.renderer.setSize(this.width, this.height);
    this.container.appendChild(this.renderer.domElement);

    this.renderer.render(this.scene, this.camera);

    this.addImages();
    // this.setPosition()

    this.resize();
    this.setupResize();
    this.render();



    
    function throttle(func, delay) {
      let lastTime = 0;
      
      return function(...args) {
        const now = new Date().getTime();
        if (now - lastTime >= delay) {
          func.apply(this, args);
          lastTime = now;
        }
      };
    }
    
    // Assuming `this.clickOnImage` is the function you want to throttle:
    this.renderer.domElement.addEventListener("mousemove", throttle((event) => {
      this.clickOnImage(event);
    }, 800));

  }



  resize() {
    this.width = this.container.offsetWidth;
    this.height = this.container.offsetHeight;
    this.renderer.setSize(this.width, this.height);
    this.camera.aspect = this.width / this.height;
    this.camera.updateProjectionMatrix();
    // this.setPosition()
    // this.addImages();
    this.render();
  }

  setupResize() {
    window.addEventListener("resize", this.resize.bind(this));
  }

  setPosition() {
    this.imageStore.forEach((img) => {
      const bounds = img.img.getBoundingClientRect();
      img.mesh.position.y = bounds.top + bounds.height / 2 - bounds.height / 2;
      img.mesh.position.x = bounds.left - bounds.width / 2 + bounds.width / 2;
    });
  }

  addImages() {
    const textureLoader = new THREE.TextureLoader();
    const textures = this.images.map((img) => textureLoader.load(img.src));

    const uniforms = {
      uTime: { value: 0 },
      uStrength: { value: 0.0 },
      uRadius: { value: 30.0 },
      uTimeline: { value: 0.2 },
      uStartIndex: { value: 0 },
      uEndIndex: { value: 1 },
      uImage1: { value: textures[0] },
      uImage2: { value: textures[1] },
      uImage3: { value: textures[2] },
      uImage4: { value: textures[3] },
      uDropPosition: { value: this.dropPosition },
    };

    this.material = new THREE.ShaderMaterial({
      uniforms: uniforms,
      vertexShader: vertex,
      fragmentShader: fragment,
      transparent: true,
    });

    this.images.forEach((img) => {
      const bounds = img.getBoundingClientRect();
      const geometry = new THREE.PlaneGeometry(bounds.width, bounds.height);
      const mesh = new THREE.Mesh(geometry, this.material);
      this.scene.add(mesh);

      this.imageStore.push({
        img: img,
        mesh: mesh,
        top: bounds.top,
        left: bounds.left,
        width: bounds.width,
        height: bounds.height,
      });
    });
  }

  clickOnImage(event) {
    const rect = this.renderer.domElement.getBoundingClientRect();
    const mouseX = (event.clientX - rect.left) / rect.width;
    const mouseY = (event.clientY - rect.top) / rect.height;

    // Update drop position based on click
    this.dropPosition.set(mouseX, 1.0 - mouseY); // Flip Y-axis to match WebGL coordinates
    this.material.uniforms.uDropPosition.value = this.dropPosition;


    const tl = gsap.timeline();
    tl.fromTo(
      this.material.uniforms.uRadius,
      {
        value: 15.0,
        duration: .6,
      },
      {
        value: 8.0,
        duration: .6,
      },'a'
    ).fromTo(
      this.material.uniforms.uStrength,
      {
        value: 0.1,
        duration: 1.0,
      },
      {
        value: 0.0,
        duration: 1.0,
      },'a'
    )
  }

  updateDropPosition() {
    this.material.uniforms.uDropPosition.value = new THREE.Vector2(
      Math.random(),
      Math.random()
    );
  }

  render() {
    this.time+=.5;
    this.material.uniforms.uTime.value = this.time;
    this.renderer.render(this.scene, this.camera);
    window.requestAnimationFrame(this.render.bind(this));
  }
}

new Site({
  dom: document.querySelector(".canvas"),
});
