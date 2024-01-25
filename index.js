const baseUrl = 'https://api.unsplash.com/';
const myKey = accessKey;
const emptyHeart = "♡";
const fullHeart = "♥";
const jsonUrl = "http://localhost:3000/artwork/"
const configObj = {
    headers: {
        'Authorization': `Client-ID ${myKey}`,
        "Content-Type": "application/json",
        "Accept": "application/json"
    }
}

document.addEventListener('DOMContentLoaded', () => {
    const newImg = document.createElement('img');
    document.getElementById('main-artwork').append(newImg);
    getRandImage();

    const newImgBtn = document.getElementById('new-img-btn');
    newImgBtn.addEventListener('click', () => getRandImage());

    const submitComment = document.getElementById('comment-form');
    submitComment.addEventListener('submit', (e) => handleComment(e));

    document.querySelector('#main-artwork img').addEventListener('dblclick', getRandImage);

    fetch(jsonUrl)
    .then(resp => resp.json())
    .then(images => {
        for (let image of images) {createThumbnail(image);}
    });
})

function getRandImage() {
    fetch(`${baseUrl}photos/random`, configObj)
    .then(resp => resp.json())
    .then(imageObj => {renderImage(imageObj)})
    .catch(() => {document.querySelector('#main-artwork img').src = 'placeholder.jpg';});
}

// making this variable and this function global allow removeEventListener in renderImage to find the right function instance
let selectedImageObj;
function forListener() {handleLike(selectedImageObj)}
function forListenerUn() {handleUnlike(selectedImageObj)}

function renderImage(imageObj) {
    selectedImageObj = imageObj;
    const mainArtworkId = document.getElementById('main-artwork').classList;
    const id = imageObj.id;
    if (mainArtworkId) {mainArtworkId.remove(...mainArtworkId);}
    mainArtworkId.add(id);
    const mainArtworkImg = document.querySelector('#main-artwork img');
    mainArtworkImg.src = imageObj.urls.raw + `&fit=clip&w=750&h=750`; 
    mainArtworkImg.title = imageObj.alt_description;


    likeBtn = document.getElementById("like-btn");
    likeBtn.textContent = emptyHeart;
    
    document.getElementById('existing-comments').innerHTML = '';
    fetch(jsonUrl)
    .then(resp => resp.json())
    .then((images) => {
        const matchingImg = images.find((image) => image.id === id);
        if (matchingImg) {
            document.getElementById('num-likes').textContent = matchingImg.likes; 
            matchingImg.comments.forEach(comment => {
                const newComment = document.createElement('div');
                newComment.className = 'comment';
                newComment.textContent = comment;
                document.getElementById('existing-comments').prepend(newComment);
            });
        }
        else {
            document.getElementById('num-likes').textContent = 0;
        }
    });
    likeBtn.removeEventListener('click', forListener);
    likeBtn.removeEventListener('click', forListenerUn);
    likeBtn.addEventListener('click', forListener);
}

function handleComment(e) {
    e.preventDefault();
    const newComment = document.createElement('div');
    newComment.className = 'comment';
    const newCommentText = document.getElementById('comment-form-text').value;
    newComment.textContent = newCommentText
    document.getElementById('existing-comments').prepend(newComment);
    document.getElementById('comment-form-text').value = '';
    const id = document.getElementById('main-artwork').className;
    fetch(jsonUrl) //maybe you can use if (fetch) to check if something is in a json, which would be simpler
    .then(resp => resp.json())
    .then((images) => {
        const foundAnImg = images.find(image => image.id === id)
        if (foundAnImg) {
            let previousComments;
            fetch(`${jsonUrl}${id}`)
            .then(resp => resp.json())
            .then(imageObj => {
                previousComments = imageObj.comments;
                const allComments = [...previousComments, newCommentText];
                fetch(`${jsonUrl}${id}`, {
                    method: "PATCH",
                    headers: {
                        "Content-Type": "application/json",
                        "Accept": "application/json"
                    },
                    body: JSON.stringify({
                        "comments": allComments
                    })
                });
            });
        } else {
            fetch(jsonUrl, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "Accept": "application/json"
                },
                body: JSON.stringify({
                    'id': id,
                    'image': selectedImageObj.urls.raw + `&fit=clip&w=100&h=100`, //unfortunately i don't know how to do this without either doing another fetch or using the global variable
                    'likes': 0,
                    'comments': [newCommentText]
                })
            })
            .then(resp => resp.json())
            .then(newThumbnail => {
                createThumbnail(newThumbnail);
            });
        }
    });
}

function createThumbnail(newThumbnail) {
    //makes thumbnail and adds event listener with handleThumbnailClick as the callback function
    const thumbnailTab = document.getElementById('thumbnail-tab');
    const newThumbnailImg = document.createElement('img');
    const newThumbnailDiv = document.createElement('div');
    newThumbnailImg.src = newThumbnail.image;
    newThumbnailDiv.classList.add(newThumbnail.id);
    newThumbnailImg.addEventListener('click', (e) => handleThumbnailClick(e));
    newThumbnailDiv.addEventListener('mouseover', (e) => e.target)
    thumbnailTab.prepend(newThumbnailDiv);
    document.querySelector(`[id='thumbnail-tab'] div[class='${newThumbnail.id}']`).append(newThumbnailImg);
}

function handleThumbnailClick(e) {
    //this renders the image in the main-artwork area
    const clickedThumbnail = e.target;
    const id = clickedThumbnail.parentNode.classList[0]
    fetch(`${baseUrl}photos/${id}`, configObj)
    .then(resp => resp.json())
    .then(image => renderImage(image))
    .catch(err => window.alert(err.message));
}

function handleLike(imageObj) {
    likeBtn.textContent = fullHeart;
    likeBtn.removeEventListener('click', forListener); //prevents multiple likes (until you rerender the image at least)
    likeBtn.addEventListener('click', forListenerUn)
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

function handleUnlike(imageObj) {
    likeBtn.textContent = emptyHeart;
    likeBtn.removeEventListener('click', forListenerUn); 
    likeBtn.addEventListener('click', forListener)
    fetch(jsonUrl)
    .then(resp => resp.json())
    .then((images) => {
        const oldLikes = parseInt(document.getElementById('num-likes').textContent);
        const newLikes = oldLikes - 1;
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
    })
}