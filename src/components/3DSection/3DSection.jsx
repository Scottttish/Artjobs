import { useEffect, useRef } from 'react';
import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import './3DSection.css';

function ThreeDSection() {
  const canvasRef = useRef(null);
  const sectionRef = useRef(null);
  const isDragging = useRef(false);
  const previousMousePosition = useRef({ x: 0, y: 0 });
  const rotationVelocity = useRef({ x: 0, y: 0 });

  useEffect(() => {
    const canvasWidth = 600;
    const canvasHeight = 600;
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(75, canvasWidth / canvasHeight, 0.1, 1000);
    const renderer = new THREE.WebGLRenderer({ canvas: canvasRef.current, alpha: true });

    renderer.setSize(canvasWidth, canvasHeight);
    renderer.setPixelRatio(window.devicePixelRatio);
    camera.position.z = 20;

    const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
    scene.add(ambientLight);
    const directionalLight = new THREE.DirectionalLight(0xffffff, 1);
    directionalLight.position.set(5, 5, 5);
    scene.add(directionalLight);

    const loader = new GLTFLoader();
    let model;
    const modelPath = process.env.PUBLIC_URL + '/assets/my-model.glb'; 
    console.log('Trying to load model from:', modelPath);
    loader.load(
      modelPath,
      (gltf) => {
        console.log('Model loaded successfully:', gltf);
        model = gltf.scene;
        scene.add(model);

        const box = new THREE.Box3().setFromObject(model);
        const center = box.getCenter(new THREE.Vector3());
        model.position.sub(center);
        model.position.set(0, 0, 0);

        const size = box.getSize(new THREE.Vector3());
        const maxDim = Math.max(size.x, size.y, size.z);
        const scale = 10 / maxDim;
        model.scale.set(scale, scale, scale);
      },
      undefined,
      (error) => {
        console.error('Model loading error details:', error);
        console.log('Attempted URL:', modelPath);
        // Fallback to red cube
        model = new THREE.Mesh(
          new THREE.BoxGeometry(5, 5, 5),
          new THREE.MeshStandardMaterial({ color: 0xff0000 })
        );
        scene.add(model);
        console.warn('Fallback to red cube due to model loading failure');
      }
    );

    const animate = () => {
      requestAnimationFrame(animate);

      if (model) {
        if (!isDragging.current) {
          model.rotation.y += 0.01;

          model.rotation.x += rotationVelocity.current.x;
          model.rotation.y += rotationVelocity.current.y;

          rotationVelocity.current.x *= 0.95;
          rotationVelocity.current.y *= 0.95;

          model.rotation.x = Math.max(-Math.PI / 2, Math.min(Math.PI / 2, model.rotation.x));
        }
      }

      renderer.render(scene, camera);
    };
    animate();

    const onMouseDown = (event) => {
      isDragging.current = true;
      previousMousePosition.current = {
        x: event.clientX,
        y: event.clientY,
      };
      rotationVelocity.current.x = 0;
      rotationVelocity.current.y = 0;
    };

    const onMouseMove = (event) => {
      if (!isDragging.current || !model) return;

      const deltaMove = {
        x: event.clientX - previousMousePosition.current.x,
        y: event.clientY - previousMousePosition.current.y,
      };

      const rotationSpeed = 0.005;
      const deltaRotationX = deltaMove.y * rotationSpeed;
      const deltaRotationY = deltaMove.x * rotationSpeed;

      model.rotation.y += deltaRotationY;
      model.rotation.x += deltaRotationX;

      rotationVelocity.current.x = deltaRotationX * 0.05;
      rotationVelocity.current.y = deltaRotationY * 0.05;

      model.rotation.x = Math.max(-Math.PI / 2, Math.min(Math.PI / 2, model.rotation.x));

      previousMousePosition.current = {
        x: event.clientX,
        y: event.clientY,
      };
    };

    const onMouseUp = () => {
      isDragging.current = false;
    };

    window.addEventListener('mousedown', onMouseDown);
    window.addEventListener('mousemove', onMouseMove);
    window.addEventListener('mouseup', onMouseUp);

    const handleResize = () => {
      renderer.setSize(canvasWidth, canvasHeight);
      camera.aspect = canvasWidth / canvasHeight;
      camera.updateProjectionMatrix();
    };
    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('mousedown', onMouseDown);
      window.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('mouseup', onMouseUp);
      renderer.dispose();
    };
  }, []);

  return (
    <section className="ThreeDSection" ref={sectionRef}>
      <div className="ThreeDSection-model-container">
        <canvas ref={canvasRef} className="ThreeDSection-canvas" />
      </div>
      <div className="ThreeDSection-content">
        <h2>О нашем сайте</h2>
        <p>
          Здесь ты найдёшь всё, что нужно художнику: свежие арт-новости и актуальные вакансии - в одном месте.
        </p>
        <p>
          Следи за событиями в мире искусства: выставки, тренды, громкие инфоповоды. Всё под рукой, быстро и по делу.
        </p>
        <p>
          Параллельно можно искать работу: работодатели публикуют задания по категориям - рисунок, живопись, цифровое искусство, иллюстрация и др. Выбирай, откликайся, прикрепляй портфолио и вперед к новым проектам!
        </p>
        <p>
          Если ты хочешь быть в курсе и зарабатывать творчеством - ты по адресу.
        </p>
      </div>
    </section>
  );
}

export default ThreeDSection;
