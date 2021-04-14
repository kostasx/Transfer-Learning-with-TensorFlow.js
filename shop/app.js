// More API functions here:
// https://github.com/googlecreativelab/teachablemachine-community/tree/master/libraries/image


// the link to your model provided by Teachable Machine export panel
const URL       = "./my_model/";
const el        = document.querySelector('.checkout');
const openCtrl  = el.querySelector('.checkout__button');
const closeCtrl = el.querySelector('.checkout__cancel');
const success   = document.querySelector('#success');
const failure   = document.querySelector('#failure');
const scanEl    = document.querySelector(".scan");
const tbody     = document.querySelector("tbody");
const total     = document.querySelector(".checkout__total");
const threshold = 0.899;
const prices = [ 5, 8, 7 ];
const cart = {}

let model, labels, webcam, maxPredictions;

scanEl.addEventListener( "click", predict );

openCtrl.addEventListener('click', e => {
    e.preventDefault();
    init();
    el.classList.add("checkout--active")
}, { once: true });

// Load the image model and setup the webcam
async function init() {
    const modelURL = URL + "model.json";
    const metadataURL = URL + "metadata.json";

    // load the model and metadata
    // Refer to tmImage.loadFromFiles() in the API to support files from a file picker
    // or files from your local hard drive
    // Note: the pose library adds "tmImage" object to your window (window.tmImage)
    model = await tmImage.load(modelURL, metadataURL);
    maxPredictions = model.getTotalClasses();
    labels = model._metadata.labels;

    // Convenience function to setup a webcam
    webcam = new tmImage.Webcam(200, 200); // width, height
    await webcam.setup();   // Request access to the webcam
    await webcam.play();    // Start Camera

    const loadingButton = document.querySelector(".loading");
    loadingButton.removeAttribute("disabled");
    loadingButton.classList.remove("loading");
    loadingButton.textContent = "Scan";

    window.requestAnimationFrame(loop);

    // Append element to the DOM
    document.getElementById("webcam").appendChild(webcam.canvas);

    // Dirty trick to speed things up on the next product scan :)
    setTimeout( async ()=>{
        await model.predict(webcam.canvas);
    }, 1000);

}

async function loop() {
    webcam.update(); // update the webcam frame
    // await predict();
    window.requestAnimationFrame(loop);
}

function renderCart(){
    let tbodyContent = "";
    let totalCost = 0;
    Object.entries(cart).forEach(([key, value]) =>{
        totalCost += value.total;
        console.log( key, value );
        tbodyContent += `
            <tr>
                <td>${key} x ${value.items}</td>
                <td>${value.total}</td>
            </tr>
        `
    });
    total.textContent = totalCost;
    tbody.innerHTML = tbodyContent;
}

// Run the webcam image through the image model
async function predict() {
    // predict can take in an image, video or canvas html element
    const prediction = await model.predict(webcam.canvas);
    let hasCorrectPrediction = false;

    for ( let i = 0; i < maxPredictions; i++ ) {


        if ( prediction[i].probability > threshold ) {

            const predictedClassName = prediction[i].className;
            const index = labels.indexOf( predictedClassName );
            const product = document.querySelectorAll(".dummy-grid__item")[index];

            if ( product ){

                product.style.opacity = 1;
                product.classList.add("shake");
                hasCorrectPrediction = true;
                setTimeout(() => {
                    product.classList.remove("shake");
                }, 2000);
    
                const productInCart = cart[predictedClassName];
    
                // Update Shopping Cart
                if ( productInCart ){
    
                    productInCart.items++;
                    productInCart.total += prices[i];
    
                } else {
    
                    cart[predictedClassName] = {
                        items: 1,
                        total: prices[i]
                    }
    
                }
    
                renderCart();

            }

            // article.querySelector("p:first-child").textContent = parseInt(article.querySelector("p:last-child").textContent) + 1;
        } 

        console.log( 
            prediction[i].className + ": " + prediction[i].probability.toFixed(2) 
        );
    }
    if ( hasCorrectPrediction ){
        success.style.visibility = "visible";
        setTimeout(() => {
                success.style.visibility = "hidden";
            }, 2000)
    } else {
        failure.style.visibility = "visible";
        setTimeout(() => {
                failure.style.visibility = "hidden";
            }, 2000)
    }
}
