const dropZone = document.querySelector('.drop-zone');
const fileInt = document.querySelector('#fileInt');
const browseBtn = document.querySelector('.browseBtn');

const progressContainer = document.querySelector('.progress-container');
const bgProgress = document.querySelector('.bg-progress');
const percentNo = document.querySelector('#percent');
const percentBar = document.querySelector('.percent-bar');

const sharingContainer = document.querySelector('.sharing-container');
const fileURL = document.querySelector('#fileURL');
const copyBtn = document.querySelector('#copyImg');

const emailForm = document.querySelector('#emailForm');

const popUp = document.querySelector('#popUp');

// URL FOR AJAX POST REQUEST
// const baseURL = "https://innshare.herokuapp.com";
const baseURL = "https://sharedoc-in.herokuapp.com";
const uploadURL = `${baseURL}/api/files`;
const emailURL = `${baseURL}/api/files/send`;

const maxAllowedSize = 100 * 1024 * 1024; // 100MB size only can allowed !

// Drop The Items -------->>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>
dropZone.addEventListener('dragover', (e) => {
    e.preventDefault();
    dropZone.classList.add('dragged');
})

dropZone.addEventListener('dragleave', (e) => {
    dropZone.classList.remove('dragged');
})

dropZone.addEventListener('drop', (e) => {

    e.preventDefault();
    dropZone.classList.remove('dragged');
    const files = e.dataTransfer.files;

    // console.log(files.length);
    // console.log(files);
    if (files.length) {
        fileInt.files = files;
        uploadFile();
    }

})

//------------------------------------------------
fileInt.addEventListener('change', () => {
    uploadFile();
})


// Choose file from browse------->>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>.
browseBtn.addEventListener('click', (e) => {
    fileInt.click();
})

//For copy link in dome----------->>>>>>>>>>>>>>>>>>>>>>>>>
copyBtn.addEventListener('click', () => {
    fileURL.select(); // for selecting value
    document.execCommand('copy');
    showPopUp("Copied to Clipboard")

})

// For Selecting the link on just clicking on docs link section or link --------------->>>>>>>>>.
fileURL.addEventListener("click", () => {
    fileURL.select();
});

// Uploding the data on server with the help of XHR object method
const uploadFile = () => {

    const file = fileInt.files;

    if (file.length > 1) {
        resetFileInt();
        showPopUp("Only Upload 1 File!");
        return;
    }
    console.log(file);
    console.log(file[0].size)
    if (file[0].size > maxAllowedSize) {
        showPopUp("Can't Upload more than 100MB !")
        resetFileInt();
        return;
    }

    const formData = new FormData();
    formData.append("myfile", file[0]);

    // show the uploader 
    progressContainer.style.display = 'block';

    // Creating XHR Object for Upload file 
    const xhr = new XMLHttpRequest();

    xhr.upload.onprogress = updateProgress;

    // Handle Error
    xhr.upload.onerror = () => {
        resetFileInt();
        showPopUp(`Error in upload : ${xhr.statusText}`);
    }

    // listen for response which will give the link for file
    xhr.onreadystatechange = () => {
        if (xhr.readyState === XMLHttpRequest.DONE) {
            // console.log(xhr.responseText);
            onFileUploadSuccess(xhr.responseText); //Function
            showPopUp("File Upload Successful");

        }
    }
    xhr.open('POST', uploadURL);
    xhr.send(formData);
}


// Function For Progress-Bar----------------------->>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>.
const updateProgress = (e) => {
    // console.log(e.loaded, e.total);
    let percent = Math.round((e.loaded / e.total) * 100);
    // console.log(percent);
    bgProgress.style.width = `${percent}%`;
    percentNo.innerText = percent;
    percentBar.style.width = `${percent}%`;
}


//Function for Showing Link in Dom--------------->>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>
const onFileUploadSuccess = (res) => {

    resetFileInt(); //reset the input
    status.innerText = "uploaded";

    // Remove the disabled attribute from Form btn & make text send
    emailForm[2].removeAttribute("disabled");
    emailForm[2].innerText = "Send";
    progressContainer.style.display = 'none'; //Hide the progress-Bar Box

    // console.log(res);
    console.log(JSON.parse(res));
    const { file: url } = JSON.parse(res);
    // console.log(url);
    sharingContainer.style.display = 'block';
    fileURL.value = url;
}


// reset FIle input------------------->>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>
const resetFileInt = () => {
    fileInt.value = "";
}


// SEND FIles Via EMAIl SENDer------------------->>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>
emailForm.addEventListener('submit', (e) => {
    e.preventDefault(); //stop submission 

    // Disable the send file button
    emailForm[2].setAttribute("disabled", "true");
    emailForm[2].innerText = "Sending";

    const url = fileURL.value;

    const formData = {
        uuid: url.split('/').splice(-1)[0],
        emailTo: emailForm.elements["toEmail"].value,
        emailFrom: emailForm.elements["fromEmail"].value,
    }

    console.table(formData);

    fetch(emailURL, {
            method: "POST",
            headers: {
                "content-Type": "application/json"
            },
            body: JSON.stringify(formData)
        })
        .then(res => res.json())
        .then((data) => {
            if (data.success) {
                showPopUp("Email Sent");
                sharingContainer.style.display = "none" //Hide the Shareing file Box
            }
        });
})


// SHow PopUp handle -------------->>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>
let popUpTimer;
const showPopUp = (msg) => {
    clearTimeout(popUpTimer);
    popUp.innerText = msg;
    popUp.style.display = "block";

    popUpTimer = setTimeout(() => {
        popUp.style.display = "none";
    }, 2000);
}