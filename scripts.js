const video = document.querySelector('.player');
const canvas = document.querySelector('.photo');
const ctx = canvas.getContext('2d');
const strip = document.querySelector('.strip');
const snap = document.querySelector('.snap');

document.getElementById('original').checked = true;

const greenScreenToggle = document.getElementById('greenscreen');
const sliders = document.getElementById('sliders');


function getVideo(){
    navigator.mediaDevices.getUserMedia({ video: true, audio: false })
    .then(localMediaStream => {
        //console.log(localMediaStream);
        video.srcObject = localMediaStream; // different from Wes's tutorial, his suggested code was throwing an error. According to stack overflow CreateObjectURL is deprecated for chrome
        video.play();
    })
    .catch(function(err) {alert(err)});

}

function paintToCanvas(){
    const width = video.videoWidth;
    const height = video.videoHeight;
    canvas.width = width;
    canvas.height = height;

    return setInterval(() => {
        ctx.drawImage(video, 0, 0, width, height);

        //takes pixels out
        let pixels = ctx.getImageData(0, 0, width, height); // pixels will be reassigned to different colors, variable needs to be 'let'
        
        //mess with pixels
        if(document.getElementById('red').checked){
            pixels = redEffect(pixels);
        }

        if(document.getElementById('rgb').checked){
            pixels = rgbSplit(pixels);
            ctx.globalAlpha = 0.8; // stacks the frames for a blur effect
        }

        if(document.getElementById('greenscreen').checked){
            pixels = greenScreen(pixels);
        }

        if(document.getElementById('original').checked){
            pixels = clearEffects(pixels);
        }

        //puts pixels back
        ctx.putImageData(pixels, 0, 0);
        
    }, 16);
}

function takePhoto(){
    //plays shutter sound
    snap.currentTime = 0;
    snap.play();

    //takes the data out of canvas
    const data = canvas.toDataURL('image/JPEG');
    console.log(data);

    const link = document.createElement('a');
    link.href = data;
    link.setAttribute('download', 'pretty');
    link.innerHTML = `<img src = '${data}'>`;
    strip.insertBefore(link, strip.firstChild);

}
function clearEffects(pixels){
        for(let i=0; i < pixels.data.length; i+=4){
            pixels.data[i+0] = pixels.data[i+0]; // r
            pixels.data[i+1] = pixels.data[i+1];  // g
            pixels.data[i+2] = pixels.data[i+2]; // b
            //don't need to change a
     }
     document.querySelector('.rgb').style.display = "none"; // greenscreen sliders not visible by default

    return pixels;
}



function redEffect(pixels){
    for(let i=0; i < pixels.data.length; i+=4){
        pixels.data[i+0] = pixels.data[i+0] + 75; // r
        pixels.data[i+1] = pixels.data[i+1] - 70;  // g
        pixels.data[i+2] = pixels.data[i+2] + 75; // b          
    }
    document.querySelector('.rgb').style.display = "none"; // greenscreen sliders not visible by default

    return pixels;
}

function rgbSplit(pixels){
    for(let i=0; i < pixels.data.length; i+=4){
        pixels.data[i-150] = pixels.data[i+0]; // r
        pixels.data[i+500] = pixels.data[i+1]; // g
        pixels.data[i-500] = pixels.data[i+2]; // b
        //don't need to change a
    }
    document.querySelector('.rgb').style.display = "none"; // greenscreen sliders not visible by default

    return pixels;
}

function greenScreen(pixels){
    const levels = {};

    document.querySelectorAll('.rgb input').forEach((input) => { 
        levels[input.name] = input.value; 
    });

    //console.log(levels);

    for(let i=0; i < pixels.data.length; i+=4){
        red = pixels.data[i+0];
        green = pixels.data[i+1];
        blue = pixels.data[i+2];

        if(red >= levels.rmin
            && green >= levels.gmin
            && blue >= levels.bmin
            && red <= levels.rmax
            && green <= levels.gmax
            && blue <= levels.bmax){
                //take it out!
                pixels.data[i+3]=0;
            }
    
        
        
    }
    document.querySelector('.rgb').style.display = "block";
    return pixels;
    
}
document.querySelector('.rgb').style.display = "none"; // greenscreen sliders not visible by default

getVideo();

video.addEventListener('canplay',paintToCanvas); //listens for when video in corner is playing and automatically will paint to canvas