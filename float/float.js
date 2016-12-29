Vue.component('float', {
    template: '<div id="float" class="float-wrap" v-on:mouseenter="stopFloat()" v-on:mouseleave="startFloat" v-if="canSee">'+
            '<div class="float-content">'+
                '<em class="fa fa-close" v-on:click="close()"></em>'+
                '<slot name="body">'+
                	'<p>'+
                	    '想了解报销操作全流程？'+
                	'</p>'+
                	'<div>'+
                	    '<div class="btn">帮助中心</div>'+
                	    '<a class="btn" href="" target="_blank">在线视频</a>'+
                	'</div>'+
                '</slot>'+
            '</div>'+
		'</div>',
    props: {},
    data: function(){
    	return {
    		left: 0,
    		top: 0,//浮动框位置
    		width: 0,
    		height: 0,//浮动框的大小，组件加载之后获取
    		can_x: true,
    		can_y: true,//浮动框x，y方向是否可以移动
    		client_w: 0,
    		client_h: 0, //屏幕的宽
    		step: 1, //每次移动步长
    		delay: 30,
    		interval: 0,
    		canSee: true
    	}
    },
    methods: {
    	floatFn: function(){
    		this.client_w = document.body.clientWidth;
            this.client_h = document.body.clientHeight;
            //x轴方向移动
			if(this.left > (this.client_w - this.width)){//最右边
				this.can_x = false;
				this.left = this.client_w - this.width;
			}
			if(this.left < 0){//最左边
				this.can_x = true;
				this.left = 0;
			}
			if(this.can_x){
				this.left += this.step;
			} else {
				this.left -= this.step;
			}
            float.style.left = this.left + document.body.scrollLeft + 'px';
            //y轴方向移动
            if(this.top > (this.client_h - this.height)){//最下边
				this.can_y = false;
				this.top = this.client_h - this.height;
			}
			if(this.top < 0){//最上边
				this.can_y = true;
				this.top = 0;
			}
			if(this.can_y){
				this.top += this.step;
			} else {
				this.top -= this.step;
			}
            float.style.top = this.top + document.body.scrollTop + 'px';
		},
		startFloat: function(){
			this.interval = setInterval(this.floatFn,this.delay);
		},
		stopFloat: function(){
			clearInterval(this.interval)
		},
		close: function(){
			this.canSee = false;
			this.stopFloat();
		}
    },
    ready: function(){
    	//浮动框起始位置在左上角
    	this.left = 10;
    	this.top = 10;
    	//浮动框大小
    	this.width = float.offsetWidth;
    	this.height = float.offsetHeight;
    	this.startFloat();
    }
})