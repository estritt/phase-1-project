const base_Url = 'https://api.unsplash.com/';
const myKey = accessKey;
const emptyHeart = "♡";
const fullHeart = "♥";
const jsonUrl = "http://localhost:3000/artwork/"
const configObj = {
    headers: {
        'Authorization': `Client-ID ${myKey}`
    }
}

document.addEventListener('DOMContentLoaded', () => {
    const newImg = document.createElement('img');
    document.getElementById('main-artwork').append(newImg);
    getRandImage();

    const newImgBtn = document.getElementById('new-img-btn');
    newImgBtn.addEventListener('click', () => getRandImage());

    fetch(jsonUrl)
    .then(resp => resp.json())
    .then(images => {
        for (let image of images) {createThumbnail(image);}
    });
})

function getRandImage() {
    fetch(`${base_Url}photos/random`, configObj)
    .then(resp => resp.json())
    .then(imageObj => {renderImage(imageObj)})
    .catch(() => {document.querySelector('#main-artwork img').src = 'placeholder.jpg';});
}

// making this variable and this function global allow removeEventListener in renderImage to find the right function instance
let selectedImageObj;
function forListener() {handleLike(selectedImageObj)}

function renderImage(imageObj) {
    selectedImageObj = imageObj;
    const mainArtwork = document.getElementById('main-artwork').classList;
    const id = imageObj.id;
    if (mainArtwork != '') {mainArtwork.remove(...mainArtwork);}
    mainArtwork.add(id);
    document.querySelector('#main-artwork img').src = imageObj.urls.raw + `&fit=clip&w=750&h=750`;
   
    likeBtn = document.getElementById("like-btn");
    likeBtn.textContent = emptyHeart;
    
    fetch(jsonUrl)
    .then(resp => resp.json())
    .then((images) => {
        const matchingImg = images.find((image) => image.id === id);
        if (matchingImg) {document.getElementById('num-likes').textContent = matchingImg.likes;}
        else {document.getElementById('num-likes').textContent = 0;}
    });

    likeBtn.removeEventListener('click', forListener);
    likeBtn.addEventListener('click', forListener);
}

function createThumbnail(newThumbnail) {
    //makes thumbnail and adds event listener with handleThumbnailClick as the callback function
    const thumbnailTab = document.getElementById('thumbnail-tab');
    const newThumbnailImg = document.createElement('img')
    const newThumbnailDiv = document.createElement('div');
    newThumbnailImg.src = newThumbnail.image;
    newThumbnailDiv.classList.add(newThumbnail.id);
    newThumbnailImg.addEventListener('click', (e) => handleThumbnailClick(e));
    thumbnailTab.prepend(newThumbnailDiv);
    document.querySelector(`[id='thumbnail-tab'] div[class='${newThumbnail.id}']`).append(newThumbnailImg);
}

function handleThumbnailClick(e) {
    //this renders the image in the main-artwork area
    const clickedThumbnail = e.target;
    const id = clickedThumbnail.parentNode.classList[0]
    fetch(`${base_Url}photos/${id}`, configObj)
    .then(resp => resp.json())
    .then(image => renderImage(image))
    .catch(err => window.alert(err.message));
}

function handleLike(imageObj) {
    fetch(jsonUrl)
    .then(resp => resp.json())
    .then((images) => {
        const oldLikes = parseInt(document.getElementById('num-likes').textContent);
        const newLikes = oldLikes + 1;
        const foundAnImg = images.find(image => image.id === imageObj.id)
        if (foundAnImg) {
            fetch(`${jsonUrl}${imageObj.id}`, {
                method: "PATCH",
                headers: {
                    "Content-Type": "application/json",
                    "Accept": "application/json"
                },
                body: JSON.stringify({
                    "likes": newLikes
                })
            });
            document.getElementById('num-likes').textContent = newLikes;
        } else {
            fetch(jsonUrl, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "Accept": "application/json"
                },
                body: JSON.stringify({
                    'id': imageObj.id,
                    'image': imageObj.urls.raw + `&fit=clip&w=100&h=100`,
                    'likes': 1,
                    'comments': [] 
                })
            })
            .then(resp => resp.json())
            .then(newThumbnail => {
                document.getElementById('num-likes').textContent = 1;
                createThumbnail(newThumbnail);
            });
        }
    })
}