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


function getImage() {
    fetch(`${base_Url}photos/random`, configObj)
    .then(resp => resp.json())
    .then(imageObj => {renderImage(imageObj)});
}

function renderImage(imageObj) {
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
        document.getElementById('num-likes').textContent = 0
        for (image of images) {
            if (image.id === id) {
                document.getElementById('num-likes').textContent = image.likes
            //adding another for loop to add comments to DOM
            }
        }
    });
    likeBtn.addEventListener('click', () => handleLike(imageObj));
        
        //check if id is in db.json, 
        //if no, post to db.json and create thumbnail of img
        //if yes, patch and change like count
        //update DOM regardless
}


document.addEventListener('DOMContentLoaded', () => {
    const newImg = document.createElement('img');
    document.getElementById('main-artwork').append(newImg);
    getImage();

    const newImgBtn = document.getElementById('new-img-btn');
    newImgBtn.addEventListener('click', () => getImage());
})

function handleThumbnailClick() {
    //this will render the image with the corresponding ID in the main-artwork area
}

function createThumbnail(newThumbnail) {
    //makes thumbnail and adds event listener with handleThumbnailClick as the callback function
    const thumbnailTab = document.getElementById('thumbnail-tab');
    const newThumbnailImg = document.createElement('img')
    newThumbnailImg.src = newThumbnail.image;
    newThumbnailImg.classList.add(newThumbnail.id);
    //newThumbnailImg.addEventListener('click', (e) => handleThumbnailClick(e));
    thumbnailTab.prepend(newThumbnailImg);
}

function handleLike(imageObj) {
    fetch(jsonUrl)
    .then(resp => resp.json())
    .then((images) => {
        let foundAnImg = false;
        for (image of images) {
            if (image.id === imageObj.id) {
                foundAnImg = true;
                fetch(`${jsonUrl}${imageObj.id}`, {
                    method: "PATCH",
                    headers: {
                        "Content-Type": "application/json",
                        "Accept": "application/json"
                    },
                    body: JSON.stringify({
                        "likes": parseInt(document.getElementById('num-likes').textContent) + 1
                        //might not work as intended
                    })
                })
                const numLikes = parseInt(document.getElementById('num-likes').textContent);
                numLikes += 1;
                document.getElementById('num-likes') = numLikes;
            }
        }
        if (!foundAnImg) { debugger
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
      
    