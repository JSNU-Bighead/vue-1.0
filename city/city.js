//正常显示模块
var cityBlock = {
    template: '<div class="city-panel">' +
                    '<div class="city-explain">可直接输入城市或城市拼音</div>' +
                    '<div class="city-nav-wrapper">' +
                        '<ul class="city-tab-nav">' +
                            '<li class="city-tab-item current" v-on:click="changeTab($event)">境外</li>' +
                            '<li class="city-tab-item" v-on:click="changeTab($event)">ABCDEF</li>' +
                            '<li class="city-tab-item" v-on:click="changeTab($event)">GHJKLM</li>' +
                            '<li class="city-tab-item" v-on:click="changeTab($event)">NPQRS</li>' +
                            '<li class="city-tab-item" v-on:click="changeTab($event)">TWXYZ</li>' +
                        '</ul>' +
                    '</div>' +
                    '<div class="city-content-wrapper">' +
                        '<div class="city-tab-content" v-for="item in cityBlockData" v-bind:class="{none: $index!=0}">' +
                            '<div class="city-list-container" v-for="cityBag in item">' +
                                '<div class="city-first-code" v-if="cityBag.FirstCode !== \'OVERSEA\'" v-text="cityBag.FirstCode"></div>' +
                                '<div class="city-list">' +
                                    '<span v-on:click="selectCity($event)" v-for="city in cityBag.Cities" class="city-name" v-bind:title="city.Name" v-bind:cname="city.Name" v-bind:cid="city.ID" v-bind:clevel="city.CityLevel" v-text="city.Name"></span>' +
                                '</div>' +
                            '</div>' +
                        '</div>' +
                    '</div>' +
                '</div>',
    props: {
        cityBlockData: Array,
        selectCity: Function,
        changeTab: Function
    }
};
var citys = [];
//搜索模块
var citySearch = {
    template: '<div class="city-panel-seach">' +
                    '<div class="city-explain">输入中文/拼音/首字母</div>' +
                    '<ul>' +
                        '<li v-for="item in citySearchData" v-on:click="selectCity($event)" v-bind:cname="item.Name" v-bind:cid="item.ID" v-bind:clevel="item.CityLevel">' +
                            '<span class="city-search-name" v-bind:class="{hasCity : item.ID != 0}" v-text="item.Name" v-bind:title="item.Name"></span>' +
                            '<span v-if="item.ID != 0" class="city-search-sub hasCity">{{item.EnglishName}}</span>' +
                        '</li>' +
                    '</ul>' +
                '</div>',
    props: {
        citySearchData: Array,
        selectCity: Function
    }
};
Vue.component('city', {
    template: '<div class="city-wrapper">' +
                '<input type="text" id="city-val" placeholder="选择城市" v-on:click="showPanel($event)" v-on:input="filterCity()" v-model="cityObj.cityName" />' +
                '<input type="hidden" id="city-id" v-model="cityObj.cityId" />' +
                '<input type="hidden" id="city-level" v-model="cityObj.cityLevel" />' +
                '<city-block v-show="showWhich==1" v-bind:city-block-data="cityData" v-bind:select-city="selectCity" v-bind:change-tab="changeTab"></city-block>' +
                '<city-search v-show="showWhich==2" v-bind:city-search-data="searchData" v-bind:select-city="selectCity"></city-search>' +
            '</div>',
    methods: {
        showPanel: function () {
            citys.forEach(function (city) {
                city.showWhich = 0;
            })
            this.showWhich = 1;
        },
        changeTab: function (e) {
            var _this = $(e.currentTarget),
                index = _this.index();
            _this.addClass('current').siblings().removeClass('current');
            _this.closest('.city-panel').children('.city-content-wrapper').children('.city-tab-content').eq(index).removeClass('none').siblings().addClass('none');
        },
        selectCity: function (e) {
            var name = $(e.currentTarget).attr('cname'),
                id = $(e.currentTarget).attr('cid'),
                level = $(e.currentTarget).attr('clevel'),
                $cityWrapper = $(e.currentTarget).closest('.city-wrapper');
            if (id != 0) {
                $cityWrapper.find('#city-val').val(name).trigger('input');
                $cityWrapper.find('#city-id').val(id).trigger('input');
                $cityWrapper.find('#city-level').val(level).trigger('input');
                this.showWhich = 0;
            } else {
                return;//ID为0 表示没有搜索到所查找城市
            }
        },
        filterCity: function () {
            //清空上一次搜索结果
            this.searchData = [];
            var str = '^' + this.cityObj.cityName.trim().toLowerCase(),
                temp = [],
                reg = new RegExp(str);
            if (this.cityObj.cityName.trim() == '') {
                this.showWhich = 0;
                return;
            } else {
                for (var i = 0; i < this.totalData.length; i++) {
                    //首字母，拼音，汉字识别
                    if (reg.test(this.totalData[i].shortName) || reg.test(this.totalData[i].spellName) || reg.test(this.totalData[i].Name)) {
                        temp.push(this.totalData[i])
                    }
                }
                if (temp.length) {
                    this.searchData = temp;
                } else {
                    this.searchData.push({
                        Name: '对不起，未找到：' + this.cityObj.cityName.trim(),
                        ID: 0,
                        CityLevel: 0,
                        shortName: '',
                        spellName: ''
                    })
                }
                this.showWhich = 2;
            }
        }
    },
    props: {
        cityObj: Object,
        cityUrl: String
    },
    components: {
        'cityBlock': cityBlock,
        'citySearch': citySearch
    },
    data: function () {
        return {
            cityData: [],//接口返回值
            totalData: [],//所有的城市
            searchData: [],//符合当前收缩条件的城市
            showWhich: 0//用来表示显示哪个panel，0 表示都不显示，1表示显示block, 2表示显示search
        }
    },
    created: function () {
        var arr = [],
            _this = this;
        //从接口请求数据
        $.ajax({
            url: _this.cityUrl,
            type: 'GET',
            dataType: 'JSON',
            success: function (data) {
                if (data) {
                    //将数据分组
                    var sArr = [],//境外
                        arr1 = [],
                        arr2 = [],
                        arr3 = [],
                        arr4 = [];
                    for (var i = 0; i < data.length; i++) {
                        switch (data[i].FirstCode) {
                            case "OVERSEA":
                                sArr.push(data[i]);
                                break;
                            case "A":
                            case "B":
                            case "C":
                            case "D":
                            case "E":
                            case "F":
                                arr1.push(data[i]);
                                break;
                            case "G":
                            case "H":
                            case "J":
                            case "K":
                            case "L":
                            case "M":
                                arr2.push(data[i]);
                                break;
                            case "N":
                            case "P":
                            case "Q":
                            case "R":
                            case "S":
                                arr3.push(data[i]);
                                break;
                            case "T":
                            case "W":
                            case "X":
                            case "Y":
                            case "Z":
                                arr4.push(data[i]);
                                break;
                        }
                    }
                    _this.cityData.push(sArr, arr1, arr2, arr3, arr4);
                    //获得所有城市对象
                    for (var i = 0; i < _this.cityData.length; i++) {
                        for (var j = 0; j < _this.cityData[i].length; j++) {
                            arr = arr.concat(_this.cityData[i][j].Cities)
                        }
                    }
                    //为数据添上名称缩写和拼音全写
                    for (var i = 0; i < arr.length; i++) {
                        var obj = arr[i];
                        obj.shortName = getInitialOne(obj.Name).toLowerCase();
                    }
                    _this.totalData = arr;
                }
            }
        });
    },
    ready: function () {
        var _this = this;
        citys.push(this);
        $(function () {
            //点击空白处，panel消失
            $(document).on('click', function () {
                _this.showWhich = 0;
            });
            $('.city-wrapper .city-panel').on('click', function (e) {
                e.stopPropagation()
            })
            $('.city-wrapper #city-val').on('click', function (e) {
                e.stopPropagation()
            })
            $('.city-wrapper .city-panel-seach').on('click', function (e) {
                e.stopPropagation()
            })
        })
    }
});