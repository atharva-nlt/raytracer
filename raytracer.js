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
    },
    {
      center: {x:2, y:0, z:4},
      radius: 1,
      color: {r: 0, g: 0, b: 255},
    },
    {
      center: {x:-2, y:0, z:4},
      radius: 1,
      color: {r: 0, g: 255, b: 0},
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
    return closest_sphere.color;
  }
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
