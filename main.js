import "./style.css";
import * as THREE from "three";

class Site {
  constructor({ dom }) {
    this.container = dom;
    this.time = 0;
    this.width = window.innerWidth;
    this.height = window.innerHeight;
    this.images = [...dom.querySelectorAll(".images img")];
    this.material;
    this.imageStore = [];
    this.uStartIndex = 0;
    this.uEndIndex = 1;
    this.scene = new THREE.Scene();
    this.camera = new THREE.PerspectiveCamera(
      75,
      this.width / this.height,
      100,
      2000
    );
    this.camera.position.z = 200;
    this.camera.fov = 2*Math.atan(this.height / 2 /200) * (180 / Math.PI);


    this.renderer = new THREE.WebGLRenderer({
      antialias: true,
      alpha: true,
    });
    this.renderer.setSize(this.width, this.height);
    this.container.appendChild(this.renderer.domElement);

    this.renderer.render(this.scene, this.camera);

    this.addImages();
    this.render();
  }

  addImages(){
    const textureLoader = new THREE.TextureLoader()
    const textures = this.images.map(img => textureLoader.load(img));

    const uniforms = {
      uTime :{value:0},
      uImage:{value:textures[0]}
    }

    this.material = new THREE.ShaderMaterial({
      uniforms:uniforms,
      vertexShader:vertex,
      fragmentShader:fragment,
      transparent:true  
    })

    this.images.forEach(img =>{
      const bounds = img.getBoundingClientRect();
      const geometry = new THREE.PlaneGeometry(bounds.width, bounds.height);
      const mesh = new THREE.Mesh(geometry, this.material);

      this.scene.add(mesh)

      this.imageStore.push({
        img:img,
        mesh:mesh,
        top:bounds.top,
        left: bounds.left,
        width: bounds.width,
        height: bounds.height,
      })
    })

  }







  render() {
    this.time++;
    this.renderer.render( this.scene, this.camera );
    window.requestAnimationFrame(this.render.bind(this));
  }
}

new Site({
  dom: document.querySelector(".canvas"),
});
