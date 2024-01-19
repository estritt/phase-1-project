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
    .then(imageObj => renderImage(imageObj));
}

function renderImage(imageObj) {
    // const picDiv = document.getElementById('main');
    document.querySelector('#main-artwork img').src = imageObj.links.download;
}

document.addEventListener('DOMContentLoaded', () => {
    const newImg = document.createElement('img');
    document.getElementById('main-artwork').append(newImg);
    getImage();
})