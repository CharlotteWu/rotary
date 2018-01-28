//////////////////////////////////////
Vue.component('odd',{
    template:'<p>' +
    '<span class="area-content-title">' +
    '{{award}}概率：' +
    '</span>' +
    '<span class="area-content">' +
    '<input type="text" ref="input" :value="value" @input="updateValue($event.target.value)" @focus="selectAll" @blur="formatValue">％' +
    '</span>' +
    '</p>',

    props:{
        value: {
            type: Number,
            default: 0
        },
        award: {
            type: String,
            default: ''
        }
    },
    mounted: function () {
        this.formatValue();
    },
    methods: {
        updateValue: function (value) {
            var result = currencyValidator.parse(value, this.value);
            if (result.warning) {
                this.$refs.input.value = result.value;
            }
            this.$emit('input', result.value);

        },
        formatValue: function () {
            this.$refs.input.value = currencyValidator.format(this.value);
        },
        selectAll: function (event) {
            setTimeout(function () {
                event.target.select()
            }, 0)
        }
    }
});





//获取全部瓣
var sectors = document.getElementsByClassName('sector');
var item = document.getElementsByClassName('item');
var area = document.getElementsByClassName('area');
var forceWatch = document.getElementById('force-watch');
var total = document.getElementById('total');
var isIE = /msie/i.test(navigator.userAgent) && !window.opera;
var rotaryContent = document.getElementById('rotaryContent');

//////////////////////////////////////////////////////////////////

new Vue({
    el:'#content',
    data:{
        items:[
            {prize:'一等奖',description:'奖瓶'},
            {prize:'一等奖',description:'奖瓶'},
            {prize:'一等奖',description:'奖瓶'},
        ],
        tabs:['基础设置','轮盘瓣设置','概率设置'],
        selected: 0,//瓣数选择
        current:0,//选项卡选择
        isActived:false,//选择当前的选项卡
        picked:'yes',//基础设置中的是否强制关注的选项值
        odds:[],//设置概率的数组
        initTotal:100,//初始化总概率
        rotaryFull:false,//轮盘错误提示
        rotaryWarn:'',//轮盘错误警告内容
        fileOversize:false,//文件超出提示
        fileWarn:'',//文件超出警告内容
        alreadyShowRotary:false,//已经展示轮盘提示标志
        rotaryLengthFull:false,//长度未满
        rotaryContentWarn:'',//轮盘错误提示内容
        focusContentLength:false,//关注说明文字标志
        focusContentLengthWarn:'',//关注说明文字警告
        startVal:false,//开始日期标志
        endVal:false,//结束日期标志
        startDate:'',//开始日期
        endDate:'',//结束日期
        startDateWarn:'',//开始日期警告
        endDateWarn:'',//结束日期警告
    },
    methods:{
        getIndex:function (index) {
            this.selected = index;

            //消除之前的轮盘设置的内容条件，再进行
            this.rotaryLengthFull = false;
            this.rotaryContentWarn = '';
            if(this.items[this.selected].description.length > 4){
                this.rotaryLengthFull = true;
                this.rotaryContentWarn = '内容不能超过4个字';
            }
            if(this.items[this.selected].description.length == 0){
                this.rotaryLengthFull = true;
                this.rotaryContentWarn = '内容不能为空';
            }

            //复原rotary界限条件（过多或过少）
            this.rotaryWarn='';
            this.rotaryFull = false;
        },
        insert:function () {
            var addContent = document.getElementById('addContent');
            this.rotaryFull = false;
            this.rotaryWarn = '';

            if(this.items.length >= 9){
                addContent.setAttribute('disabled','disabled');
                this.rotaryFull = true;
                this.rotaryWarn = '轮盘瓣不能超过9瓣';

            }else{
                addContent.removeAttribute('disabled');
                this.items.push({prize:'一等奖',description:'奖瓶'});
            }
        },
        remove:function (index) {
            //在此之前已经为3瓣
            //在disabled存在的情况下清空
            if(this.rotaryFull === false){
                var addContent = document.getElementById('addContent');
                if(addContent.getAttribute('disabled') != ''){
                    addContent.removeAttribute('disabled');
                }
                if(this.items.length == 3){
                    this.rotaryFull = true;
                    this.rotaryWarn = '轮盘瓣不能少于3瓣';
                }else{
                    this.rotaryFull = false;
                    this.items.splice(index,1);
                }
            }
        },
        getTabsIndex:function (index) {
            this.current = index;

            for(var j=0;j<this.tabs.length;j++){
                area[j].style.display = 'none';
            }
            area[this.current].style.display = 'block';

            //如果是点击第三个tab时，过滤下目前以选择的奖项数组，进行设置概率
            //如果之前有已存在的概率设置，只添加新的概率进去

            if(this.current == 2){
                var oddTotal = [];

                for(var k=0;k<this.items.length;k++){
                    oddTotal.push(this.items[k].prize);
                }
                //数组去重
                function reset(array) {
                    return Array.from(new Set(array));
                }

                oddTotal = reset(oddTotal);

                //是否与现有的概率数组中有重复的元素，有的话删除
                for(var c = 0;c<this.odds.length;c++){
                    for(var d = 0;d<oddTotal.length;d++){
                        if(this.odds[c].award === oddTotal[d]){
                            oddTotal.splice(d,1);
                        }
                    }
                }
                for(var a = 0;a<oddTotal.length;a++){
                    this.odds.push({award:''+ oddTotal[a] +'',odd:0});
                }

            }

        },
        fileChange:function (event) {
            var target = event.currentTarget;
            var fileSize = 0;
            if (isIE && !target.files) {    // IE浏览器
                var filePath = target.value; // 获得上传文件的绝对路径
                var fileSystem = new ActiveXObject("Scripting.FileSystemObject");
                var file = fileSystem.GetFile(filePath);
                fileSize = file.Size;    // 文件大小，单位：b
            }
            else {    // 非IE浏览器
                fileSize = target.files[0].size;
            }
            var size = fileSize / 1024 / 1024;

            if (size > 1) {
                this.fileOversize = true;
                this.fileWarn = '图片不能超过1M';
                target.value='';
            }
        },
        initFileStatus:function () {
            this.fileOversize = false;
            this.fileWarn = '';
        },
        watchInputLength:function (t) {
            var t = event.currentTarget;
            this.rotaryLengthFull = false;
            this.rotaryContentWarn = '';

            if(t.value.length > 4){
                this.rotaryLengthFull = true;
                this.rotaryContentWarn = '内容不能超过4个字';
            }
            if(t.value.length == 0){
                this.rotaryLengthFull = true;
                this.rotaryContentWarn = '内容不能为空';
            }
        },
        watchFocusLength:function (t) {
            var t = event.currentTarget;
            this.focusContentLength = false;
            this.focusContentLengthWarn = '';

            if(t.value.length > 10){
                this.focusContentLength = true;
                this.focusContentLengthWarn = '内容不能超过10个字';
            }
            if(t.value.length == 0){
                this.focusContentLength = true;
                this.focusContentLengthWarn = '内容不能为空';
            }
        },
        checkStatus:function () {
             var status = '';
             if(this.total != 0){
                 status += '概率尚未分配完毕;'
             }
             for(var e=0;e<this.items.length;e++){
                 if(this.items[e].description.length == 0 ||this.items[e].description.length >4){
                     status += '轮盘有内容违规;';
                     break;
                 }
             }

            if(this.startDate == ''){
                this.startVal = true;
                this.startDateWarn = '开始日期不能为空';
            }
            if(this.endDate == ''){
                this.endVal = true;
                this.endDateWarn = '结束日期不能为空';
            }
            if(this.picked == 'yes'){
                if(document.getElementById('file').value == ''){
                    this.fileOversize = true;
                    this.fileWarn = '图片不能为空';
                }
                if(this.focusContentLength == true || document.getElementById('focus').value.length == 0){
                    this.focusContentLength = true;
                    this.focusContentLengthWarn = '关注公众号说明内容不符合规格';
                }
            }

             alert(status+',请重新填写。');
        }

    },

    computed:{
        total:function () {
            var t = 0;
            this.initTotal = 100;
            for(var b=0;b<this.odds.length;b++){
                if(this.odds[b].odd > 100){
                    this.odds[b].odd = 0;
                }
                t += this.odds[b].odd;
            }

            if((this.initTotal - t) < 0){
                return total.innerText = '当前概率已超100'
            }else{
                this.initTotal = this.initTotal -t;
                return this.initTotal;
            }

        }
    },
    watch:{
        'startDate':function (val) {
            if(val == ''){
                this.startVal = true;
                this.startDateWarn = '开始日期不能为空';
            }else{
                this.startVal = false;
            }
        },
        'endDate':function (val) {
            if(val == ''){
                this.endVal = true;
                this.endDateWarn = '结束日期不能为空';
            }else{
                this.endVal = false;
            }
        },
    }

});


////////////////////////////////////////////////////////////////

window.setInterval(function () {
    //判断瓣数
    //
    ////根据所需瓣数生成对应形状 可视区和编辑区
    for(var i=0;i<sectors.length;i++){
        var rSkew = 360/sectors.length;
        var shape = 'rotate('+ Math.floor((i*rSkew)) +'deg) skew('+ Math.floor((90-rSkew)) +'deg)';

        ////展示区和编辑区的大小
        sectors[i].style.transform = shape;
        item[i].style.transform = 'skew('+ Math.floor((90-rSkew)*(-1)) +'deg) rotate('+ Math.floor((90-rSkew/2)*(-1)) +'deg) ';
    }

},10);



