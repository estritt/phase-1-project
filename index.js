const base_Url = 'https://api.unsplash.com/';
const myKey = accessKey;
const configObj = {
    headers: {
        'Authorization': `Client-ID ${myKey}`
    }
}


function getImage() {
    fetch(`${base_Url}photos/random`, configObj)
    .then(resp => resp.json())
    .then(imageObj => {debugger; renderImage(imageObj)});
}

function renderImage(imageObj) {
    const mainArtwork = document.getElementById('main-artwork').classList;
    if (mainArtwork != '') {mainArtwork.remove(...mainArtwork)}
    mainArtwork.add(imageObj.id)
   document.querySelector('#main-artwork img').src = imageObj.urls.raw + `&fit=clip&w=750&h=750`;
   
}

document.addEventListener('DOMContentLoaded', () => {
    const newImg = document.createElement('img');
    document.getElementById('main-artwork').append(newImg);
    getImage();

    const newImgBtn = document.getElementById('new-img-btn');
    newImgBtn.addEventListener('click', () => getImage());
})