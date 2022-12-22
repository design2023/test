let camera, scene, renderer, startTime, object, loader;

init();
animate();

function init() {

	camera = new PerspectiveCamera(36, window.innerWidth / window.innerHeight, 0.25, 16);

	camera.position.set(0, 1.3, 3);

	scene = new Scene();

	// Lights
	loader = new GLTFLoader();
	scene.add(new AmbientLight(0x505050));

	const spotLight = new SpotLight(0xffffff);
	spotLight.angle = Math.PI / 5;
	spotLight.penumbra = 0.2;
	spotLight.position.set(2, 3, 3);
	spotLight.castShadow = true;
	spotLight.shadow.camera.near = 3;
	spotLight.shadow.camera.far = 10;
	spotLight.shadow.mapSize.width = 1024;
	spotLight.shadow.mapSize.height = 1024;
	scene.add(spotLight);

	const dirLight = new DirectionalLight(0x55505a, 1);
	dirLight.position.set(0, 3, 0);
	dirLight.castShadow = true;
	dirLight.shadow.camera.near = 1;
	dirLight.shadow.camera.far = 10;

	dirLight.shadow.camera.right = 1;
	dirLight.shadow.camera.left = - 1;
	dirLight.shadow.camera.top = 1;
	dirLight.shadow.camera.bottom = - 1;

	dirLight.shadow.mapSize.width = 1024;
	dirLight.shadow.mapSize.height = 1024;
	scene.add(dirLight);
	let x = -2;
	let z = 0;
	// test glb
	let json;
	for (let index = 0; index < 100; index++) {
		loader.load(
			"./scroll_animation.glb", async function (gltf) {

				let Objobject = gltf.scene;

				Objobject.position.x = x;
				Objobject.position.z = 0;
				x += 0.3
				Objobject.userData = Objobject;
				scene.add(Objobject);

			});
		if (index == 99) {
			console.log('scene before save', scene);
			json = scene.toJSON();
			console.log('json saved', json);
			for (let j = 10; j < scene.children.length-10; j++) {
				scene.remove(scene.children[j--]);
			}
		}

	}

	setTimeout(() => {
		console.log('scene before restore', scene);
		scene = new ObjectLoader().parse(json);
		console.log('scene after restore', scene);

	}, 30000);




	////



	// ***** Clipping planes: *****

	const localPlane = new Plane(new Vector3(0, - 1, 0), 0.8);
	const globalPlane = new Plane(new Vector3(- 1, 0, 0), 0.1);

	// Geometry

	const material = new MeshPhongMaterial({
		color: 0x80ee10,
		shininess: 100,
		side: DoubleSide,

		// ***** Clipping setup (material): *****
		clippingPlanes: [localPlane],
		clipShadows: true

	});

	const geometry = new TorusKnotGeometry(0.4, 0.08, 95, 20);

	object = new Mesh(geometry, material);
	object.castShadow = true;
	// scene.add( object );

	const ground = new Mesh(
		new PlaneGeometry(9, 9, 1, 1),
		new MeshPhongMaterial({ color: 0xa0adaf, shininess: 150 })
	);

	ground.rotation.x = - Math.PI / 2; // rotates X/Y to X/Z
	ground.receiveShadow = true;
	scene.add(ground);



	// Renderer

	renderer = new WebGLRenderer();
	renderer.shadowMap.enabled = true;
	renderer.setPixelRatio(window.devicePixelRatio);
	renderer.setSize(window.innerWidth, window.innerHeight);
	window.addEventListener('resize', onWindowResize);
	document.body.appendChild(renderer.domElement);

	// ***** Clipping setup (renderer): *****
	const globalPlanes = [globalPlane],
		Empty = Object.freeze([]);
	renderer.clippingPlanes = Empty; // GUI sets it to globalPlanes
	renderer.localClippingEnabled = true;

	// Controls

	const controls = new OrbitControls(camera, renderer.domElement);
	controls.target.set(0, 1, 0);
	controls.update();



	// Start

	startTime = Date.now();

}

function onWindowResize() {

	camera.aspect = window.innerWidth / window.innerHeight;
	camera.updateProjectionMatrix();

	renderer.setSize(window.innerWidth, window.innerHeight);

}

function animate() {

	const currentTime = Date.now();
	const time = (currentTime - startTime) / 1000;

	requestAnimationFrame(animate);

	// object.position.y = 0.8;
	// object.rotation.x = time * 0.5;
	// object.rotation.y = time * 0.2;
	// object.scale.setScalar(Math.cos(time) * 0.125 + 0.875);


	renderer.render(scene, camera);


}