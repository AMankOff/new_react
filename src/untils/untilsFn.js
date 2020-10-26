export const getUrlParam=(name)=>{
    let reg = new RegExp("(^|&)" + name + "=([^&]*)(&|$)");
    let r = window.location.search.substr(1).match(reg);
    if (r !== null) return unescape(r[2]); return null;
}

export const convertCurrency = money => {
    // 汉字的数字
    let cnNums = ['零', '壹', '贰', '叁', '肆', '伍', '陆', '柒', '捌', '玖']
    // 基本单位
    let cnIntRadice = ['', '拾', '佰', '仟']
    // 对应整数部分扩展单位
    let cnIntUnits = ['', '万', '亿', '兆']
    // 对应小数部分单位
    let cnDecUnits = ['角', '分', '毫', '厘']
    // 整数金额时后面跟的字符
    let cnInteger = '整';
    // 整型完以后的单位
    let cnIntLast = '元';
    // 最大处理的数字
    let maxNum = 999999999999999.9999;
    // 金额整数部分
    let integerNum;
    // 金额小数部分
    let decimalNum;
    // 输出的中文金额字符串
    let chineseStr = '';
    // 分离金额后用的数组，预定义
    let parts;
    if (money === '') {
        return '';
    }
    money = parseFloat(money);
    if (money >= maxNum) {
        // 超出最大处理数字
        return '超出最大处理数字';
    }
    if (money === 0) {
        chineseStr = cnNums[0] + cnIntLast + cnInteger;
        return chineseStr;
    }
    // 转换为字符串
    money = money.toString();
    if (money.indexOf('.') === -1) {
        integerNum = money;
        decimalNum = '';
    } else {
        parts = money.split('.');
        integerNum = parts[0];
        decimalNum = parts[1].substr(0, 4);
    }
    // 获取整型部分转换
    if (parseInt(integerNum, 10) > 0) {
        let zeroCount = 0;
        let IntLen = integerNum.length;
        for (let i = 0; i < IntLen; i++) {
            let n = integerNum.substr(i, 1);
            let p = IntLen - i - 1;
            let q = p / 4;
            let m = p % 4;
            if (n === '0') {
                zeroCount++;
            } else {
                if (zeroCount > 0) {
                    chineseStr += cnNums[0];
                }
                // 归零
                zeroCount = 0;
                chineseStr += cnNums[parseInt(n)] + cnIntRadice[m];
            }
            if (m === 0 && zeroCount < 4) {
                chineseStr += cnIntUnits[q];
            }
        }
        chineseStr += cnIntLast;
    }
    // 小数部分
    if (decimalNum !== '') {
        let decLen = decimalNum.length;
        for (let i = 0; i < decLen; i++) {
            let n = decimalNum.substr(i, 1);
            if (n !== '0') {
                chineseStr += cnNums[Number(n)] + cnDecUnits[i];
            }
        }
    }
    if (chineseStr === '') {
        chineseStr += cnNums[0] + cnIntLast + cnInteger;
    } else if (decimalNum === '') {
        chineseStr += cnInteger;
    }
    return chineseStr;
}

// 节流
export const throttle = (fn, wait) => {
    let timer = null;
    return function(){
        let context = this;
        let args = arguments;
        if(!timer){
            timer = setTimeout(function(){
                fn.apply(context,args);
                timer = null;
            },wait)
        }
    }
}

// 防抖

export const debounce = (fn, wait) => {    
    let timeout = null;    
    return function() {  
        let context = this;
        let args = arguments;      
        if(timeout !== null) {
            clearTimeout(timeout);  
        }        
        timeout = setTimeout(function(){
            fn.apply(context,args);
        }, wait);    
    }
}

export const formatNumber = (value, precision = 2, roundtag = 'ceil') => {
    // Internal formatter
    let result
    let val = String(value);
    let cells = val.match(/^(-?)(\d*)(\.(\d+))?$/); // Process if illegal number

    if (!cells) {
        result = val;
    } else {
      let _int = cells[2] || '0';

      let decimal = cells[4] || '';
      _int = _int.replace(/\B(?=(\d{3})+(?!\d))/g, ',');
       decimal = Number('.' + decimal).toFixed(precision).slice(2)
       result = _int.concat('.').concat(decimal)
    }
    return value >= 0? result: `-${result}`
}

export const blobToFlie = (blob, filename, suffix) => {
    if (window.navigator.msSaveOrOpenBlob) {
        navigator.msSaveBlob(blob, `${filename}.${suffix}`);
    } else {
        let link = document.createElement("a");
        let evt = document.createEvent("HTMLEvents");
        evt.initEvent("click", false, false);
        link.href = URL.createObjectURL(blob); 
        link.download = `${filename}.${suffix}`;
        link.style.display = "none";
        document.body.appendChild(link);
        link.click();
        window.URL.revokeObjectURL(link.href);
    }
}

export const reWriteToFixed = () => {
    /*eslint no-extend-native: ["error", { "exceptions": ["Number"] }]*/
    Number.prototype.toFixed = function(len){
        if(len>20 || len<0){
            throw new RangeError('toFixed() digits argument must be between 0 and 20');
        }
        // .123转为0.123
        var number = Number(this);
        if (isNaN(number) || number >= Math.pow(10, 21)) {
            return number.toString();
        }
        if (typeof (len) === 'undefined' || len === 0) {
            return (Math.round(number)).toString();
        }
        var result = number.toString(),
            numberArr = result.split('.');
    
        if(numberArr.length<2){
            //整数的情况
            return padNum(result);
        }
        var intNum = numberArr[0], //整数部分
            deciNum = numberArr[1],//小数部分
            lastNum = deciNum.substr(len, 1);//最后一个数字
        
        if(deciNum.length === len){
            //需要截取的长度等于当前长度
            return result;
        }
        if(deciNum.length < len){
            //需要截取的长度大于当前长度 1.3.toFixed(2)
            return padNum(result)
        }
        //需要截取的长度小于当前长度，需要判断最后一位数字
        result = intNum + '.' + deciNum.substr(0, len);
        if(parseInt(lastNum, 10)>=5){
            //最后一位数字大于5，要进位
            var times = Math.pow(10, len); //需要放大的倍数
            var changedInt = Number(result.replace('.',''));//截取后转为整数
            changedInt++;//整数进位
            changedInt /= times;//整数转为小数，注：有可能还是整数
            result = padNum(changedInt+'');
        }
        return result;
        //对数字末尾加0
        function padNum(num){
            var dotPos = num.indexOf('.');
            if(dotPos === -1){
                //整数的情况
                num += '.';
                for(var i = 0;i<len;i++){
                    num += '0';
                }
                return num;
            } else {
                //小数的情况
                var need = len - (num.length - dotPos - 1);
                for(var j = 0;j<need;j++){
                    num += '0';
                }
                return num;
            }
        }
    }
}


