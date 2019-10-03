// important order for these functions
function setCookie(cname, cvalue, exdays) {
    var d = new Date();
    d.setTime(d.getTime() + (exdays*24*60*60*1000));
    var expires = "expires="+ d.toUTCString();
    document.cookie = cname + "=" + cvalue + ";" + expires;// + ",path=/";
}

function getCookie(cname) {
    var name = cname + "=";
    var decodedCookie = decodeURIComponent(document.cookie);
    var ca = decodedCookie.split(';');
    for(var i = 0; i <ca.length; i++) {
        var c = ca[i];
        while (c.charAt(0) == ' ') {
            c = c.substring(1);
        }
        if (c.indexOf(name) == 0) {
            return c.substring(name.length, c.length);
        }
    }
    return "";
}

// important order after here !
var counter = 0, total = Number(getCookie("total")), cookieCounter = Number(getCookie("counter")),
totalDiv = document.getElementById("total"),
progress = document.getElementById("Progress"),
progressSpan = document.getElementById("progressSpan"),
progressIncBy = 1;

function init() { 
    // console.log("cookie", document.cookie);
    // console.log("counter", cookieCounter);
    if( cookieCounter == 0 || !cookieCounter){
        // numberDiv.innerHTML = '<span id="startSpan">START!</span>';
        setProgress(0);
    }else{
        counter = cookieCounter;                    
        // numberDiv.textContent = counter;
        setProgress(counter);
    }
    totalDiv.textContent = total;
}

function increaseCounter(){
    counter++; // console.log(counter);
    total++;
    if(counter % 10 == 0){
        // numberDiv.textContent = counter;
        setProgress(counter);
    }else{
        setProgress(counter, false);
    }
    if(total % 100 == 0){
        totalDiv.textContent = total;
        setProgress(0, false);
    }
    setCookie("counter", counter, 30);
    setCookie("total", total, 3650);
}

function setProgress(number, withNumber=true){ 
    if(withNumber){
        progressSpan.textContent = number; 
    }
    progress.className = 'c100 big dark';
    progress.classList.add('p'+number%100);
}

function reset(){ 
    counter = 0; 
    setProgress(0);
    setCookie("counter", counter, 30);
    // numberDiv.textContent = counter;
}

window.onload = init();

/* 
    TODO:
    - add button for config, that shows a panel to manage states
    - a state will have own counter
    - states can be created with a title
    - cookie values are saved for today, week, month, and all-time, for each state
    - graphs are shown for each state
*/