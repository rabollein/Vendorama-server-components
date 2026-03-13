"use strict";
function GSgetTimeRemaining(endtime){
    let dateformated = endtime;
    if (endtime.includes('-')) {
        dateformated = Date.parse(endtime);
    } else {
        const date = new Date(parseInt(endtime) * 1000);
        const formattedDate = date.toISOString().slice(0, 19)
        dateformated = Date.parse(formattedDate);
    }
    const total = dateformated - Date.parse(new Date());
    const seconds = Math.floor( (total/1000) % 60 );
    const minutes = Math.floor( (total/1000/60) % 60 );
    const hours = Math.floor( (total/(1000*60*60)) % 24 );
    const days = Math.floor( total/(1000*60*60*24) );

    return {
    total,
    days,
    hours,
    minutes,
    seconds
    };
}

var gccountdown = document.getElementsByClassName('gs-countdown');
for (let i = 0; i < gccountdown.length; i++) {
    let clock= gccountdown[i];
    let endtime = clock.dataset.endtime;
    let daysSpan = clock.querySelector('.days');
    let hoursSpan = clock.querySelector('.hours');
    let minutesSpan = clock.querySelector('.minutes');
    let secondsSpan = clock.querySelector('.seconds');
    function GSupdateClock(){
        let t = GSgetTimeRemaining(endtime);
        if(t.days < 10){
            daysSpan.innerHTML = ('0' + t.days).slice(-2);
        }else{
            daysSpan.innerHTML = t.days;
        }
        hoursSpan.innerHTML = ('0' + t.hours).slice(-2);
        minutesSpan.innerHTML = ('0' + t.minutes).slice(-2);
        secondsSpan.innerHTML = ('0' + t.seconds).slice(-2);
        if (t.total <= 0) {
            //clearInterval(timeinterval);
            daysSpan.innerHTML = hoursSpan.innerHTML = minutesSpan.innerHTML = secondsSpan.innerHTML = '00';
        }
    }
    GSupdateClock();
    var timeinterval = setInterval(GSupdateClock,1000);
}