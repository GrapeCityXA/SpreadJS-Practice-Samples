let videoPreview = function(source){

    let div = document.createElement("div")
    div.innerHTML = 
        `<div class="vt-move-tip">
            点我查看演示视频
        </div>`;
    let host = div.firstChild;
    document.body.appendChild(host)

    let videoTemplate = 
        `<div class="vt-model">
            <video controls style="width:100%; height:100%">
                <source src="${source}">
            </video>
         </div>`;

    div = document.createElement("div")
    div.innerHTML = videoTemplate
    let videoModel = div.firstChild;
    let closeDiv = document.createElement("div");
    closeDiv.innerHTML = 
        `<div class="vt-close">
            ✖
        </div>`;
    let colseButton = closeDiv.firstChild;
    colseButton.onclick = function(){
        videoModel.style.visibility = "hidden"
        videoModel.querySelector("video").pause();
    }
    videoModel.appendChild(colseButton)
    document.body.appendChild(videoModel)

    host.onclick = function(){
        videoModel.style.visibility = "visible"
        videoModel.querySelector("video").play();
    }

}


export {
    videoPreview
}
