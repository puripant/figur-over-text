const maxWidth = 500;
const scaling = 2;

let text = document.getElementById('text');
let textbox = document.getElementById('textbox');
function update_text() {
  text.innerText = textbox.value;
}
update_text();

let size_slider = document.getElementById('size');
function update_size() {
  text.style.fontSize = size_slider.value + 'em';
}
update_size();

let option = 'grabcut';
let input, src, dst, dst2;
let width, height;

let imgElement = document.getElementById('image')
imgElement.onload = () => {
  input = cv.imread('image');
  cv.imshow('background', input);

  width = Math.min(input.cols, maxWidth);
  height = Math.min(input.rows, width * input.rows / input.cols);
  cv.resize(input, input, new cv.Size(width, height), 0, 0, cv.INTER_AREA);

  canvas.width = width;
  canvas.height = height;

  src = input.clone();
  cv.resize(src, src, new cv.Size(width/scaling, height/scaling), 0, 0, cv.INTER_AREA);
  cv.cvtColor(src, src, cv.COLOR_RGBA2RGB, 0);

  update(option);
}

let inputElement = document.getElementById('file');
inputElement.addEventListener('change', (e) => {
  imgElement.src = URL.createObjectURL(e.target.files[0]);
}, false);

function update(option) {
  switch(option) {
    case 'grabcut':
      // let face = detect_face();
      // console.log(face.x, face.y, face.width, face.height);
      grabcut(0.25*width, 0, 0.5*width, height);
      break;
    case 'removebg': break;
    case 'bodypix': break;
    case 'maskrcnn': break;
    default: break;
  }
}

// const faceCascadeFile = 'haarcascade_frontalface_default.xml';
// let faceCascade;
// function detect_face() {
//   let gray = new cv.Mat();
//   cv.cvtColor(src, gray, cv.COLOR_RGBA2GRAY, 0);
//   let faces = new cv.RectVector();
//   let msize = new cv.Size(0, 0);
//   faceCascade.detectMultiScale(gray, faces, 1.1, 3, 0, msize, msize);
//   let face_max;
//   let face_area_max = 0;
//   for (let i = 0; i < faces.size(); i++) {
//     let face = faces.get(i);
//     if (face.width * face.height > face_area_max) {
//       face_area_max = face.width * face.height;
//       face_max = face;
//     }
//   }

//   gray.delete();
//   faces.delete();

//   return face_max;
// }

function grabcut(a, b, w, h) {
  let mask = new cv.Mat();
  let bgdModel = new cv.Mat();
  let fgdModel = new cv.Mat();
  let rect = new cv.Rect(a/scaling, b/scaling, w/scaling, h/scaling);
  cv.grabCut(src, mask, rect, bgdModel, fgdModel, 2, cv.GC_INIT_WITH_RECT);

  dst = input.clone()
  for (let i = 0; i < src.rows; i++) {
    for (let j = 0; j < src.cols; j++) {
      // obvious & possible background; 1 & 3 for obvious and possible foreground
      if (mask.ucharPtr(i, j)[0] == 0 || mask.ucharPtr(i, j)[0] == 2) {
        for (let x = 0; x < scaling; x++) {
          for (let y = 0; y < scaling; y++) {
            dst.ucharPtr(scaling*i + x, scaling*j + y)[3] = 0;
          }
        }
      }
    }
  }
  cv.imshow('foreground', dst);
  dst.delete();
  mask.delete();
  bgdModel.delete();
  fgdModel.delete();
}

function onOpenCvReady() {
  inputElement.disabled = false;
  
  // let utils = new Utils('errorMessage');
  // faceCascade = new cv.CascadeClassifier();
  // utils.createFileFromUrl(faceCascadeFile, faceCascadeFile, () => {
  //   faceCascade.load(faceCascadeFile);
  // });
}

let canvas = document.getElementById('ui');
let ctx = canvas.getContext('2d');

let isDrawing = false;
let startX, startY, mouseX, mouseY;
let bound;

canvas.addEventListener("touchstart",  function(event) {event.preventDefault()})
canvas.addEventListener("touchmove",   function(event) {event.preventDefault()})
canvas.addEventListener("touchend",    function(event) {event.preventDefault()})
canvas.addEventListener("touchcancel", function(event) {event.preventDefault()})

canvas.addEventListener('mousedown', function(e) {
  isDrawing = true;
  canvas.style.cursor = 'crosshair';		

  bound = canvas.getBoundingClientRect();
	startX = e.clientX - bound.left;
	startY = e.clientY - bound.top;
}, false);
canvas.addEventListener('mousemove', function(e) {
  if (isDrawing) {
		mouseX = e.clientX - bound.left;
		mouseY = e.clientY - bound.top;				
		
		ctx.clearRect(0, 0, canvas.width, canvas.height);
		ctx.beginPath();
		ctx.rect(startX, startY, mouseX - startX, mouseY - startY);
		ctx.stroke();
	}
}, false);
canvas.addEventListener('mouseup', function(e) {
  isDrawing = false;
	canvas.style.cursor = 'default';

  grabcut(Math.min(startX, mouseX - startX), Math.min(startY, mouseY - startY), 
          Math.max(startX, mouseX - startX), Math.max(startY, mouseY - startY));
  ctx.clearRect(0, 0, canvas.width, canvas.height);
}, false);

let endX, endY;
canvas.addEventListener('touchstart', function(e) {	
  bound = canvas.getBoundingClientRect();
  if (startX) {
    endX = e.touches[0].clientX - bound.left;
	  endY = e.touches[0].clientY - bound.top;

    ctx.clearRect(0, 0, canvas.width, canvas.height);
		ctx.beginPath();
		ctx.rect(startX, startY, endX - startX, endY - startY);
		ctx.stroke();
  } else {
	  startX = e.touches[0].clientX - bound.left;
	  startY = e.touches[0].clientY - bound.top;
  }
}, false);
canvas.addEventListener('touchend', function(e) {
  if (startX && endX) {
    grabcut(Math.min(startX, endX), Math.min(startY, endY), 
            Math.max(startX, endX), Math.max(startY, endY));
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    startX = undefined;
    startY = undefined;
    endX = undefined;
    endY = undefined;
  }
}, false);