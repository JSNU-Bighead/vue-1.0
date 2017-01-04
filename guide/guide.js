Vue.component('guide',{
	template:'<div class="guid-wrap" v-if="guideShow">'+
            '<div class="guide-cover"></div>'+
            '<div class="guide-window" v-bind:style="windowStyleObj"></div> '+
            '<div class="guide-explain-wrap" v-bind:style="explainStyleObj">'+
                '<div v-bind:style="arrowStyleObj" v-if="explainPos==3 || explainPos==4" v-bind:class="{\'arrow-rb\': explainPos==3 , \'arrow-lb\': explainPos==4}" class="guide-arrow">'+
                '</div>'+
                '<p class="guide-explain" v-text="explainStr">'+
                '</p>'+
                '<div class="guide-btn next" v-on:click="clickFn()">'+
                    '<span v-text="guideObj.nextStr"></span>'+
                '</div>'+
                '<div v-bind:style="arrowStyleObj" v-if="explainPos==1 || explainPos==2" v-bind:class="{\'arrow-lt\': explainPos==1 , \'arrow-rt\': explainPos==2} " class="guide-arrow">'+
                '</div>'+
                // '<div class="guide-btn-group">'+
                //     '<div class="guide-btn pre" v-on:click="preFn()"><i class="fa fa-arrow-left"></i>pre</div>'+
                //     '<div class="guide-btn next" v-on:click="nextFn()">next<i class="fa fa-arrow-right"></i></div>'+
                // '</div>'+
            '</div>'+
		'</div>',
	props: {
        guideObj: Object
	},
	data: function() {
		return {
            guideShow: true,
			windowStyleObj: {},
			explainStyleObj: {},
            arrowStyleObj: {},
			explainStr: '',
            explainPos: 0,
            index: 0
		}
	},
	methods:{
		getTargetInfo: function(item){
            var element = document.querySelector(item.selector),
            	rect = element.getBoundingClientRect(),//兼容IE
		    	y = document.documentElement.clientTop,
		    	x= document.documentElement.clientLeft;
		    return {
		        top: rect.top - y + document.body.scrollTop,
		        bottom: rect.bottom - y + document.body.scrollTop,
		        left: rect.left - x + document.body.scrollLeft,
		        right: rect.right - x + document.body.scrollLeft,
		        width: element.clientWidth,
		        height: element.clientHeight
		    }
        },
        setWindow: function(item){
        	var obj = this.getTargetInfo(item);
        		styleObj = {};
        		styleObj.top = obj.top + 'px';
				styleObj.left = obj.left + 'px';
				styleObj.width = obj.width + 'px';
				styleObj.height = obj.height + 'px';
        	this.windowStyleObj = styleObj;
        },
        setExplain: function(item){
        	this.explainStr = item.explainStr;
            this.explainPos = item.explainPos;
        	this.$nextTick(function(){
        		var obj = this.getTargetInfo(item),
        			styleObj = {},
                    x = 0,
                    y = 0,
        			explainWidth = document.querySelector('.guide-explain').clientWidth;
        			explainWrapHeight = document.querySelector('.guide-explain-wrap').clientHeight;
        			position = item.explainPos || 3;//默认是3 右下
        		switch(position){
        			case 1:
                        this.arrowStyleObj = {
                            'margin-left': '100%'
                        }
        				styleObj.top = obj.top - explainWrapHeight - 10 + 'px';
        				styleObj.left = obj.left - explainWidth;
                        if(styleObj.left < 0){
                            styleObj.left = 0;
                        } else {
                            styleObj.left += 'px';
                        }
        				break;
        			case 2:
                        this.arrowStyleObj = {
                            'margin-left': '-75px'
                        }
        				styleObj.top = obj.top - explainWrapHeight - 10 + 'px';
        				styleObj.left = obj.right + 75;
                        if(styleObj.left > (document.body.offsetWidth - explainWidth)){
                            delete styleObj.left
                            styleObj.right = 0;
                        } else {
                            styleObj.left += 'px';
                        }
        				break;
        			case 3:
                        this.arrowStyleObj = {
                            'margin-left': '-75px'
                        }
        				styleObj.top = obj.bottom + 'px';
        				styleObj.left = obj.right + 75;
                        if(styleObj.left > (document.body.offsetWidth - explainWidth)){
                            delete styleObj.left
                            styleObj.right = 0;
                        } else {
                            styleObj.left += 'px';
                        }
        				break;
        			case 4:
                        this.arrowStyleObj = {
                            'margin-left': '100%'
                        }
        				styleObj.top = obj.bottom + 'px';
        				styleObj.left = obj.left - explainWidth;
                        if(styleObj.left < 0){
                            styleObj.left = 0;
                        } else {
                            styleObj.left += 'px';
                        }
        				break;
        		}
        		this.explainStyleObj = styleObj;
                //自动定位到引导处
                this.$nextTick(function(){
                    document.body.scrollTop = obj.top;
                    document.body.scrollLeft = obj.left;
                })
        	});
        },
        init: function(){
            this.setWindow(this.guideObj.guideList[this.index]);
            this.setExplain(this.guideObj.guideList[this.index]);
        },
        clickFn: function() {
            if(this.index < (this.guideObj.guideList.length-1)){
                this.index++;
                this.init()
            } else {
                this.guideShow = false;
                var readStatusObj = {
                    readed: true,
                    readTime: new Date().getTime()
                }
                window.localStorage.setItem('readStatusObj',JSON.stringify(readStatusObj));
            }
        }
	},
    created: function () {
        //引导页状态
        this.guideObj.nextStr = this.guideObj.nextStr || '我知道了';
        this.guideObj.guideInterval = this.guideObj.guideInterval || Number.POSITIVE_INFINITY;
        var guideStatusObj = JSON.parse(window.localStorage.getItem('readStatusObj')) || { readTime:0, readed:false},
            curTime = new Date().getTime();
        if (curTime < (guideStatusObj.readTime + this.guideObj.guideInterval) && guideStatusObj.readed) {//一周之内且打开过，则不出现
            this.guideShow = false;
        } else {
            this.guideShow = true;
        }
    },
	ready: function() {
        document.ondragstart = function () { return false; };
        document.ondbclick = function () { return false; };
        document.onselectstart = function () { return false; };
        window.addEventListener('resize',function(){
            if(this.guideShow){
                this.init();
            }
        }.bind(this));
		if(this.guideShow){
            this.init();
        }
	}
})