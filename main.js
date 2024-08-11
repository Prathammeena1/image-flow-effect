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

    this.scene = new THREE.Scene();
    this.camera = new THREE.PerspectiveCamera(
      75,
      this.width/ this.height,
      100,
      2000
    );

    this.camera.position.z = 200;
    this.camera.fov = 2 * Math.atan(this.height / 2 / 200) * (180/Math.PI);

    this.renderer = new THREE.WebGLRenderer({
      antialias:true,
      alpha: true,
    });

    this.renderer.setPixelRatio(window.devicePixelRatio)
    this.renderer.setSize(this.width,this.height);
    this.container.appendChild(this.renderer.domElement);

    this.renderer.render(this.scene, this.camera)

    this.addImages();
    // this.setPosition()
    this.resize();
    this.setupResize();
    this.hoverOverLinks();
    this.render();
  }

  resize(){
    this.width = this.container.offsetWidth
    this.height = this.container.offsetHeight
    this.renderer.setSize(this.width,this.height)
    this.camera.aspect = (this.width / this.height)
    this.camera.updateProjectionMatrix();
    // this.setPosition()
    // this.addImages();
    this.render();
  }

  setupResize(){
    window.addEventListener('resize', this.resize.bind(this)); 

  }


  setPosition(){
    this.imageStore.forEach(img =>{
      const bounds = img.img.getBoundingClientRect()
      img.mesh.position.y = bounds.top + bounds.height / 2 - bounds.height / 2;
      img.mesh.position.x = bounds.left - bounds.width / 2 + bounds.width / 2;
    })
  }

  addImages(){
    const textureLoader = new THREE.TextureLoader();
    const textures = this.images.map(img => textureLoader.load(img.src));

    const uniforms = {
      uTime:{value:0},
      uTimeline:{value:0.2},
      uStartIndex:{value:0},
      uEndIndex:{value:1},
      uImage1:{value:textures[0]},
      uImage2:{value:textures[1]},
      uImage3:{value:textures[2]},
      uImage4:{value:textures[3]},
    }

    this.material = new THREE.ShaderMaterial({
      uniforms: uniforms,
      vertexShader:vertex,
      fragmentShader: fragment,
      transparent: true,
    })

    this.images.forEach(img => {
      const bounds = img.getBoundingClientRect();
      const geometry = new THREE.PlaneGeometry(bounds.width, bounds.height)
      const mesh = new THREE.Mesh(geometry,this.material);
      this.scene.add(mesh);


      this.imageStore.push({
        img: img,
        mesh: mesh,
        top: bounds.top,
        left: bounds.left,
        width: bounds.width,
        height: bounds.height,
      });

    })
  }



  hoverOverLinks() {
    const links = document.querySelectorAll('.links a');
    
    links.forEach((link, i) => {
        link.addEventListener('mouseover', () => {
            this.material.uniforms.uTimeline.value = 0.0;

            gsap.to(this.material.uniforms.uTimeline, {
                value: 40.0,
                duration: 2,
                onStart: () => {
                    this.uEndIndex = i;
                    this.material.uniforms.uStartIndex.value = this.uStartIndex;
                    this.material.uniforms.uEndIndex.value = this.uEndIndex;
                    this.uStartIndex = this.uEndIndex;
                }
            });
        });
        link.addEventListener('mouseout', () => {
            this.material.uniforms.uTimeline.value = 0.0;

            gsap.to(this.material.uniforms.uTimeline, {
                value: 0,
                duration: 2
            });
        });
    });
}






  render() {
    this.time+=.1;
    this.material.uniforms.uTime.value = this.time;
    this.renderer.render( this.scene, this.camera );
    window.requestAnimationFrame(this.render.bind(this));
  }
}

new Site({
  dom: document.querySelector(".canvas"),
});
