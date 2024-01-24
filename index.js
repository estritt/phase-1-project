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
    getImage();

    const newImgBtn = document.getElementById('new-img-btn');
    newImgBtn.addEventListener('click', () => getImage());

    fetch(jsonUrl)
    .then(resp => resp.json())
    .then(images => {
        for (image of images) {createThumbnail(image);}
    });
})

function getImage() {
    fetch(`${base_Url}photos/random`, configObj)
    .then(resp => resp.json())
    .then(imageObj => {renderImage(imageObj)});
}

let selectedImageObj;
function forListener() {handleLike(selectedImageObj)}

function renderImage(imageObj) {
    selectedImageObj = imageObj;
    const mainArtwork = document.getElementById('main-artwork').classList;
    if (mainArtwork != '') {mainArtwork.remove(...mainArtwork)}
    mainArtwork.add(imageObj.id)
    document.querySelector('#main-artwork img').src = imageObj.urls.raw + `&fit=clip&w=750&h=750`;
   
    likeBtn = document.getElementById("like-btn");
    likeBtn.textContent = emptyHeart;
    const id = document.getElementById('main-artwork').classList[0];
    
    fetch(jsonUrl)
    .then(resp => resp.json())
    .then((images) => {
        const foundAnImg = images.find((image) => image.id === id);
        if (foundAnImg) {document.getElementById('num-likes').textContent = image.likes;}
        else {document.getElementById('num-likes').textContent = 0;}
        // the below code was simplified into the .find method
        // let foundAnImg = false; 
        // for (image of images) {
        //     if (image.id === id) {
        //         foundAnImg = true;
        //         document.getElementById('num-likes').textContent = image.likes
        //         break //prevents unecessary iterations after a match is found
        //     }
        // if (!foundAnImg) {document.getElementById('num-likes').textContent = 0}
        // }
    });

    likeBtn.removeEventListener('click', forListener);
    likeBtn.addEventListener('click', forListener);
        
        //check if id is in db.json, 
        //if no, post to db.json and create thumbnail of img
        //if yes, patch and change like count
        //update DOM regardless
}

function handleThumbnailClick() {
    //this will render the image with the corresponding ID in the main-artwork area
}

function createThumbnail(newThumbnail) {
    //makes thumbnail and adds event listener with handleThumbnailClick as the callback function
    const thumbnailTab = document.getElementById('thumbnail-tab');
    const newThumbnailImg = document.createElement('img')
    const newThumbnailDiv = document.createElement('div');
    newThumbnailImg.src = newThumbnail.image;
    newThumbnailDiv.classList.add(newThumbnail.id);
    //newThumbnailImg.addEventListener('click', (e) => handleThumbnailClick(e));
    thumbnailTab.prepend(newThumbnailDiv);
    document.querySelector(`[id='thumbnail-tab'] div[class='${newThumbnail.id}']`).append(newThumbnailImg);
    
    // thumbnailTab.prepend(newThumbnailImg);
}

function handleLike(imageObj) {
    fetch(jsonUrl)
    .then(resp => resp.json())
    .then((images) => {
        // commented code in handleLike is being replaced by a find method
        // let foundAnImg = false;
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
        // for (image of images) {
        //     if (image.id === imageObj.id) {
        //         foundAnImg = true;
        //         fetch(`${jsonUrl}${imageObj.id}`, {
        //             method: "PATCH",
        //             headers: {
        //                 "Content-Type": "application/json",
        //                 "Accept": "application/json"
        //             },
        //             body: JSON.stringify({
        //                 "likes": newLikes
        //                 //might not work as intended
        //             })
        //         })
        //         document.getElementById('num-likes').textContent = newLikes;
        //         break //prevents unecessary iterations after a match is found
        //     }
        // }
        // if (!foundAnImg) { 
        //     fetch(jsonUrl, {
        //         method: "POST",
        //         headers: {
        //             "Content-Type": "application/json",
        //             "Accept": "application/json"
        //         },
        //         body: JSON.stringify({
        //             'id': imageObj.id,
        //             'image': imageObj.urls.raw + `&fit=clip&w=100&h=100`,
        //             'likes': 1,
        //             'comments': [] 
        //         })
        //     })
        //     .then(resp => resp.json())
        //     .then(newThumbnail => {
        //         document.getElementById('num-likes').textContent = 1;
        //         createThumbnail(newThumbnail);
        //     });
        // }
    // })
}
      
    