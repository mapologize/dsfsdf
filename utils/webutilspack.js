class webutilspack {
    constructor(){}

    fetchURLparams(param) {
        const queryString = window.location.search.substring(1);
        const urlParams = queryString.split('&');

        for (let i = 0; i < urlParams.length; i++) {
            const pair = urlParams[i].split('=');
            if (pair[0] === param) {
                return pair[1];
            }
        }

        return null;
    }
    
    humanInt(integer) {
        return integer.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',');
    }

    secondsToDHMS(seconds) {
        const days = Math.floor(seconds / (3600 * 24));
        const hours = Math.floor((seconds % (3600 * 24)) / 3600);
        const minutes = Math.floor((seconds % 3600) / 60);
        const remainingSeconds = seconds % 60;
        const timeParts = [];
        timeParts.push(`${days}`);
        timeParts.push(`${hours}`);
        timeParts.push(`${minutes}`);
        timeParts.push(`${remainingSeconds}`);
        return timeParts;
    }

    convertAPRtoAPY(APR, n) {
        const decimalAPR = APR / 100;
        const APY = Math.pow(1 + (decimalAPR / n), n) - 1;
        APY = APY * 100;
        return APY;
    }

    activeBTN(ElementId,flag) {
        if(flag){
            document.getElementById(ElementId).classList.remove('disabled');
        }else{
            document.getElementById(ElementId).classList.add('disabled');
        }
    }

    copyToClipboard(ElementId,Alert) {
        var element = document.getElementById(ElementId);
        var textNode = element.firstChild;
        const elem = document.createElement('textarea');
        elem.value = textNode.data;
        document.body.appendChild(elem);
        elem.select();
        document.execCommand('copy');
        document.body.removeChild(elem);
        alert(Alert);
    }

    setCookie(cname, cvalue, exdays) {
        const d = new Date();
        d.setTime(d.getTime() + (exdays * 24 * 60 * 60 * 1000));
        let expires = "expires=" + d.toUTCString();
        document.cookie = cname + "=" + cvalue + ";" + expires + ";path=/";
    }
    
    getCookie(cname) {
        let name = cname + "=";
        let ca = document.cookie.split(';');
        for (let i = 0; i < ca.length; i++) {
            let c = ca[i];
            while (c.charAt(0) == ' ') {
                c = c.substring(1);
            }
            if (c.indexOf(name) == 0) {
                return c.substring(name.length, c.length);
            }
        }
        return "";
    }
}
