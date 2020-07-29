const maxWidth = 500;
const scaling = 2;

let option = 'grabcut';
let input, src, dst, dst2;
let width, height;

let imgElement = document.getElementById('image')
imgElement.onload = () => {
  input = cv.imread('image');
  // cv.imshow('background', input);

  width = Math.min(input.cols, maxWidth);
  height = Math.min(input.rows, width * input.rows / input.cols);
  cv.resize(input, input, new cv.Size(width, height), 0, 0, cv.INTER_AREA);

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
      grabcut();
      break;
    case 'removebg': break;
    case 'bodypix': break;
    case 'maskrcnn': break;
    default: break;
  }
}
function grabcut() {
  let mask = new cv.Mat();
  let bgdModel = new cv.Mat();
  let fgdModel = new cv.Mat();
  // let rect = new cv.Rect(100/scaling, 50/scaling, 200/scaling, 800/scaling); //running-man
  // let rect = new cv.Rect(80/scaling, 50/scaling, 300/scaling, 800/scaling); //running-pair //bad result
  // let rect = new cv.Rect(200/scaling, 0/scaling, 150/scaling, 800/scaling); //running-woman //bad result
  let rect = new cv.Rect(80/scaling, 100/scaling, 320/scaling, 800/scaling); //workout
  // let rect = new cv.Rect(50/scaling, 100/scaling, 400/scaling, 1000/scaling); //goongging
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

  let color = new cv.Scalar(0, 0, 255);
  let point1 = new cv.Point(rect.x*scaling, rect.y*scaling);
  let point2 = new cv.Point(rect.x*scaling + rect.width*scaling, rect.y*scaling + rect.height*scaling);
  cv.rectangle(input, point1, point2, color);
  cv.imshow('background', input);
}

function onOpenCvReady() {
  inputElement.disabled = false;
}