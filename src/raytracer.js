const canvas = document.getElementById("myCanvas");
const ctx = canvas.getContext("2d");
const image_data = ctx.getImageData(0, 0, canvas.width, canvas.height);
const viewport = {
  width: 1,
  height: 1,
};

const scene = {
  spheres: [
    {
      center: {x:0, y:-1, z:3},
      radius: 1,
      color: {r: 255, g: 0, b: 0},
      specular: 500,
    },
    {
      center: {x:2, y:0, z:4},
      radius: 1,
      color: {r: 0, g: 0, b: 255},
      specular: 500,
    },
    {
      center: {x:-2, y:0, z:4},
      radius: 1,
      color: {r: 0, g: 255, b: 0},
      specular: 10,
    },
    {
      center: {x: 0, y: -5001, z:0},
      radius: 5000,
      color: {r:255, g: 255, b:0},
      specular: 1000,
    }

  ],
  lights: [
    {
      type: "ambient",
      intensity: 0.15,
    },
    {
      type: "point",
      intensity: 0.65,
      point: {x: 2.5,y: 1,z: 0},
    },
    {
      type: "directional",
      intensity: 0.2,
      direction: {x: 1,y: 4,z: 4},
    }
  ]
}

const O = {x:0, y:0, z:0};

const d = 1 ;

for (let y = canvas.height/2; y >= -canvas.height/2; y--) {
  for(let x = -canvas.width/2; x <= canvas.width/2; x++) {
    let D = canvasToViewport(x, y) ;
    color = traceRay(O, D, 1, 10000);
    putPixel(x, y, color);
  }
};

ctx.putImageData(image_data, 0, 0);

function canvasToViewport(x, y) {
  return {x: x * viewport.width/canvas.width, y: y * viewport.height/canvas.height, z: d}
}

function traceRay(O, D, t_min, t_max) {
  let t_closest = t_max;
  let closest_sphere = null ;
  for (let sphere of scene.spheres) {
    const {t1, t2} = rayIntersection(D, sphere.center, sphere.radius) || {};
    if( t1 < t_max && t1 > t_min) {
      if (t1 < t_closest) {
        t_closest = t1 ;
        closest_sphere = sphere;
      }
    }
    if( t2 < t_max && t2 > t_min) {
      if (t2 < t_closest) {
        t_closest = t2 ;
        closest_sphere = sphere;
      }
    }
  }
  if(closest_sphere == null) {
    return {r: 0, g: 0, b: 0 };
  } else {
    let P = addVec(O, mulScalar(D, t_closest));
    let N = subVec(P, closest_sphere.center);
    N = normalize(N);
    return mulColor(closest_sphere.color, computeLighting(P, N));
  }
}

function mulColor(color, i) {
  return {r: color.r*i, g: color.g*i, b: color.b*i};
  
}

function mulScalar(A, k) {
  return {x: A.x * k, y: A.y * k, z: A.z * k};
}

function addVec(A, B) {
  return {x: A.x + B.x, y: A.y + B.y, z: A.z + B.z};
}

function subVec(A, B) {
  return {x: A.x - B.x, y: A.y - B.y, z: A.z - B.z};
}

function rayIntersection(D, C, r) {
  const DD = D.x * D.x + D.y * D.y + D.z * D.z;
  const OC = C.x * C.x + C.y * C.y + C.z * C.z;
  const a = DD ;
  const b = -2 * (D.x * C.x + D.y * C.y + D.z * C.z);
  const c = OC - r*r ;
  const delta = b*b - 4*a*c; 
  if (delta >= 0) {
    return {
      t1: (-b + Math.sqrt(delta))/(2 * a),
      t2: (-b - Math.sqrt(delta))/(2 * a)
    }
  }
  else {
    return null;
  }
}

function computeLighting(P, N) {
  let intensity = 0.0 ;
  let L = {} ;
  for (let light of scene.lights) {
    if(light.type == "ambient") {
      intensity += light.intensity ;
      continue;
    }
    else if(light.type == "point") {
      const point = light.point ;
      L = {x: point.x - P.x, y: point.y - P.y, z: point.z - P.z};
    }
    else if(light.type == "directional") {
      L = light.direction ;
    }
    L = normalize(L);
    let n_dot_l = dot(L, N) ;
    if(n_dot_l > 0) {
      intensity += light.intensity * n_dot_l ;
    }
  }
  console.log(intensity * 1.33);
  return intensity * 1.33;
}

function normalize(N) {
  let mag = magnitude(N);
  return {x: N.x/mag, y: N.y/mag, z: N.z/mag};
}

function magnitude (N) {
  return Math.sqrt(dot(N, N));
}

function dot(N, M) {
  return N.x * M.x + N.y * M.y + N.z * M.z ;
}

function putPixel(x, y, {r, g, b, a=255}) {
  const width = canvas.width ;
  const height = canvas.height ;
  const Sx = Math.floor(x + width/2) ;
  const Sy = Math.floor(height/2 - y) ;
  const index = (Sy * width + Sx) * 4 ;
  image_data.data[index] = r ;
  image_data.data[index + 1] = g ;
  image_data.data[index + 2] = b ;
  image_data.data[index + 3] = a ;
}
