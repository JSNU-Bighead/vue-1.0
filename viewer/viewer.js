Vue.component('viewer', {
		template: '<div v-on:click="showModal()">'+
				'<slot >'+
					'<div style="display:inline-block;cursor:pointer;color:#f60;">查看</div>'+
				'</slot>'+
			'</div>'+
			'<div class="viewer-modal-wrapper" v-show="show">' +
				'<div class="viewer-modal">' +
					'<viewer-content v-ref:content v-bind:viewer-list="dataList" v-bind:flag="viewerData.flag"></viewer-content>' +
				'<div class="close" @click="close()"></div>' +
			'</div>' +
		'</div>',
		data: function() {
			return {
				show: false,
				dataList: []
			}
		},
		props: {
			viewerData: {
				type: Object,
				required: true
			}
		},
		methods: {
			showModal: function() {
				this.show = true;
				this.$nextTick(function() {
					this.$refs.content.MarginInit();
				})
			},
			close: function() {
				this.show = false;
			}
		},
		created: function(){
			var _this = this;
			$.ajax({
	            url: _this.viewerData.url,
	            type: 'GET',
	            dataType: 'JSON',
	            success: function(data){
	            	for(var i = 0; i < data.length; i++){
	            		var type = data[i].fileName.substring(data[i].fileName.lastIndexOf('.') + 1).toLowerCase();
	            		data[i].fileType = type.toUpperCase();
	            		data[i].isImage = false;
	            		data[i].isPDF = false;
	            		switch(type) {
	            			case 'gif':
	            			case 'jpg':
	            			case 'jpeg':
	            			case 'bmp':
	            			case 'png':
	            			case 'iff':
	            				data[i].isImage = true;
	            				break;
	            			case 'pdf':
	            				data[i].isPDF = true;
	            				break;
	            			default: 
	            				break;
	            		}
	            	}
	            	_this.dataList = data;
	            }
			})
		}
	});

	Vue.component('viewer-content', {
		template: '<div class="viewer-wrapper" onselectstart="return false">'+
		    '<div class="viewer-nav-wrapper" v-bind:flag="flag">'+
		        '<ul class="viewer-nav-list">'+
		            '<li v-for="item in viewerList" v-bind:class="{current: $index == currentNav}" v-on:click="move($index)">'+
		                '<span v-if="!item.isImage" class="file-type" v-text="item.fileType" v-bind:title="item.fileName"></span>'+
		                '<img v-else v-bind:src="item.filePath" v-bind:title="item.fileName">'+
		            '</li>'+
		        '</ul>'+
		    '</div>'+
		    '<div class="viewer-content-wrapper">'+
		        '<div class="viewer-content-item" v-bind:flag="flag" v-for="item in viewerList" v-bind:class="{active: $index == currentNav}">'+
		            '<div class="viewer-tool" v-show="item.isImage" v-on:mouseenter="offFn($event)">'+
		                '<ul>'+
		                    '<li v-on:click="reset($event)"></li>'+
		                    '<li v-on:click="biger($event)"></li>'+
		                    '<li v-on:click="smaller($event)"></li>'+
		                    '<li v-on:click="turnLeft($event)"></li>'+
		                    '<li v-on:click="turnRight($event)"></li>'+
		                    '<li v-on:click="turnUpDown($event)"></li>'+
		                    '<li v-on:click="turnLeftRight($event)"></li>'+
		                '</ul>'+
		            '</div>'+
		            '<div class="viewer-imgbar" v-if="item.isImage">'+
		                '<img class="drag-able" v-bind:src="item.filePath" v-on:mousedown="startMove($event)" v-on:mouseup="endMove($event)" v-on:mousewheel="mouseWheel()" v-on:DOMMouseScroll="mouseWheel()">'+
		            '</div>'+
		            '<iframe v-if="item.isPDF" v-bind:src="item.filePath"></iframe>'+
		            '<div v-if="!item.isImage && !item.isPDF" class="cant-wrapper">'+
		                '<div class="cant-icon"></div>'+
		                '<p class="cant-text">抱歉，此文件暂不能预览。</p>'+
		            '</div>'+
		        '</div>'+
		    '</div>'+
		'</div>',
		data: function() {
			return {
				currentNav: 0,
				transformObj: {
					x: 1,
					y: 1,
					deg: 0
				},
				mousePos: {}
			}
		},
		props: {
			viewerList: {
				type: Array,
				required: true
			},
			flag: String
		},
		methods: {
			MarginInit: function() {
				var marginTopImg = ($('.viewer-content-item.active'+'[flag='+this.flag+']').height() - 115 - $('.viewer-content-item.active'+'[flag='+this.flag+']'+' .viewer-imgbar').height()) / 2,
					marginTopOffice = ($('.viewer-content-item.active'+'[flag='+this.flag+']').height() - 115 - 206) / 2;
				marginTopImg = marginTopImg > 0 ? marginTopImg : 0;
				marginTopOffice = marginTopOffice > 0 ? marginTopOffice : 0;
				$('.viewer-content-item.active'+'[flag='+this.flag+']'+' .viewer-imgbar').css({
					'margin-top': marginTopImg
				})
				$('.viewer-content-item.active'+'[flag='+this.flag+']'+' .cant-wrapper').css({
					'margin-top': marginTopOffice
				})
			},
			move: function(index) {
				//换之前重置图片尺寸
				this.transformObj.x = 1;
				this.transformObj.y = 1;
				this.transformObj.deg = 0;
				var transform = 'scale(' + this.transformObj.x + ',' + this.transformObj.y + ')' + 'rotate(' + this.transformObj.deg + 'deg)';
				$('.viewer-content-item'+'[flag='+this.flag+']'+' .viewer-imgbar img').css({
					'transform': transform,
					'transform-origin': '50% 50%'
				})
				var defaultMargin = $('.viewer-nav-wrapper'+'[flag='+this.flag+']').width(),
					currentMargin = defaultMargin / 2 - 44 * index;
				this.currentNav = index;
				this.$nextTick(function() {
					this.MarginInit();
				})
				$('.viewer-nav-wrapper'+'[flag='+this.flag+']'+' .viewer-nav-list').css({
					marginLeft: currentMargin
				});
			},
			reset: function(e) {
				this.transformObj.x = 1;
				this.transformObj.y = 1;
				this.transformObj.deg = 0;
				this.transformFn(e, this.transformObj)
			},
			biger: function(e) {
				if (Math.abs(this.transformObj.x) > 3) return;
				if (this.transformObj.x > 0) {
					this.transformObj.x += .1;
				} else {
					this.transformObj.x -= .1;
				}
				if (this.transformObj.y > 0) {
					this.transformObj.y += .1;
				} else {
					this.transformObj.y -= .1;
				}

				this.transformFn(e, this.transformObj)
			},
			smaller: function(e) {
				if (Math.abs(this.transformObj.x) < 0.2) return;
				if (this.transformObj.x > 0) {
					this.transformObj.x -= .1;
				} else {
					this.transformObj.x += .1;
				}
				if (this.transformObj.y > 0) {
					this.transformObj.y -= .1;
				} else {
					this.transformObj.y += .1;
				}
				this.transformFn(e, this.transformObj)
			},
			turnRight: function(e) {
				this.transformObj.deg += 90;
				this.transformFn(e, this.transformObj)
			},
			turnLeft: function(e) {
				this.transformObj.deg -= 90;
				this.transformFn(e, this.transformObj)
			},
			turnUpDown: function(e) {
				this.transformObj.y = -this.transformObj.y;
				this.transformFn(e, this.transformObj)
			},
			turnLeftRight: function(e) {
				this.transformObj.x = -this.transformObj.x;
				this.transformFn(e, this.transformObj)
			},
			transformFn: function(e, transformObj) {
				var img = $(e.target).closest('.viewer-tool').next('.viewer-imgbar').children('img'),
					transform = 'scale(' + transformObj.x + ',' + transformObj.y + ')' + 'rotate(' + transformObj.deg + 'deg)';
				img.css({
					'transform': transform,
					'transform-origin': '50% 50%'
				})
			},
			/*实现拖拽*/
			/*获取鼠标位置*/
			startMove: function(e){
				var _this = this;
				//获取初始位置
				this.mousePos = this.getMousePos();
				console.log('开始了');
				$(document).on('mousemove',function(){
					_this.moving(e);
				});
			},
			getMousePos: function() {
				var x, y;
				var e = window.event;
				return {
					x: e.clientX + document.body.scrollLeft + document.documentElement.scrollLeft,
					y: e.clientY + document.body.scrollTop + document.documentElement.scrollTop
				};
			},
			getImgPos: function(e) {
				return {
					top: parseInt($(e.target).closest('.viewer-imgbar').css('top').replace('px','')),
					left: parseInt($(e.target).closest('.viewer-imgbar').css('left').replace('px',''))
				}
			},
			moving: function(e) {
				console.log('动了');
				var curMousePos = this.getMousePos(),
					curImgPos = this.getImgPos(e),
					left = curImgPos.left + (curMousePos.x - this.mousePos.x),
					top = curImgPos.top + (curMousePos.y - this.mousePos.y);
					this.mousePos = curMousePos;
				$(e.target).closest('.viewer-imgbar').css({
					'left': left,
					'top': top
				});

			},
			endMove: function(e){
				var _this = this;
				console.log('结束了');
				$(document).off('mousemove');
			},
			offFn: function(e){
				$(e.target).next('.viewer-imgbar').children('.drag-able').off('mousemove');
			},
			// 当滚轮事件发生时，执行mouseWheel这个函数
			mouseWheel: function() {
				var e = window.event,
					down = true,
					$e = {};
				$e.target = $('.viewer-content-item.active'+'[flag='+this.flag+']'+' .viewer-tool li')[0],
					down = e.wheelDelta ? e.wheelDelta < 0 : e.detail > 0; //不同浏览器判断是否为下滚
				if (down) {
					this.smaller($e);
				} else {
					this.biger($e)
				}
			}
		},
		ready: function() {
			window.onresize = function() {
				this.move(this.currentNav);
				this.MarginInit();
			}.bind(this);
			window.ondragstart = function() {
				return false;
			}
		}
	});